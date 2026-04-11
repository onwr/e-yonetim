import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export type RequestContext = {
  requestId: string;
  tenantId?: string;
  userId?: string;
};

export function createRequestContext(request: NextRequest): RequestContext {
  const requestId = request.headers.get("x-request-id") ?? uuidv4();
  const tenantId = request.headers.get("x-tenant-id") ?? undefined;
  const userId = request.headers.get("x-user-id") ?? undefined;
  return { requestId, tenantId, userId };
}

export function getPagination(searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100 ? pageSize : 20;
  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
  };
}
