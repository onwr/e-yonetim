import { createRouteHandler } from "@/server/lib/route-handler";
import { ok } from "@/server/lib/response";
import { refreshSession } from "@/server/modules/auth/service";

export const POST = createRouteHandler(async () => {
  await refreshSession();
  return ok({ message: "Oturum yenilendi." });
});
