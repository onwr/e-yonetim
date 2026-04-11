import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { notFound } from "@/server/lib/errors";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
  return createProtectedRouteHandler(async (_req, session) => {
    const { id } = await context.params;
    const document = await prisma.document.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
    });
    if (!document) {
      throw notFound("Evrak bulunamadi.");
    }
    return ok(document);
  })(request);
}

export async function DELETE(request: NextRequest, context: Params) {
  return createProtectedRouteHandler(async (_req, session) => {
    const { id } = await context.params;
    const document = await prisma.document.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
    });
    if (!document) {
      throw notFound("Evrak bulunamadi.");
    }
    await prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return ok({ deleted: true });
  })(request);
}
