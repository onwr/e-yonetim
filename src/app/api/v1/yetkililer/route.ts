import { NextRequest } from "next/server";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { created, ok } from "@/server/lib/response";
import { listYetkililer, inviteYetkili } from "@/server/modules/yetkililer/service";
import { writeAuditLog } from "@/server/lib/audit";

export const GET = createProtectedRouteHandler(async (_request, session) => {
  const items = await listYetkililer(session.tenantId);
  return ok(items);
});

export const POST = createProtectedRouteHandler(async (request: NextRequest, session) => {
  const payload = (await request.json()) as {
    adSoyad: string;
    tckn: string;
    unvan: string;
    telefon: string;
    eposta: string;
    scope: "firma" | "sube" | "departman";
    sube?: string;
    departman?: string;
  };
  const result = await inviteYetkili(session.tenantId, session.userId, payload);
  await writeAuditLog({
    tenantId: session.tenantId,
    userId: session.userId,
    action: "YETKILI_INVITE",
    entityType: "User",
    entityId: result.id,
    meta: { adSoyad: payload.adSoyad, scope: payload.scope },
  });
  return created(result);
});
