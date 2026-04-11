import type { Prisma } from "@prisma/client";

export function mergeUserPreferences(
  existing: Prisma.JsonValue | null | undefined,
  patch: Record<string, unknown>,
): Prisma.InputJsonValue {
  const base =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) {
      (base as Record<string, unknown>)[k] = v;
    }
  }
  return base as Prisma.InputJsonValue;
}
