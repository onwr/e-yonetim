import { NextRequest } from "next/server";
import { createRouteHandler } from "@/server/lib/route-handler";
import { ok } from "@/server/lib/response";
import { validateSchema } from "@/server/lib/validation";
import { forgotPasswordSchema } from "@/server/modules/auth/schemas";
import { sendForgotPasswordSms } from "@/server/modules/auth/service";
import { checkRateLimit } from "@/server/lib/rate-limit";

export const POST = createRouteHandler(async (request: NextRequest) => {
  checkRateLimit(request, "auth-forgot-password");
  const payload = validateSchema(forgotPasswordSchema, await request.json());
  const res = await sendForgotPasswordSms(payload);
  return ok({ message: "Sifre sifirlama kodunuz SMS olarak gonderildi.", telefon: res.telefon });
});
