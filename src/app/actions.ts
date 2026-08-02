"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ActionError, withActionError } from "@/lib/action-error";
import { fetchGoodFirstIssues, fetchGithubRepoMeta } from "@/lib/github";
import {
  findExistingProjectByGithub,
  normalizeGithubRepoUrl,
  parseGithubOwnerRepo,
} from "@/lib/github-url";
import { userCanAdminGithubRepo } from "@/lib/github";
import {
  buildGithubInterestIssueUrl,
  newInviteToken,
} from "@/lib/notify-maintainer";
import { getGithubAccessTokenForUser } from "@/lib/github-sync";
import { getSiteUrl } from "@/lib/site-url";
import {
  collectIssueLabels,
  normalizeSkill,
  rankCandidatesForProject,
  scoreProjectForUser,
  type ScoreHistoryInput,
} from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { getOptionalUser, getSession, requireUser } from "@/lib/session";
import {
  importGithubSchema,
  inviteSchema,
  messageSchema,
  profileSchema,
  projectSchema,
} from "@/lib/validators";

export async function updateProfile(formData: FormData) {
  return withActionError(async () => {
    const user = await requireUser(true);
    const parsed = profileSchema.parse({
      email: formData.get("email"),
      bio: formData.get("bio"),
      languages: formData.get("languages"),
      interestTags: formData.get("interestTags"),
      experienceLevel: formData.get("experienceLevel") ?? "beginner",
      openToInvites: formData.get("openToInvites") === "on",
      fromOnboarding: formData.get("fromOnboarding") === "1",
    });

    const email = typeof parsed.email === "string" ? parsed.email.trim() : null;
    if (!user.email && !email) {
      throw new ActionError("Informe um e-mail para contato.");
    }

    if (email && email !== user.email) {
      const taken = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: user.id },
        },
        select: { id: true },
      });
      if (taken) {
        throw new ActionError("Esse e-mail já está em uso por outra conta.");
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(email ? { email } : {}),
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
  const user = await requireUser(true);
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

async function loadUserMatchHistory(userId: string): Promise<ScoreHistoryInput> {
  const history = await prisma.matchInterest.findMany({
    where: { userId },
    include: {
      project: {
        select: { id: true, tags: true, lookingFor: true },
      },
    },
  });

  const liked = history.filter(
    (item) => item.status === "pending" || item.status === "accepted"
  );
  const rejected = history.filter((item) => item.status === "rejected");

  return {
    likedTags: liked.flatMap((item) => item.project.tags),
    likedLookingFor: liked.flatMap((item) => item.project.lookingFor),
    rejectedProjectIds: new Set(rejected.map((item) => item.projectId)),
    rejectedTags: rejected.flatMap((item) => item.project.tags),
  };
}

const projectMatchInclude = {
  owner: {
    select: {
      id: true,
      name: true,
      image: true,
      githubUsername: true,
    },
  },
  issues: {
    select: { labels: true },
  },
  _count: {
    select: {
      issues: true,
      interests: true,
      participations: true,
    },
  },
} as const;

export async function listProjects(filters: ProjectFilters = {}) {
  const language = filters.language?.trim();
  const q = filters.q?.trim();
  const user = await getOptionalUser();

  const projects = await prisma.project.findMany({
    where: {
      AND: [
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
    include: projectMatchInclude,
    orderBy: [{ starsCount: "desc" }, { createdAt: "desc" }],
  });

  const languageNeedle = language ? normalizeSkill(language) : null;
  const filtered = languageNeedle
    ? projects.filter((project) =>
        project.languages.some((lang) => {
          const normalized = normalizeSkill(lang);
          return (
            normalized === languageNeedle ||
            normalized.includes(languageNeedle) ||
            languageNeedle.includes(normalized)
          );
        })
      )
    : projects;

  if (!user) {
    const needle = q?.toLowerCase() ?? "";
    return filtered
      .map((project) => ({
        ...project,
        score: undefined as number | undefined,
        issueLabels: collectIssueLabels(project.issues),
        titleHit:
          needle && project.title.toLowerCase().includes(needle) ? 1 : 0,
      }))
      .sort(
        (a, b) =>
          (b.titleHit ?? 0) - (a.titleHit ?? 0) ||
          (b.starsCount ?? 0) - (a.starsCount ?? 0) ||
          b.createdAt.getTime() - a.createdAt.getTime()
      );
  }

  const history = await loadUserMatchHistory(user.id);
  const needle = q?.toLowerCase() ?? "";

  return filtered
    .map((project) => {
      const issueLabels = collectIssueLabels(project.issues);
      const breakdown = scoreProjectForUser(
        {
          languages: user.languages,
          interestTags: user.interestTags,
          experienceLevel: user.experienceLevel,
        },
        {
          ...project,
          issueLabels,
        },
        history,
        project.id
      );

      const titleHit =
        needle && project.title.toLowerCase().includes(needle) ? 1 : 0;

      return {
        ...project,
        issueLabels,
        score: breakdown.score,
        breakdown,
        titleHit,
      };
    })
    .sort(
      (a, b) =>
        (b.titleHit ?? 0) - (a.titleHit ?? 0) ||
        (b.score ?? 0) - (a.score ?? 0) ||
        (b.starsCount ?? 0) - (a.starsCount ?? 0) ||
        b.createdAt.getTime() - a.createdAt.getTime()
    );
}

export async function getProject(id: string) {
  const session = await getSession();
  const viewerId = session?.user?.id ?? null;

  const project = await prisma.project.findUnique({
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

  if (!project) return null;

  // Não vaza lista de interessados para quem não é o dono
  if (viewerId !== project.ownerId) {
    return {
      ...project,
      interests: viewerId
        ? project.interests.filter((interest) => interest.userId === viewerId)
        : [],
    };
  }

  return project;
}

export async function listRecommendedProjects() {
  const user = await requireUser();

  const [projects, history] = await Promise.all([
    prisma.project.findMany({
      where: {
        ownerId: { not: user.id },
      },
      include: projectMatchInclude,
    }),
    loadUserMatchHistory(user.id),
  ]);

  return projects
    .map((project) => {
      const issueLabels = collectIssueLabels(project.issues);
      const breakdown = scoreProjectForUser(
        {
          languages: user.languages,
          interestTags: user.interestTags,
          experienceLevel: user.experienceLevel,
        },
        {
          ...project,
          issueLabels,
        },
        history,
        project.id
      );

      return {
        ...project,
        issueLabels,
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
    const githubRepoIdRaw = String(formData.get("githubRepoId") ?? "").trim();
    const githubRepoId = githubRepoIdRaw || null;
    const starsRaw = String(formData.get("starsCount") ?? "").trim();
    let starsCount =
      starsRaw && Number.isFinite(Number(starsRaw)) ? Number(starsRaw) : null;
    const isPrivateFlag = String(formData.get("isPrivate") ?? "") === "1";

    const existing = await findExistingProjectByGithub({
      githubLink,
      githubRepoId,
    });
    if (existing) {
      throw new ActionError(
        `Esse repositório já está cadastrado como "${existing.title}".`
      );
    }

    let isPrivate = isPrivateFlag;
    const accessToken = await getGithubAccessTokenForUser(user.id).catch(
      () => null
    );

    const meta = await fetchGithubRepoMeta(githubLink, { accessToken });
    if (meta) {
      if (starsCount == null && meta.starsCount != null) {
        starsCount = meta.starsCount;
      }
      isPrivate = meta.isPrivate;
    } else if (isPrivateFlag && !accessToken) {
      throw new ActionError(
        "Repos privados exigem login com GitHub. Conecte sua conta e tente de novo."
      );
    }

    const project = await prisma.project.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        githubLink,
        githubRepoId,
        isPrivate,
        languages: parsed.languages,
        tags: parsed.tags,
        lookingFor: parsed.lookingFor,
        starsCount,
        source: githubRepoId ? "github_import" : "manual",
        ownerId: user.id,
      },
    });

    // Best-effort: sync good-first issues (pula em privado sem labels públicas)
    if (!isPrivate) {
      try {
        await syncProjectIssues(project.id);
      } catch {
        // publish succeeds even if GitHub sync fails (rate limit, etc.)
      }
    }

    revalidatePath("/discover");
    revalidatePath("/projects/new");
    revalidatePath("/for-you");
    revalidatePath("/dashboard");
    revalidatePath(`/projects/${project.id}`);
    return project.id;
  });
}

export async function previewGithubRepo(githubUrl: string) {
  return withActionError(async () => {
    const user = await requireUser();

    if (!/github\.com\/[^/]+\/[^/]+/i.test(githubUrl.trim())) {
      throw new ActionError("Cole um link de repositório GitHub válido.");
    }

    const accessToken = await getGithubAccessTokenForUser(user.id).catch(
      () => null
    );
    const meta = await fetchGithubRepoMeta(githubUrl, { accessToken });
    if (!meta) {
      throw new ActionError(
        accessToken
          ? "Não foi possível ler esse repositório. Confira o link ou suas permissões."
          : "Não foi possível ler esse repositório. Conecte o GitHub ou confira o link (repos privados exigem login com GitHub)."
      );
    }

    const existing = await findExistingProjectByGithub({
      githubLink: meta.githubLink,
      githubRepoId: meta.githubRepoId,
    });
    if (existing) {
      throw new ActionError(
        `Esse repositório já está cadastrado como "${existing.title}".`
      );
    }

    return {
      githubRepoId: meta.githubRepoId,
      githubLink: normalizeGithubRepoUrl(meta.githubLink),
      title: meta.title,
      description: meta.description,
      languages: meta.languages.join(", "),
      tags: meta.topics.join(", "),
      starsCount: meta.starsCount,
      isPrivate: meta.isPrivate,
    };
  });
}

export async function listMyGithubRepos(query?: string) {
  return withActionError(async () => {
    const user = await requireUser();
    const accessToken = await getGithubAccessTokenForUser(user.id);
    if (!accessToken) {
      throw new ActionError("GITHUB_CONNECT_REQUIRED");
    }

    const { listGithubReposForToken } = await import("@/lib/github");
    try {
      return await listGithubReposForToken(accessToken, {
        query,
        limit: 50,
      });
    } catch {
      throw new ActionError(
        "Não foi possível listar seus repositórios. Saia e entre de novo com o GitHub para autorizar o acesso."
      );
    }
  });
}

export async function getGithubPublishAccess() {
  const user = await requireUser();
  const account = await prisma.account.findFirst({
    where: { userId: user.id, provider: "github" },
    select: { scope: true, access_token: true },
  });
  const scope = account?.scope ?? "";
  const hasRepoScope = /(^|\s)repo(\s|$)/.test(scope);
  return {
    connected: Boolean(account?.access_token),
    hasRepoScope,
    githubUsername: user.githubUsername ?? null,
  };
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
        "User-Agent": "contribly",
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
      include: projectMatchInclude,
    }),
    loadUserMatchHistory(user.id),
  ]);

  const seenIds = new Set(seen.map((item) => item.projectId));

  return projects
    .filter((project) => !seenIds.has(project.id))
    .map((project) => {
      const issueLabels = collectIssueLabels(project.issues);
      const breakdown = scoreProjectForUser(
        {
          languages: user.languages,
          interestTags: user.interestTags,
          experienceLevel: user.experienceLevel,
        },
        {
          ...project,
          issueLabels,
        },
        history,
        project.id
      );

      return {
        ...project,
        issueLabels,
        score: breakdown.score,
      };
    })
    .sort((a, b) => b.score - a.score || b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 20);
}

