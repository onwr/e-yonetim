import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { notFound } from "@/server/lib/errors";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
  return createProtectedRouteHandler(async (_req, session) => {
    const { id } = await context.params;
    const talep = await prisma.request.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
    });
    if (!talep) {
      throw notFound("Talep bulunamadi.");
    }
    return ok(talep);
  })(request);
}
