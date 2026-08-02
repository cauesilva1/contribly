import type { User } from "@prisma/client";

export function isProfileComplete(user: Pick<User, "languages">) {
  return user.languages.length > 0;
}
