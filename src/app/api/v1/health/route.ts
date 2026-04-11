import { createRouteHandler } from "@/server/lib/route-handler";
import { ok } from "@/server/lib/response";

export const GET = createRouteHandler(async () => {
  return ok({
    status: "ok",
    service: "e-yonetim-api",
    timestamp: new Date().toISOString(),
  });
});
