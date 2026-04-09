import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { notFound } from "@/server/lib/errors";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";

type Params = { params: Promise<{ id: string }> };

import { createAuthorizedRouteHandler } from "@/server/lib/authorized-route";

export async function GET(request: NextRequest, context: Params) {
  return createAuthorizedRouteHandler("ku_3", "view", async (_req, session) => {
    const { id } = await context.params;
    const sube = await prisma.branch.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
    });
    if (!sube) {
      throw notFound("Sube bulunamadi.");
    }
    return ok(sube);
  })(request);
}

export async function PATCH(request: NextRequest, context: Params) {
  return createAuthorizedRouteHandler("ku_3", "edit", async (req, session) => {
    const { id } = await context.params;
    const payload = (await req.json()) as Record<string, unknown>;
    const sube = await prisma.branch.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
    });
    if (!sube) {
      throw notFound("Sube bulunamadi.");
    }
    const updated = await prisma.branch.update({
      where: { id },
      data: {
        name:
          payload.subeAdi !== undefined
            ? String(payload.subeAdi)
            : payload.name !== undefined
              ? String(payload.name)
              : undefined,
        subeTuru: payload.subeTuru !== undefined ? String(payload.subeTuru) : undefined,
        il: payload.il !== undefined ? String(payload.il) : undefined,
        ilce: payload.ilce !== undefined ? String(payload.ilce) : undefined,
        mahalle: payload.mahalle !== undefined ? String(payload.mahalle) : undefined,
        adres: payload.adres !== undefined ? String(payload.adres) : undefined,
        postaKodu: payload.postaKodu !== undefined ? String(payload.postaKodu) : undefined,
        telefon: payload.telefon !== undefined ? String(payload.telefon) : undefined,
        ePosta: payload.ePosta !== undefined ? String(payload.ePosta) : undefined,
      },
    });
    return ok(updated);
  })(request);
}

export async function DELETE(request: NextRequest, context: Params) {
  return createAuthorizedRouteHandler("ku_3", "delete", async (_req, session) => {
    const { id } = await context.params;
    const sube = await prisma.branch.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
    });
    if (!sube) {
      throw notFound("Sube bulunamadi.");
    }
    await prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return ok({ deleted: true });
  })(request);
}
