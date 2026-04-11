import { NextRequest } from "next/server";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";
import { badRequest } from "@/server/lib/errors";
import { getPuantaj, upsertPuantaj } from "@/server/modules/puantaj/service";

import { createAuthorizedRouteHandler } from "@/server/lib/authorized-route";

export const GET = createAuthorizedRouteHandler("yo_1", "view", async (request: NextRequest, session) => {
  const year = Number(request.nextUrl.searchParams.get("year"));
  const month = Number(request.nextUrl.searchParams.get("month"));
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    throw badRequest("year ve month query parametreleri zorunludur.");
  }
  const rows = await getPuantaj(session.tenantId, year, month);
  return ok(rows);
});

export const PUT = createAuthorizedRouteHandler("yo_1", "edit", async (request: NextRequest, session) => {
  const payload = (await request.json()) as Array<{
    employeeId: string;
    year: number;
    month: number;
    data: unknown;
    overtime?: unknown;
    isLocked?: boolean;
  }>;
  await upsertPuantaj(session.tenantId, payload);
  return ok({ updated: true });
});
