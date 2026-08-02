"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ActionError, withActionError } from "@/lib/action-error";
import { fetchGoodFirstIssues, fetchGithubRepoMeta } from "@/lib/github";
import {
  findExistingProjectByGithub,
  normalizeGithubRepoUrl,
} from "@/lib/github-url";
import { rankCandidatesForProject, scoreProjectForUser } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  importGithubSchema,
  inviteSchema,
  messageSchema,
  profileSchema,
  projectSchema,
} from "@/lib/validators";

export async function updateProfile(formData: FormData) {
  return withActionError(async () => {
    const user = await requireUser({ skipOnboarding: true });
    const parsed = profileSchema.parse({
      bio: formData.get("bio"),
      languages: formData.get("languages"),
      interestTags: formData.get("interestTags"),
      experienceLevel: formData.get("experienceLevel") ?? "beginner",
      openToInvites: formData.get("openToInvites") === "on",
      fromOnboarding: formData.get("fromOnboarding") === "1",
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        bio: parsed.bio,
        languages: parsed.languages,
        interestTags: parsed.interestTags,
        experienceLevel: parsed.experienceLevel,
        openToInvites: parsed.openToInvites,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/onboarding");
    revalidatePath("/discover");
    revalidatePath("/swipe");
    revalidatePath("/for-you");
    revalidatePath("/dashboard");

    if (parsed.fromOnboarding) {
      redirect("/for-you");
    }
  });
}

export async function syncProfileFromGithub() {
  const user = await requireUser({ skipOnboarding: true });
  const { getGithubAccessTokenForUser, applyGithubProfileInsights } =
    await import("@/lib/github-sync");

  const accessToken = await getGithubAccessTokenForUser(user.id);
  const result = await applyGithubProfileInsights(user.id, {
    accessToken,
    username: user.githubUsername,
    mode: "overwrite",
  });

  if (!result) {
    throw new ActionError(
      "Não foi possível analisar seu perfil no GitHub. Tente sair e entrar novamente."
    );
  }

  revalidatePath("/profile");
  revalidatePath("/onboarding");
  revalidatePath("/for-you");
  revalidatePath("/dashboard");

  return result.insight;
}

export type ProjectFilters = {
  language?: string;
  q?: string;
};

export async function listProjects(filters: ProjectFilters = {}) {
  const language = filters.language?.trim();
  const q = filters.q?.trim();

  return prisma.project.findMany({
    where: {
      AND: [
        language
          ? {
              languages: {
                has: language,
              },
            }
          : {},
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { tags: { has: q } },
              ],
            }
          : {},
      ],
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
          githubUsername: true,
        },
      },
      _count: {
        select: {
          interests: true,
          participations: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
          githubUsername: true,
          bio: true,
        },
      },
      interests: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              githubUsername: true,
              languages: true,
              bio: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      participations: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              githubUsername: true,
            },
          },
        },
      },
      issues: {
        orderBy: { number: "asc" },
      },
    },
  });
}

export async function listRecommendedProjects() {
  const user = await requireUser();

  const [projects, history] = await Promise.all([
    prisma.project.findMany({
      where: {
        ownerId: { not: user.id },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            githubUsername: true,
          },
        },
        _count: {
          select: {
            issues: true,
            interests: true,
          },
        },
      },
    }),
    prisma.matchInterest.findMany({
      where: { userId: user.id },
      include: {
        project: {
          select: { id: true, tags: true },
        },
      },
    }),
  ]);

  const likedTags = history
    .filter((item) => item.status === "pending" || item.status === "accepted")
    .flatMap((item) => item.project.tags);
  const rejectedProjectIds = new Set(
    history.filter((item) => item.status === "rejected").map((item) => item.projectId)
  );

  return projects
    .map((project) => {
      const breakdown = scoreProjectForUser(
        {
          languages: user.languages,
          interestTags: user.interestTags,
          experienceLevel: user.experienceLevel,
        },
        project,
        { likedTags, rejectedProjectIds },
        project.id
      );

      return {
        ...project,
        score: breakdown.score,
        breakdown,
      };
    })
    .filter((project) => project.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 24);
}

