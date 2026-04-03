import { createRouteHandler } from "@/server/lib/route-handler";
import { ok } from "@/server/lib/response";
import { prisma } from "@/server/db/prisma";

export const GET = createRouteHandler(async () => {
  let db = "up";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "down";
  }

  return ok({
    status: db === "up" ? "ready" : "degraded",
    checks: { db },
    timestamp: new Date().toISOString(),
  });
});
