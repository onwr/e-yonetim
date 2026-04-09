import { NextRequest } from "next/server";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { created, ok } from "@/server/lib/response";
import { getPagination } from "@/server/lib/request-context";
import { listTalepler, createTalep } from "@/server/modules/talepler/service";
import { writeAuditLog } from "@/server/lib/audit";

import { createAuthorizedRouteHandler } from "@/server/lib/authorized-route";
import { checkPermission } from "@/server/lib/check-permission";

export const GET = createAuthorizedRouteHandler("op_2", "view", async (request: NextRequest, session) => {
  const { page, pageSize, skip, take } = getPagination(request.nextUrl.searchParams);
  const type = request.nextUrl.searchParams.get("type") ?? undefined;
  const status =
    request.nextUrl.searchParams.get("status") ??
    request.nextUrl.searchParams.get("durum") ??
    undefined;
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const result = await listTalepler({
    tenantId: session.tenantId,
    type,
    status,
    q,
    skip,
    take,
  });
  return ok(result.items, { page, pageSize, total: result.total });
});

export const POST = createProtectedRouteHandler(async (request: NextRequest, session) => {
  const payload = (await request.json()) as { type: "sgk-giris" | "sgk-cikis"; [key: string]: unknown };
  const { type, ...rest } = payload;
  
  if (type === "sgk-giris") {
    await checkPermission(session.userId, session.tenantId, "ik_3", "create");
  } else if (type === "sgk-cikis") {
    await checkPermission(session.userId, session.tenantId, "ik_5", "create");
  }

  const talep = await createTalep(session.tenantId, type, rest);
  await writeAuditLog({
    tenantId: session.tenantId,
    userId: session.userId,
    action: "TALEP_CREATE",
    entityType: "Request",
    entityId: talep.id,
    meta: { type },
  });
  return created(talep);
});
