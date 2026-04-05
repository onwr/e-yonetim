import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { created, ok } from "@/server/lib/response";

export const GET = createProtectedRouteHandler(async (_request, session) => {
  const items = await prisma.notification.findMany({
    where: { tenantId: session.tenantId, userId: session.userId },
    orderBy: { createdAt: "desc" },
  });
  return ok(items);
});

export const POST = createProtectedRouteHandler(async (request: NextRequest, session) => {
  const payload = (await request.json()) as { title: string; body?: string };
  const createdNotification = await prisma.notification.create({
    data: {
      tenantId: session.tenantId,
      userId: session.userId,
      title: payload.title,
      body: payload.body,
    },
  });
  return created(createdNotification);
});
