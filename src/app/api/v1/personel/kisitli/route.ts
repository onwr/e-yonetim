import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { created, ok } from "@/server/lib/response";

export const GET = createProtectedRouteHandler(async (_request, session) => {
  const items = await prisma.restrictedEmployee.findMany({
    where: { tenantId: session.tenantId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return ok(items);
});

export const POST = createProtectedRouteHandler(async (request: NextRequest, session) => {
  const payload = (await request.json()) as Record<string, unknown>;
  const createdItem = await prisma.restrictedEmployee.create({
    data: {
      tenantId: session.tenantId,
      adSoyad: String(payload.adSoyad ?? ""),
      tckn: String(payload.tckn ?? ""),
      neden: String(payload.neden ?? ""),
      aciklama: payload.aciklama ? String(payload.aciklama) : null,
      durum: String(payload.durum ?? "Beklemede"),
      eklenmeTarihi: payload.eklenmeTarihi
        ? new Date(String(payload.eklenmeTarihi))
        : new Date(),
      kaldirilmaTarihi: payload.kaldirilmaTarihi
        ? new Date(String(payload.kaldirilmaTarihi))
        : null,
    },
  });
  return created(createdItem);
});

export const PATCH = createProtectedRouteHandler(async (request: NextRequest, session) => {
  const payload = (await request.json()) as Record<string, unknown>;
  const id = String(payload.id ?? "");
  const updated = await prisma.restrictedEmployee.update({
    where: { id },
    data: {
      durum: payload.durum ? String(payload.durum) : undefined,
      aciklama: payload.aciklama ? String(payload.aciklama) : undefined,
      kaldirilmaTarihi: payload.kaldirilmaTarihi ? new Date(String(payload.kaldirilmaTarihi)) : undefined,
    },
  });
  if (updated.tenantId !== session.tenantId) {
    throw new Error("Yetkisiz erisim.");
  }
  return ok(updated);
});