export async function createProject(formData: FormData) {
  return withActionError(async () => {
    const user = await requireUser();
    const parsed = projectSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
      githubLink: formData.get("githubLink"),
      languages: formData.get("languages"),
      tags: formData.get("tags"),
      lookingFor: formData.get("lookingFor"),
    });

    const githubLink = normalizeGithubRepoUrl(parsed.githubLink);
    const existing = await findExistingProjectByGithub({ githubLink });
    if (existing) {
      throw new ActionError(
        `Esse repositório já está cadastrado como "${existing.title}".`
      );
    }

    const project = await prisma.project.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        githubLink,
        languages: parsed.languages,
        tags: parsed.tags,
        lookingFor: parsed.lookingFor,
        source: "manual",
        ownerId: user.id,
      },
    });

    revalidatePath("/discover");
    revalidatePath("/projects/new");
    revalidatePath("/for-you");
    revalidatePath("/dashboard");
    return project.id;
  });
}

export async function importGithubProject(formData: FormData) {
  return withActionError(async () => {
    const user = await requireUser();
    const parsed = importGithubSchema.parse({
      githubUrl: formData.get("githubUrl"),
      lookingFor: formData.get("lookingFor"),
    });

    const match = parsed.githubUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
    if (!match) {
      throw new ActionError("Informe uma URL válida de repositório GitHub.");
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, "");

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "openmatch",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: 0 },
    });

    if (response.status === 403 || response.status === 429) {
      throw new ActionError(
        "Limite da API do GitHub atingido. Configure GITHUB_TOKEN ou tente mais tarde."
      );
    }

    if (!response.ok) {
      throw new ActionError("Não foi possível importar o repositório do GitHub.");
    }

    const data = (await response.json()) as {
      id: number;
      full_name: string;
      description: string | null;
      html_url: string;
      language: string | null;
      topics?: string[];
      stargazers_count?: number;
    };

    const githubLink = normalizeGithubRepoUrl(data.html_url);
    const existing = await findExistingProjectByGithub({
      githubLink,
      githubRepoId: String(data.id),
    });
    if (existing) {
      throw new ActionError(
        `Esse repositório já está cadastrado como "${existing.title}".`
      );
    }

    const project = await prisma.project.create({
      data: {
        title: data.full_name,
        description: data.description || `Repositório importado: ${data.full_name}`,
        githubLink,
        githubRepoId: String(data.id),
        languages: data.language ? [data.language] : [],
        tags: data.topics ?? [],
        lookingFor: parsed.lookingFor,
        starsCount: data.stargazers_count ?? null,
        source: "github_import",
        ownerId: user.id,
      },
    });

    revalidatePath("/discover");
    revalidatePath("/for-you");
    revalidatePath("/dashboard");
    return project.id;
  });
}

export async function getSwipeDeck() {
  const user = await requireUser();

  const [seen, projects, history] = await Promise.all([
    prisma.matchInterest.findMany({
      where: { userId: user.id },
      select: { projectId: true },
    }),
    prisma.project.findMany({
      where: {
        ownerId: { not: user.id },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            githubUsername: true,
          },
        },
        _count: {
          select: {
            issues: true,
            interests: true,
          },
        },
      },
    }),
    prisma.matchInterest.findMany({
      where: { userId: user.id },
      include: {
        project: { select: { id: true, tags: true } },
      },
    }),
  ]);

  const seenIds = new Set(seen.map((item) => item.projectId));
  const likedTags = history
    .filter((item) => item.status === "pending" || item.status === "accepted")
    .flatMap((item) => item.project.tags);
  const rejectedProjectIds = new Set(
    history.filter((item) => item.status === "rejected").map((item) => item.projectId)
  );

  return projects
    .filter((project) => !seenIds.has(project.id))
    .map((project) => {
      const breakdown = scoreProjectForUser(
        {
          languages: user.languages,
          interestTags: user.interestTags,
          experienceLevel: user.experienceLevel,
        },
        project,
        { likedTags, rejectedProjectIds },
        project.id
      );

      return {
        ...project,
        score: breakdown.score,
      };
    })
    .sort((a, b) => b.score - a.score || b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 20);
}

export async function expressInterest(projectId: string, interested: boolean) {
  const user = await requireUser();
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Projeto não encontrado.");
  if (project.ownerId === user.id) {
    throw new Error("Você não pode dar interesse no próprio projeto.");
  }

  if (!interested) {
    await prisma.matchInterest.upsert({
      where: {
        userId_projectId: { userId: user.id, projectId },
      },
      create: {
        userId: user.id,
        projectId,
        status: "rejected",
      },
      update: {
        status: "rejected",
      },
    });
    revalidatePath("/swipe");
    return;
  }

  await prisma.matchInterest.upsert({
    where: {
      userId_projectId: { userId: user.id, projectId },
    },
    create: {
      userId: user.id,
      projectId,
      status: "pending",
    },
    update: {
      status: "pending",
    },
  });

  await prisma.notification.create({
    data: {
      userId: project.ownerId,
      title: "Novo interesse no seu projeto",
      body: `${user.name ?? "Alguém"} demonstrou interesse em ${project.title}.`,
      href: `/dashboard`,
    },
  });

  revalidatePath("/swipe");
  revalidatePath("/inbox");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
}

