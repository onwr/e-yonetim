import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { notFound } from "@/server/lib/errors";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";
import { createAuthorizedRouteHandler } from "@/server/lib/authorized-route";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
  return createAuthorizedRouteHandler("ku_4", "view", async (_req, session) => {
    const { id } = await context.params;
    const departman = await prisma.department.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
      include: { branch: true, yetkiliUser: { select: { id: true, adSoyad: true } } },
    });
    if (!departman) {
      throw notFound("Departman bulunamadi.");
    }
    return ok(departman);
  })(request);
}

export async function PATCH(request: NextRequest, context: Params) {
  return createAuthorizedRouteHandler("ku_4", "edit", async (req, session) => {
    const { id } = await context.params;
    const payload = (await req.json()) as Record<string, unknown>;
    const updated = await prisma.department.update({
      where: { id },
      data: {
        name: payload.departmanAdi ? String(payload.departmanAdi) : undefined,
        masrafKodu: payload.masrafKodu ? String(payload.masrafKodu) : undefined,
        branchId: payload.subeId ? String(payload.subeId) : undefined,
        yetkiliUserId: payload.yetkiliId ? String(payload.yetkiliId) : undefined,
      },
      include: { branch: true, yetkiliUser: { select: { id: true, adSoyad: true } } },
    });
    if (updated.tenantId !== session.tenantId) {
      throw notFound("Departman bulunamadi.");
    }
    return ok(updated);
  })(request);
}

export async function DELETE(request: NextRequest, context: Params) {
  return createAuthorizedRouteHandler("ku_4", "delete", async (_req, session) => {
    const { id } = await context.params;
    const departman = await prisma.department.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
    });
    if (!departman) {
      throw notFound("Departman bulunamadi.");
    }
    await prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return ok({ deleted: true });
  })(request);
}
