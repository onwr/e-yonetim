import { NextRequest } from "next/server";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { created, ok } from "@/server/lib/response";
import { getPagination } from "@/server/lib/request-context";
import { createSube, listSubeler } from "@/server/modules/subeler/service";
import { writeAuditLog } from "@/server/lib/audit";

import { createAuthorizedRouteHandler } from "@/server/lib/authorized-route";

export const GET = createAuthorizedRouteHandler("ku_3", "view", async (request: NextRequest, session) => {
  const { page, pageSize, skip, take } = getPagination(request.nextUrl.searchParams);
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const result = await listSubeler({
    tenantId: session.tenantId,
    search,
    skip,
    take,
  });
  return ok(result.items, {
    page,
    pageSize,
    total: result.total,
    requestId: session.requestId,
  });
});

export const POST = createAuthorizedRouteHandler("ku_3", "create", async (request: NextRequest, session) => {
  const payload = (await request.json()) as Record<string, unknown>;
  const createdSube = await createSube(session.tenantId, payload);
  await writeAuditLog({
    tenantId: session.tenantId,
    userId: session.userId,
    action: "SUBE_CREATE",
    entityType: "Branch",
    entityId: createdSube.id,
    meta: payload,
  });
  return created(createdSube, { requestId: session.requestId });
});
