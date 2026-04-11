import { ZodSchema } from "zod";
import { validationFailed } from "@/server/lib/errors";

export function validateSchema<T>(schema: ZodSchema<T>, payload: unknown): T {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw validationFailed(parsed.error.flatten());
  }
  return parsed.data;
}
