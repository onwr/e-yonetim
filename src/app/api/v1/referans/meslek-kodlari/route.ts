import { createRouteHandler } from "@/server/lib/route-handler";
import { ok } from "@/server/lib/response";
import meslekKodlari from "@/utils/sgk_meslek_kodlari.json";

export const GET = createRouteHandler(async () => {
  return ok(meslekKodlari);
});
