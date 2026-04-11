import { NextRequest } from "next/server";
import { RequestStatus } from "@prisma/client";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";
import { mapStatus, updateTalepStatus } from "@/server/modules/talepler/service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Params) {
  return createProtectedRouteHandler(async (req, session) => {
    const { id } = await context.params;
    const payload = (await req.json()) as { status: RequestStatus | string; note?: string };
    await updateTalepStatus({
      tenantId: session.tenantId,
      talepId: id,
      status: mapStatus(payload.status),
      userId: session.userId,
      note: payload.note,
    });
    return ok({ updated: true });
  })(request);
}
