import { NextRequest, NextResponse } from "next/server";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ensurePermission } from "@/server/lib/rbac";

type AuthorizedExecutor = (
  request: NextRequest,
  context: { requestId: string; userId: string; tenantId: string },
) => Promise<NextResponse>;

export function createAuthorizedRouteHandler(
  resource: string,
  action: string,
  executor: AuthorizedExecutor,
) {
  return createProtectedRouteHandler(async (request, session) => {
    await ensurePermission(session.userId, resource, action);
    return executor(request, session);
  });
}
