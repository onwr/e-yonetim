import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";
import { getPersonelById } from "@/server/modules/personel/service";
import { createAuthorizedRouteHandler } from "@/server/lib/authorized-route";
import { forbidden } from "@/server/lib/errors";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
  return createAuthorizedRouteHandler("ik_1", "view", async (_req, session) => {
    const { id } = await context.params;
    const personel = await getPersonelById(session.tenantId, id);
    return ok(personel);
  })(request);
}

export async function PATCH(request: NextRequest, context: Params) {
  return createAuthorizedRouteHandler("ik_1", "edit", async (req, session) => {
    const { id } = await context.params;
    const payload = (await req.json()) as Record<string, unknown>;
    const updated = await prisma.employee.update({
      where: { id },
      data: {
        adSoyad: payload.adSoyad ? String(payload.adSoyad) : undefined,
        unvan: payload.unvan ? String(payload.unvan) : undefined,
        statu: payload.statu ? String(payload.statu) : undefined,
        personelJson: payload as object,
      },
    });
    if (updated.tenantId !== session.tenantId) {
      throw forbidden("Yetkisiz erisim.");
    }
    return ok(updated);
  })(request);
}
