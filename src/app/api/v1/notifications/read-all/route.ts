import { prisma } from "@/server/db/prisma";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";

export const PATCH = createProtectedRouteHandler(async (_request, session) => {
  await prisma.notification.updateMany({
    where: { userId: session.userId, tenantId: session.tenantId, isRead: false },
    data: { isRead: true },
  });
  return ok({ success: true });
});
