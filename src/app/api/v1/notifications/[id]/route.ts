import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Params) {
  return createProtectedRouteHandler(async (_req, session) => {
    const { id } = await context.params;
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    if (updated.tenantId !== session.tenantId || updated.userId !== session.userId) {
      return ok({ updated: false });
    }
    return ok({ updated: true });
  })(request);
}