export async function respondInterest(
  interestId: string,
  accept: boolean
) {
  const user = await requireUser();
  const interest = await prisma.matchInterest.findUnique({
    where: { id: interestId },
    include: { project: true, user: true },
  });

  if (!interest || interest.project.ownerId !== user.id) {
    throw new Error("Interesse inválido.");
  }

  await prisma.matchInterest.update({
    where: { id: interestId },
    data: { status: accept ? "accepted" : "rejected" },
  });

  if (accept) {
    await prisma.projectParticipation.upsert({
      where: {
        userId_projectId: {
          userId: interest.userId,
          projectId: interest.projectId,
        },
      },
      create: {
        userId: interest.userId,
        projectId: interest.projectId,
        isActive: true,
      },
      update: { isActive: true },
    });

    await prisma.notification.create({
      data: {
        userId: interest.userId,
        title: "Interesse aceito!",
        body: `Seu interesse em ${interest.project.title} foi aceito. Abra a thread do match para combinar os próximos passos.`,
        href: `/matches/${interest.projectId}`,
      },
    });
  }

  revalidatePath("/inbox");
  revalidatePath(`/projects/${interest.projectId}`);
  revalidatePath(`/matches/${interest.projectId}`);
}

export async function sendInvite(formData: FormData) {
  return withActionError(async () => {
    const user = await requireUser();
    const issueNumberRaw = String(formData.get("issueNumber") ?? "").trim();
    const issueNumber = issueNumberRaw ? Number(issueNumberRaw) : null;
    const parsed = inviteSchema.parse({
      projectId: formData.get("projectId"),
      toUserId: formData.get("toUserId"),
      message: String(formData.get("message") ?? "").trim() || null,
      issueNumber: Number.isFinite(issueNumber) ? issueNumber : null,
    });

    const issueUrl =
      (parsed.issueNumber
        ? String(formData.get(`issue_${parsed.issueNumber}_url`) ?? "").trim()
        : "") || null;
    const issueTitle =
      (parsed.issueNumber
        ? String(formData.get(`issue_${parsed.issueNumber}_title`) ?? "").trim()
        : "") || null;

    const project = await prisma.project.findUnique({
      where: { id: parsed.projectId },
    });
    if (!project || project.ownerId !== user.id) {
      throw new ActionError("Projeto inválido.");
    }

    const invitee = await prisma.user.findUnique({
      where: { id: parsed.toUserId },
    });
    if (!invitee?.openToInvites) {
      throw new ActionError("Este usuário não está aberto a convites.");
    }

    await prisma.invite.upsert({
      where: {
        toUserId_projectId: {
          toUserId: parsed.toUserId,
          projectId: parsed.projectId,
        },
      },
      create: {
        fromUserId: user.id,
        toUserId: parsed.toUserId,
        projectId: parsed.projectId,
        message: parsed.message,
        issueUrl,
        issueTitle,
        issueNumber: parsed.issueNumber ?? null,
        status: "pending",
      },
      update: {
        message: parsed.message,
        issueUrl,
        issueTitle,
        issueNumber: parsed.issueNumber ?? null,
        status: "pending",
      },
    });

    await prisma.notification.create({
      data: {
        userId: parsed.toUserId,
        title: issueTitle ? "Convite para uma issue" : "Novo convite de projeto",
        body: issueTitle
          ? `${user.name ?? "Um mantenedor"} convidou você para #${parsed.issueNumber} ${issueTitle} em ${project.title}.`
          : `${user.name ?? "Um mantenedor"} convidou você para ${project.title}.`,
        href: "/inbox",
      },
    });

    revalidatePath("/inbox");
    revalidatePath(`/projects/${parsed.projectId}`);
  });
}

export async function respondInvite(inviteId: string, accept: boolean) {
  const user = await requireUser();
  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
    include: { project: true },
  });

  if (!invite || invite.toUserId !== user.id) {
    throw new Error("Convite inválido.");
  }

  await prisma.invite.update({
    where: { id: inviteId },
    data: { status: accept ? "accepted" : "rejected" },
  });

  if (accept) {
    await prisma.projectParticipation.upsert({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: invite.projectId,
        },
      },
      create: {
        userId: user.id,
        projectId: invite.projectId,
        isActive: true,
      },
      update: { isActive: true },
    });

    await prisma.notification.create({
      data: {
        userId: invite.fromUserId,
        title: "Convite aceito",
        body: `${user.name ?? "Alguém"} aceitou o convite para ${invite.project.title}.`,
        href: `/matches/${invite.projectId}`,
      },
    });
  }

  revalidatePath("/inbox");
  revalidatePath(`/matches/${invite.projectId}`);
}

