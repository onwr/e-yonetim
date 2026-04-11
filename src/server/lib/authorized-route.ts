import { NextRequest, NextResponse } from "next/server";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { checkPermission, PermAction } from "@/server/lib/check-permission";

type AuthorizedExecutor = (
  request: NextRequest,
  context: { requestId: string; userId: string; tenantId: string },
) => Promise<NextResponse>;

export function createAuthorizedRouteHandler(
  moduleId: string,
  action: PermAction,
  executor: AuthorizedExecutor,
) {
  return createProtectedRouteHandler(async (request, session) => {
    await checkPermission(session.userId, session.tenantId, moduleId, action);
    return executor(request, session);
  });
}