export async function expressInterest(projectId: string, interested: boolean) {
  const user = await requireUser();
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { owner: true },
  });
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
    return { interested: false as const };
  }

  const interest = await prisma.matchInterest.upsert({
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

  const notify = await ensureMaintainerNotifyChannels({
    project,
    contributor: user,
    interestId: interest.id,
  });

  revalidatePath("/swipe");
  revalidatePath("/inbox");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);

  return { interested: true as const, notify };
}

async function ensureMaintainerNotifyChannels(input: {
  project: {
    id: string;
    title: string;
    githubLink: string;
    ownerId: string;
    owner: { email: string | null; githubUsername: string | null; name: string | null };
  };
  contributor: {
    id: string;
    name: string | null;
    githubUsername: string | null;
  };
  interestId: string;
}) {
  const site = getSiteUrl();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  const dayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);

  const invitesToday = await prisma.maintainerInvite.count({
    where: {
      createdById: input.contributor.id,
      createdAt: { gte: dayAgo },
    },
  });

  let invite = await prisma.maintainerInvite.findFirst({
    where: {
      projectId: input.project.id,
      createdById: input.contributor.id,
      claimedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!invite) {
    if (invitesToday >= 20) {
      throw new Error(
        "Limite diário de convites atingido. Tente de novo amanhã ou use a issue no GitHub."
      );
    }
    invite = await prisma.maintainerInvite.create({
      data: {
        token: newInviteToken(),
        projectId: input.project.id,
        createdById: input.contributor.id,
        interestId: input.interestId,
        expiresAt,
      },
    });
  } else if (!invite.interestId) {
    invite = await prisma.maintainerInvite.update({
      where: { id: invite.id },
      data: { interestId: input.interestId },
    });
  }

  const inviteUrl = `${site}/invite/${invite.token}`;

  const githubIssueUrl = buildGithubInterestIssueUrl({
    githubLink: input.project.githubLink,
    projectTitle: input.project.title,
    contributorName: input.contributor.name ?? "Alguém",
    contributorGithub: input.contributor.githubUsername,
    inviteUrl,
    siteUrl: site,
  });

  // E-mail transacional desligado por enquanto (requer domínio verificado).
  // Mantemos só issue GitHub + link mágico.
  return {
    inviteUrl,
    githubIssueUrl,
    email: { status: "deferred" as const },
  };
}

export async function getMaintainerNotifyOptions(projectId: string) {
  const user = await requireUser();
  const interest = await prisma.matchInterest.findUnique({
    where: {
      userId_projectId: { userId: user.id, projectId },
    },
  });
  if (!interest || interest.status !== "pending") {
    return null;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { owner: true },
  });
  if (!project) return null;

  return ensureMaintainerNotifyChannels({
    project,
    contributor: user,
    interestId: interest.id,
  });
}

