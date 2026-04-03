import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";

export const GET = createProtectedRouteHandler(async (_request, session) => {
  const [tenant, steps] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: session.tenantId } }),
    prisma.onboardingStep.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { key: "asc" },
    }),
  ]);

  return ok({
    completed: tenant?.onboardingCompleted ?? false,
    steps,
  });
});

export const PUT = createProtectedRouteHandler(async (request: NextRequest, session) => {
  const payload = (await request.json()) as { key: string; completed: boolean; data?: unknown };
  const step = await prisma.onboardingStep.upsert({
    where: {
      tenantId_key: {
        tenantId: session.tenantId,
        key: payload.key,
      },
    },
    create: {
      tenantId: session.tenantId,
      key: payload.key,
      completed: payload.completed,
      payload: payload.data ? (payload.data as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
    update: {
      completed: payload.completed,
      payload: payload.data ? (payload.data as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });

  const remaining = await prisma.onboardingStep.count({
    where: { tenantId: session.tenantId, completed: false },
  });
  if (remaining === 0) {
    await prisma.tenant.update({
      where: { id: session.tenantId },
      data: { onboardingCompleted: true },
    });
  }

  return ok(step);
});