export async function syncProjectIssues(projectId: string) {
  const user = await requireUser();
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Projeto não encontrado.");
  if (project.ownerId !== user.id) {
    throw new Error("Só o mantenedor pode sincronizar issues.");
  }

  const [issues, meta] = await Promise.all([
    fetchGoodFirstIssues(project.githubLink),
    fetchGithubRepoMeta(project.githubLink),
  ]).catch(() => {
    throw new ActionError(
      "Falha ao falar com a API do GitHub. Verifique o link ou o GITHUB_TOKEN."
    );
  });

  await prisma.$transaction([
    prisma.projectIssue.deleteMany({ where: { projectId } }),
    ...issues.map((issue) =>
      prisma.projectIssue.create({
        data: {
          projectId,
          githubIssueId: String(issue.id),
          number: issue.number,
          title: issue.title,
          url: issue.html_url,
          labels: issue.labels.map((label) =>
            typeof label === "string" ? label : label.name
          ),
        },
      })
    ),
    prisma.project.update({
      where: { id: projectId },
      data: {
        issuesSyncedAt: new Date(),
        starsCount: meta?.starsCount ?? project.starsCount,
        languages:
          project.languages.length === 0 && meta?.language
            ? [meta.language]
            : project.languages,
        tags:
          project.tags.length === 0 && meta?.topics?.length
            ? meta.topics
            : project.tags,
      },
    }),
  ]);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/for-you");
  revalidatePath("/dashboard");
  return issues.length;
}

export async function syncAllProjectIssues(limit = 20) {
  const projects = await prisma.project.findMany({
    orderBy: [{ issuesSyncedAt: "asc" }, { updatedAt: "asc" }],
    take: limit,
    select: { id: true, githubLink: true, ownerId: true, languages: true, tags: true, starsCount: true },
  });

  let synced = 0;
  const errors: string[] = [];

  for (const project of projects) {
    try {
      const [issues, meta] = await Promise.all([
        fetchGoodFirstIssues(project.githubLink),
        fetchGithubRepoMeta(project.githubLink),
      ]);

      await prisma.$transaction([
        prisma.projectIssue.deleteMany({ where: { projectId: project.id } }),
        ...issues.map((issue) =>
          prisma.projectIssue.create({
            data: {
              projectId: project.id,
              githubIssueId: String(issue.id),
              number: issue.number,
              title: issue.title,
              url: issue.html_url,
              labels: issue.labels.map((label) =>
                typeof label === "string" ? label : label.name
              ),
            },
          })
        ),
        prisma.project.update({
          where: { id: project.id },
          data: {
            issuesSyncedAt: new Date(),
            starsCount: meta?.starsCount ?? project.starsCount,
            languages:
              project.languages.length === 0 && meta?.language
                ? [meta.language]
                : project.languages,
            tags:
              project.tags.length === 0 && meta?.topics?.length
                ? meta.topics
                : project.tags,
          },
        }),
      ]);
      synced += 1;
    } catch (error) {
      errors.push(
        `${project.id}: ${error instanceof Error ? error.message : "erro"}`
      );
    }
  }

  revalidatePath("/for-you");
  revalidatePath("/dashboard");
  return { synced, total: projects.length, errors };
}

