import { z } from "zod";

const csvToList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map(String).map((v) => v.trim()).filter(Boolean);
  }
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const profileSchema = z
  .object({
    email: z.preprocess(
      (value) => {
        if (typeof value !== "string") return undefined;
        const trimmed = value.trim();
        return trimmed === "" ? undefined : trimmed;
      },
      z.string().email("Informe um e-mail válido.").optional()
    ),
    bio: z.string().trim().max(1000).optional().default(""),
    languages: z.preprocess(csvToList, z.array(z.string().min(1)).default([])),
    interestTags: z.preprocess(csvToList, z.array(z.string().min(1)).default([])),
    experienceLevel: z
      .enum(["beginner", "intermediate", "advanced"])
      .default("beginner"),
    openToInvites: z.boolean().default(true),
    fromOnboarding: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.languages.length === 0 && data.interestTags.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["languages"],
        message:
          "Add at least one skill/language or an interest tag to continue.",
      });
    }
  });

export const projectSchema = z.object({
  title: z.string().trim().min(3, "Título muito curto.").max(120),
  description: z.string().trim().min(10, "Descrição muito curta.").max(4000),
  githubLink: z
    .string()
    .trim()
    .url("Informe uma URL válida.")
    .refine((value) => /github\.com\/[^/]+\/[^/]+/i.test(value), {
      message: "Use um link de repositório GitHub.",
    }),
  languages: z.preprocess(csvToList, z.array(z.string().min(1)).default([])),
  tags: z.preprocess(csvToList, z.array(z.string().min(1)).default([])),
  lookingFor: z.preprocess(csvToList, z.array(z.string().min(1)).default([])),
});

export const importGithubSchema = z.object({
  githubUrl: z
    .string()
    .trim()
    .url("Informe uma URL válida.")
    .refine((value) => /github\.com\/[^/]+\/[^/]+/i.test(value), {
      message: "Use um link de repositório GitHub.",
    }),
  lookingFor: z.preprocess(csvToList, z.array(z.string().min(1)).default([])),
});

export const inviteSchema = z.object({
  projectId: z.string().min(1),
  toUserId: z.string().min(1),
  message: z.string().trim().max(500).optional().nullable(),
  issueNumber: z.number().int().positive().nullable().optional(),
});

export const messageSchema = z.object({
  projectId: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(1, "Escreva uma mensagem.")
    .max(2000, "Mensagem muito longa."),
});

export function formDataToObject(formData: FormData) {
  const data: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
  for (const [key, value] of formData.entries()) {
    if (key in data) {
      const current = data[key];
      data[key] = Array.isArray(current) ? [...current, value] : [current, value];
    } else {
      data[key] = value;
    }
  }
  return data;
}

export function firstValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Dados inválidos.";
}
