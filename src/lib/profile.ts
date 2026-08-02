import type { User } from "@prisma/client";

/** Profile is ready when the user has skills and/or interest tags. */
export function isProfileComplete(
  user: Pick<User, "languages" | "interestTags">
) {
  return user.languages.length > 0 || user.interestTags.length > 0;
}
