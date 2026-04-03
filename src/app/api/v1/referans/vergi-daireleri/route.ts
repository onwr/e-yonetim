import { createRouteHandler } from "@/server/lib/route-handler";
import { ok } from "@/server/lib/response";
import { vergiDaireleri } from "@/server/modules/referans/data";

export const GET = createRouteHandler(async () => {
  return ok([...vergiDaireleri].sort((a, b) => a.name.localeCompare(b.name, "tr-TR")));
});
