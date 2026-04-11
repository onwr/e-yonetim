import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { badRequest, notFound } from "@/server/lib/errors";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";
import { createAuthorizedRouteHandler } from "@/server/lib/authorized-route";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
  return createAuthorizedRouteHandler("ku_4", "view", async (_req, session) => {
    const { id } = await context.params;
    const birim = await prisma.unit.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
      include: {
        department: {
          include: {
            branch: true,
            yetkiliUser: { select: { id: true, adSoyad: true } },
          },
        },
      },
    });
    if (!birim) {
      throw notFound("Birim bulunamadi.");
    }
    return ok(birim);
  })(request);
}

export async function PATCH(request: NextRequest, context: Params) {
  return createAuthorizedRouteHandler("ku_4", "edit", async (req, session) => {
    const { id } = await context.params;
    const payload = (await req.json()) as Record<string, unknown>;

    const existing = await prisma.unit.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
    });
    if (!existing) {
      throw notFound("Birim bulunamadi.");
    }

    const data: { name?: string; departmentId?: string } = {};
    if (payload.birimAdi != null || payload.name != null) {
      data.name = String(payload.birimAdi ?? payload.name);
    }
    if (payload.departmanId != null || payload.departmentId != null) {
      const nextDeptId = String(payload.departmanId ?? payload.departmentId);
      const dept = await prisma.department.findFirst({
        where: { id: nextDeptId, tenantId: session.tenantId, deletedAt: null },
      });
      if (!dept) {
        throw notFound("Departman bulunamadi.");
      }
      data.departmentId = nextDeptId;
    }

    if (Object.keys(data).length === 0) {
      throw badRequest("Guncellenecek alan yok.");
    }

    const updated = await prisma.unit.update({
      where: { id },
      data,
      include: {
        department: {
          include: {
            branch: true,
            yetkiliUser: { select: { id: true, adSoyad: true } },
          },
        },
      },
    });
    if (updated.tenantId !== session.tenantId) {
      throw notFound("Birim bulunamadi.");
    }
    return ok(updated);
  })(request);
}

export async function DELETE(request: NextRequest, context: Params) {
  return createAuthorizedRouteHandler("ku_4", "delete", async (_req, session) => {
    const { id } = await context.params;
    const birim = await prisma.unit.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
    });
    if (!birim) {
      throw notFound("Birim bulunamadi.");
    }
    await prisma.unit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return ok({ deleted: true });
  })(request);
}
