import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
  return createProtectedRouteHandler(async (_req, session) => {
    const { id } = await context.params;
    const permissions = await prisma.userRole.findMany({
      where: {
        userId: id,
        user: { tenantId: session.tenantId },
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });
    return ok(permissions);
  })(request);
}

export async function PUT(request: NextRequest, context: Params) {
  return createProtectedRouteHandler(async (req, session) => {
    const { id } = await context.params;
    const payload = (await req.json()) as { roleIds: string[] };
    await prisma.userRole.deleteMany({ where: { userId: id } });
    if (payload.roleIds?.length) {
      await prisma.userRole.createMany({
        data: payload.roleIds.map((roleId) => ({ userId: id, roleId })),
      });
    }
    return ok({ updated: true, tenantId: session.tenantId });
  })(request);
}