export async function getMaintainerDashboard() {
  const user = await requireUser();

  const projects = await prisma.project.findMany({
    where: { ownerId: user.id },
    include: {
      _count: {
        select: {
          interests: true,
          invites: true,
          participations: true,
          issues: true,
          messages: true,
        },
      },
      interests: {
        where: { status: "pending" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              githubUsername: true,
              languages: true,
              interestTags: true,
              experienceLevel: true,
              bio: true,
              image: true,
              openToInvites: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const interestStats = await prisma.matchInterest.groupBy({
    by: ["status"],
    where: { project: { ownerId: user.id } },
    _count: { _all: true },
  });

  const openContributors = await prisma.user.findMany({
    where: {
      openToInvites: true,
      id: { not: user.id },
    },
    select: {
      id: true,
      name: true,
      githubUsername: true,
      languages: true,
      interestTags: true,
      experienceLevel: true,
      openToInvites: true,
      bio: true,
      image: true,
    },
    take: 50,
  });

  const projectViews = projects.map((project) => {
    const ranked = rankCandidatesForProject(project, openContributors).slice(0, 5);
    return {
      ...project,
      suggestedCandidates: ranked,
      pendingCount: project.interests.length,
    };
  });

  const stats = {
    projects: projects.length,
    pendingInterests: interestStats.find((s) => s.status === "pending")?._count._all ?? 0,
    acceptedInterests: interestStats.find((s) => s.status === "accepted")?._count._all ?? 0,
    rejectedInterests: interestStats.find((s) => s.status === "rejected")?._count._all ?? 0,
    openIssues: projects.reduce((sum, p) => sum + p._count.issues, 0),
    activeParticipants: projects.reduce((sum, p) => sum + p._count.participations, 0),
  };

  return { stats, projects: projectViews };
}

async function assertMatchAccess(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      participations: {
        where: { userId, isActive: true },
        select: { id: true },
      },
      interests: {
        where: { userId, status: "accepted" },
        select: { id: true },
      },
    },
  });

  if (!project) throw new Error("Projeto não encontrado.");

  const allowed =
    project.ownerId === userId ||
    project.participations.length > 0 ||
    project.interests.length > 0;

  if (!allowed) {
    throw new Error("Você não tem acesso a esta thread.");
  }

  return project;
}

export async function getMatchThread(projectId: string) {
  const user = await requireUser();
  const project = await assertMatchAccess(user.id, projectId);

  const messages = await prisma.matchMessage.findMany({
    where: { projectId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
          githubUsername: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return { project, messages, currentUserId: user.id };
}

export async function sendMatchMessage(formData: FormData) {
  return withActionError(async () => {
    const user = await requireUser();
    const parsed = messageSchema.parse({
      projectId: formData.get("projectId"),
      body: formData.get("body"),
    });

    const project = await assertMatchAccess(user.id, parsed.projectId);

    await prisma.matchMessage.create({
      data: {
        projectId: parsed.projectId,
        senderId: user.id,
        body: parsed.body,
      },
    });

    const recipients = new Set<string>();
    if (project.ownerId !== user.id) recipients.add(project.ownerId);

    const participants = await prisma.projectParticipation.findMany({
      where: {
        projectId: parsed.projectId,
        isActive: true,
        userId: { not: user.id },
      },
      select: { userId: true },
    });
    for (const participant of participants) recipients.add(participant.userId);

    if (recipients.size > 0) {
      await prisma.notification.createMany({
        data: [...recipients].map((userId) => ({
          userId,
          title: "Nova mensagem no match",
          body: `${user.name ?? "Alguém"} enviou uma mensagem em ${project.title}.`,
          href: `/matches/${parsed.projectId}`,
        })),
      });
    }

    revalidatePath(`/matches/${parsed.projectId}`);
    revalidatePath("/inbox");
  });
}

export async function markNotificationsRead() {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/inbox");
}

export async function markNotificationsByHref(href: string) {
  const user = await requireUser({ skipOnboarding: true });
  if (!href) return;

  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      read: false,
      OR: [
        { href },
        { href: { startsWith: href.split("?")[0] } },
      ],
    },
    data: { read: true },
  });

  revalidatePath("/inbox");
}

export async function markNotificationRead(notificationId: string) {
  const user = await requireUser({ skipOnboarding: true });
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { read: true },
  });
  revalidatePath("/inbox");
}

export async function getInboxData() {
  const user = await requireUser();

  const [ownedProjectIds, interests, invites, notifications, openContributors] =
    await Promise.all([
      prisma.project.findMany({
        where: { ownerId: user.id },
        select: { id: true },
      }),
      prisma.matchInterest.findMany({
        where: {
          status: "pending",
          project: { ownerId: user.id },
        },
        include: {
          user: true,
          project: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.invite.findMany({
        where: {
          toUserId: user.id,
          status: "pending",
        },
        include: {
          project: true,
          fromUser: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.user.findMany({
        where: {
          openToInvites: true,
          id: { not: user.id },
        },
        select: {
          id: true,
          name: true,
          githubUsername: true,
          languages: true,
          bio: true,
          image: true,
        },
        take: 20,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

  return {
    ownedProjectIds: ownedProjectIds.map((p) => p.id),
    interests,
    invites,
    notifications,
    openContributors,
    projects: await prisma.project.findMany({
      where: { ownerId: user.id },
      select: { id: true, title: true },
    }),
  };
}
