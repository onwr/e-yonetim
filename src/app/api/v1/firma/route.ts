import { NextRequest } from "next/server";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";
import { getFirma, updateFirma } from "@/server/modules/firma/service";
import { writeAuditLog } from "@/server/lib/audit";

import { createAuthorizedRouteHandler } from "@/server/lib/authorized-route";

export const GET = createAuthorizedRouteHandler("ku_1", "view", async (_request, session) => {
  const firma = await getFirma(session.tenantId);
  return ok(firma, { requestId: session.requestId });
});

export const PUT = createAuthorizedRouteHandler("ku_1", "edit", async (request: NextRequest, session) => {
  const payload = (await request.json()) as Record<string, unknown>;
  const firma = await updateFirma(session.tenantId, payload);
  await writeAuditLog({
    tenantId: session.tenantId,
    userId: session.userId,
    action: "FIRMA_UPDATE",
    entityType: "Tenant",
    entityId: session.tenantId,
    meta: { changedKeys: Object.keys(payload) },
  });
  return ok(firma, { requestId: session.requestId });
});
