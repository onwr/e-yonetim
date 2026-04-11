import { createRouteHandler } from "@/server/lib/route-handler";
import { ok } from "@/server/lib/response";
import { iller } from "@/server/modules/referans/data";

export const GET = createRouteHandler(async () => ok(iller));
