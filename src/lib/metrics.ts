import { prisma } from "@/lib/prisma";

export async function getPlatformMetrics() {
  const [
    signups,
    signupsLast7Days,
    projects,
    interestSwipes,
    interestedYes,
    matchesAccepted,
    invitesAccepted,
    participations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.project.count(),
    prisma.matchInterest.count(),
    prisma.matchInterest.count({ where: { status: "pending" } }),
    prisma.matchInterest.count({ where: { status: "accepted" } }),
    prisma.invite.count({ where: { status: "accepted" } }),
    prisma.projectParticipation.count(),
  ]);

  return {
    signups,
    signupsLast7Days,
    projects,
    /** Right-swipes / interest records created */
    interestSwipes,
    pendingInterests: interestedYes,
    matchesAccepted,
    invitesAccepted,
    /** Accepted interests + invites is a simple “match” proxy; participations is stronger */
    matches: matchesAccepted + invitesAccepted,
    participations,
  };
}

export function canViewMetrics(user: {
  email?: string | null;
  githubUsername?: string | null;
}) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminGithub = process.env.ADMIN_GITHUB?.trim().toLowerCase();

  if (adminEmail && user.email?.toLowerCase() === adminEmail) return true;
  if (adminGithub && user.githubUsername?.toLowerCase() === adminGithub)
    return true;

  // If nothing configured, only allow in development for convenience
  return process.env.NODE_ENV === "development";
}
