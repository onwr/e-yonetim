import { createRouteHandler } from "@/server/lib/route-handler";
import { ok } from "@/server/lib/response";
import { clearAuthCookies } from "@/server/lib/auth";

export const POST = createRouteHandler(async () => {
  await clearAuthCookies();
  return ok({ message: "Cikis yapildi." });
});
