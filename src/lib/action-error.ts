import { ZodError } from "zod";
import { firstValidationMessage } from "@/lib/validators";

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export function toActionError(error: unknown, fallback = "Algo deu errado.") {
  if (error instanceof ActionError) return error;
  if (error instanceof ZodError) {
    return new ActionError(firstValidationMessage(error));
  }
  if (error instanceof Error && error.message) {
    return new ActionError(error.message);
  }
  return new ActionError(fallback);
}

export async function withActionError<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // Next.js redirect/notFound throw special errors — rethrow
    if (
      typeof error === "object" &&
      error &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_")
    ) {
      throw error;
    }
    throw toActionError(error);
  }
}
