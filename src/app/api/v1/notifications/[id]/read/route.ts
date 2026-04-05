import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";
import { notFound } from "@/server/lib/errors";

type Params = { params: Promise<{ id: string }> };

export const PATCH = (request: NextRequest, context: Params) =>
  createProtectedRouteHandler(async (_req, session) => {
    const { id } = await context.params;
    const notif = await prisma.notification.findFirst({
      where: { id, userId: session.userId, tenantId: session.tenantId },
    });
    if (!notif) throw notFound("Bildirim bulunamadi.");
    await prisma.notification.update({ where: { id }, data: { isRead: true } });
    return ok({ success: true });
  })(request);
