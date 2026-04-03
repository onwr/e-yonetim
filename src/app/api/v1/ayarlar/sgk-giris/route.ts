import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";

const STEP_KEY = "sgk-giris-ayarlar";

export const GET = createProtectedRouteHandler(async (_request, session) => {
  const step = await prisma.onboardingStep.findUnique({
    where: {
      tenantId_key: {
        tenantId: session.tenantId,
        key: STEP_KEY,
      },
    },
  });
  return ok(step?.payload ?? {});
});

export const PUT = createProtectedRouteHandler(async (request: NextRequest, session) => {
  const payload = await request.json();
  const step = await prisma.onboardingStep.upsert({
    where: {
      tenantId_key: {
        tenantId: session.tenantId,
        key: STEP_KEY,
      },
    },
    create: {
      tenantId: session.tenantId,
      key: STEP_KEY,
      completed: true,
      payload: payload as object,
    },
    update: {
      completed: true,
      payload: payload as object,
    },
  });
  return ok(step);
});
