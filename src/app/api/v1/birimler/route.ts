import { NextRequest } from "next/server";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { created, ok } from "@/server/lib/response";
import { getPagination } from "@/server/lib/request-context";
import { createBirim, listBirimler } from "@/server/modules/birimler/service";
import { createAuthorizedRouteHandler } from "@/server/lib/authorized-route";

export const GET = createAuthorizedRouteHandler("ku_4", "view", async (request: NextRequest, session) => {
  const { page, pageSize, skip, take } = getPagination(request.nextUrl.searchParams);
  const departmanId = request.nextUrl.searchParams.get("departmanId") ?? undefined;
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const result = await listBirimler({
    tenantId: session.tenantId,
    departmanId,
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

export const POST = createAuthorizedRouteHandler("ku_4", "create", async (request: NextRequest, session) => {
  const payload = (await request.json()) as Record<string, unknown>;
  const birim = await createBirim(session.tenantId, payload);
  return created(birim, { requestId: session.requestId });
});
