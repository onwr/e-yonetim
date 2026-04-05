import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/server/lib/session";
import { createRouteHandler } from "@/server/lib/route-handler";

type ProtectedExecutor = (
  request: NextRequest,
  context: { requestId: string; userId: string; tenantId: string },
) => Promise<NextResponse>;

export function createProtectedRouteHandler(executor: ProtectedExecutor) {
  return createRouteHandler(async (request, ctx) => {
    const session = await requireSession();
    return executor(request, {
      requestId: ctx.requestId,
      userId: session.userId,
      tenantId: session.tenantId,
    });
  });
}
