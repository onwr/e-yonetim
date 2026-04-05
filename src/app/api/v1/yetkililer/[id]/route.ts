import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { notFound } from "@/server/lib/errors";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";
import { mergeUserPreferences } from "@/server/lib/user-preferences";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
  return createProtectedRouteHandler(async (_req, session) => {
    const { id } = await context.params;
    const user = await prisma.user.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
      select: {
        id: true,
        adSoyad: true,
        eposta: true,
        telefon: true,
        status: true,
        createdAt: true,
        preferences: true,
        isAnaKullanici: true,
      },
    });
    if (!user) {
      throw notFound("Yetkili kullanici bulunamadi.");
    }
    return ok(user);
  })(request);
}

export async function PATCH(request: NextRequest, context: Params) {
  return createProtectedRouteHandler(async (req, session) => {
    const { id } = await context.params;
    const payload = (await req.json()) as Record<string, unknown>;

    const existing = await prisma.user.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
      select: { preferences: true },
    });
    if (!existing) {
      throw notFound("Yetkili kullanici bulunamadi.");
    }

    const data: Prisma.UserUpdateInput = {};

    if (payload.adSoyad !== undefined) data.adSoyad = String(payload.adSoyad);
    if (payload.eposta !== undefined) data.eposta = String(payload.eposta);
    if (payload.telefon !== undefined) data.telefon = String(payload.telefon);

    let prefsTouched = false;
    let nextPrefs: Prisma.JsonValue | null = existing.preferences;
    if (payload.yetkiMatrix !== undefined) {
      nextPrefs = mergeUserPreferences(nextPrefs, { yetkiMatrix: payload.yetkiMatrix }) as Prisma.JsonValue;
      prefsTouched = true;
    }
    if (payload.preferences !== undefined && typeof payload.preferences === "object" && payload.preferences !== null) {
      nextPrefs = mergeUserPreferences(nextPrefs, payload.preferences as Record<string, unknown>) as Prisma.JsonValue;
      prefsTouched = true;
    }
    if (prefsTouched) {
      data.preferences = nextPrefs as Prisma.InputJsonValue;
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
    });
    if (updated.tenantId !== session.tenantId) {
      throw notFound("Yetkili kullanici bulunamadi.");
    }
    return ok(updated);
  })(request);
}

export async function DELETE(request: NextRequest, context: Params) {
  return createProtectedRouteHandler(async (_req, session) => {
    const { id } = await context.params;
    const { deleteYetkili } = await import("@/server/modules/yetkililer/service");
    const { writeAuditLog } = await import("@/server/lib/audit");
    const result = await deleteYetkili(session.tenantId, id);
    await writeAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: "YETKILI_DELETE",
      entityType: "User",
      entityId: id,
    });
    return ok({ success: true, id: result.id });
  })(request);
}
