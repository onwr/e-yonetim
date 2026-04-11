import { NextRequest } from "next/server";
import { createRouteHandler } from "@/server/lib/route-handler";
import { ok } from "@/server/lib/response";
import { ilceler } from "@/server/modules/referans/data";

export const GET = createRouteHandler(async (request: NextRequest) => {
  const il = request.nextUrl.searchParams.get("il") ?? "";
  return ok(ilceler[il] ?? []);
});