export async function claimMaintainerInvite(token: string) {
  const user = await requireUser();
  const invite = await prisma.maintainerInvite.findUnique({
    where: { token },
    include: {
      project: true,
      createdBy: {
        select: { id: true, name: true, githubUsername: true },
      },
    },
  });

  if (!invite) throw new Error("Convite inválido.");
  if (invite.expiresAt.getTime() < Date.now()) {
    throw new Error("Este convite expirou.");
  }
  if (invite.claimedAt) {
    throw new Error("Este convite já foi utilizado.");
  }

  const isListedOwner = invite.project.ownerId === user.id;
  let canTakeOwnership = isListedOwner;

  if (!canTakeOwnership) {
    const accessToken = await getGithubAccessTokenForUser(user.id).catch(
      () => null
    );
    if (accessToken) {
      canTakeOwnership = await userCanAdminGithubRepo(
        invite.project.githubLink,
        accessToken
      );
    } else {
      const parsed = parseGithubOwnerRepo(invite.project.githubLink);
      const githubOwner = parsed?.owner.toLowerCase() ?? null;
      const username = user.githubUsername?.toLowerCase() ?? null;
      canTakeOwnership = Boolean(
        githubOwner && username && githubOwner === username
      );
    }
  }

  if (!canTakeOwnership) {
    const parsed = parseGithubOwnerRepo(invite.project.githubLink);
    throw new Error(
      parsed
        ? `Entre com uma conta GitHub com permissão de admin/maintain em ${parsed.owner}/${parsed.repo}, ou com a conta que publicou o projeto no Contribly.`
        : "Sua conta não tem permissão para reivindicar este projeto."
    );
  }

  await prisma.$transaction(async (tx) => {
    const claimed = await tx.maintainerInvite.updateMany({
      where: {
        id: invite.id,
        claimedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        claimedAt: new Date(),
        claimedById: user.id,
      },
    });

    if (claimed.count === 0) {
      throw new Error("Este convite já foi utilizado ou expirou.");
    }

    if (!isListedOwner) {
      await tx.project.update({
        where: { id: invite.projectId },
        data: { ownerId: user.id },
      });
    }

    await tx.notification.create({
      data: {
        userId: user.id,
        title: "Interesse aguardando você",
        body: `${invite.createdBy.name ?? "Alguém"} quer contribuir com ${invite.project.title}.`,
        href: "/dashboard",
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath(`/projects/${invite.projectId}`);
  redirect("/dashboard");
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
      issues: {
        select: { labels: true },
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
      invites: {
        where: { status: "pending" },
        select: { toUserId: true },
      },
      participations: {
        where: { isActive: true },
        select: { userId: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const interestStats = await prisma.matchInterest.groupBy({
    by: ["status"],
    where: { project: { ownerId: user.id } },
    _count: { _all: true },
  });

  const allEngaged = await prisma.matchInterest.findMany({
    where: { project: { ownerId: user.id } },
    select: { userId: true, projectId: true },
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
    take: 80,
    orderBy: { updatedAt: "desc" },
  });

  const projectViews = projects.map((project) => {
    const excludeIds = new Set<string>(
      allEngaged
        .filter((row) => row.projectId === project.id)
        .map((row) => row.userId)
        .concat(
          project.invites.map((invite) => invite.toUserId),
          project.participations.map((part) => part.userId)
        )
    );
    const issueLabels = collectIssueLabels(project.issues);
    const ranked = rankCandidatesForProject(
      {
        languages: project.languages,
        tags: project.tags,
        lookingFor: project.lookingFor,
        starsCount: project.starsCount,
        issuesSyncedAt: project.issuesSyncedAt,
        issueLabels,
        _count: project._count,
      },
      openContributors,
      excludeIds
    ).slice(0, 5);

    return {
      ...project,
      issueLabels,
      suggestedCandidates: ranked,
      pendingCount: project.interests.length,
    };
  });

  const pending =
    interestStats.find((s) => s.status === "pending")?._count._all ?? 0;
  const accepted =
    interestStats.find((s) => s.status === "accepted")?._count._all ?? 0;
  const rejected =
    interestStats.find((s) => s.status === "rejected")?._count._all ?? 0;
  const decided = accepted + rejected;

  const stats = {
    projects: projects.length,
    pendingInterests: pending,
    acceptedInterests: accepted,
    rejectedInterests: rejected,
    acceptanceRate: decided > 0 ? Math.round((accepted / decided) * 100) : 0,
    openIssues: projects.reduce((sum, p) => sum + p._count.issues, 0),
    activeParticipants: projects.reduce((sum, p) => sum + p._count.participations, 0),
    totalStars: projects.reduce((sum, p) => sum + (p.starsCount ?? 0), 0),
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
  revalidateTag(`unread-${user.id}`);
}

export async function markNotificationsByHref(href: string) {
  const user = await requireUser(true);
  if (!href) return;

  // Chamada durante o render de páginas — não usar revalidatePath aqui.
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
}

export async function markNotificationRead(notificationId: string) {
  const user = await requireUser(true);
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { read: true },
  });
  revalidatePath("/inbox");
  revalidateTag(`unread-${user.id}`);
}

export async function getInboxData() {
  const user = await requireUser();

  const [ownedProjects, interests, invites, notifications] = await Promise.all([
      prisma.project.findMany({
        where: { ownerId: user.id },
        select: { id: true, title: true },
      }),
      prisma.matchInterest.findMany({
        where: {
          status: "pending",
          project: { ownerId: user.id },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              githubUsername: true,
              languages: true,
            },
          },
          project: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.invite.findMany({
        where: {
          toUserId: user.id,
          status: "pending",
        },
        include: {
          project: {
            select: { id: true, title: true },
          },
          fromUser: {
            select: {
              id: true,
              name: true,
              githubUsername: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);

  return {
    ownedProjectIds: ownedProjects.map((p) => p.id),
    interests,
    invites,
    notifications,
    projects: ownedProjects,
  };
}
