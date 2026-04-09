import { NextRequest } from "next/server";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { created } from "@/server/lib/response";
import { createTalep } from "@/server/modules/talepler/service";

import { createAuthorizedRouteHandler } from "@/server/lib/authorized-route";

export const POST = createAuthorizedRouteHandler("ik_3", "create", async (request: NextRequest, session) => {
  const payload = await request.json();
  const talep = await createTalep(session.tenantId, "sgk-giris", payload);
  return created(talep);
});
