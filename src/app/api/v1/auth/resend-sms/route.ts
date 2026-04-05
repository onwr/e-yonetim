import { NextRequest } from "next/server";
import { createRouteHandler } from "@/server/lib/route-handler";
import { ok } from "@/server/lib/response";
import { validateSchema } from "@/server/lib/validation";
import { resendSmsSchema } from "@/server/modules/auth/schemas";
import { resendSmsVerification } from "@/server/modules/auth/service";
import { checkRateLimit } from "@/server/lib/rate-limit";

export const POST = createRouteHandler(async (request: NextRequest) => {
  checkRateLimit(request, "auth-resend-sms");
  const payload = validateSchema(resendSmsSchema, await request.json());
  await resendSmsVerification(payload);
  return ok({ message: "SMS kodu yeniden gonderildi." });
});

