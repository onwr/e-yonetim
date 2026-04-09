import { NextRequest } from "next/server";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { created, ok } from "@/server/lib/response";
import { getPagination } from "@/server/lib/request-context";
import { createDepartman, listDepartmanlar } from "@/server/modules/departmanlar/service";
import { createAuthorizedRouteHandler } from "@/server/lib/authorized-route";

export const GET = createAuthorizedRouteHandler("ku_4", "view", async (request: NextRequest, session) => {
  const { page, pageSize, skip, take } = getPagination(request.nextUrl.searchParams);
  const subeId = request.nextUrl.searchParams.get("subeId") ?? undefined;
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const result = await listDepartmanlar({
    tenantId: session.tenantId,
    subeId,
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
  const departman = await createDepartman(session.tenantId, payload);
  return created(departman, { requestId: session.requestId });
});
