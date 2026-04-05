import { NextRequest } from "next/server";
import { createRouteHandler } from "@/server/lib/route-handler";
import { ok } from "@/server/lib/response";
import { validateSchema } from "@/server/lib/validation";
import { verifySmsSchema } from "@/server/modules/auth/schemas";
import { verifySmsAndCreateSession } from "@/server/modules/auth/service";
import { checkRateLimit } from "@/server/lib/rate-limit";

export const POST = createRouteHandler(async (request: NextRequest) => {
  checkRateLimit(request, "auth-verify-sms");
  const payload = validateSchema(verifySmsSchema, await request.json());
  const result = await verifySmsAndCreateSession(payload);
  return ok({
    message: "SMS dogrulama basarili.",
    token: result.token,
    firmaKodu: result.firmaKodu,
  });
});
