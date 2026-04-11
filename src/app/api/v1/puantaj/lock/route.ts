import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";

export const GET = createProtectedRouteHandler(async (request: NextRequest, session) => {
  const { searchParams } = request.nextUrl;
  const year = parseInt(searchParams.get("year") || "");
  const month = parseInt(searchParams.get("month") || "");

  if (isNaN(year) || isNaN(month)) {
    return ok({ isLocked: false });
  }

  const lock = await prisma.puantajLock.findUnique({
    where: {
      tenantId_year_month: {
        tenantId: session.tenantId,
        year,
        month,
      },
    },
  });

  return ok({ isLocked: lock?.isLocked || false });
});

export const PUT = createProtectedRouteHandler(async (request: NextRequest, session) => {
  const body = (await request.json()) as { year: number; month: number; isLocked: boolean };
  
  if (typeof body.year !== "number" || typeof body.month !== "number" || typeof body.isLocked !== "boolean") {
    throw new Error("Gecersiz veri formati");
  }

  const updated = await prisma.puantajLock.upsert({
    where: {
      tenantId_year_month: {
        tenantId: session.tenantId,
        year: body.year,
        month: body.month,
      },
    },
    update: {
      isLocked: body.isLocked,
    },
    create: {
      tenantId: session.tenantId,
      year: body.year,
      month: body.month,
      isLocked: body.isLocked,
    },
  });

  return ok({ isLocked: updated.isLocked });
});
