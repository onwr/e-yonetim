import { NextRequest } from "next/server";
import { createRouteHandler } from "@/server/lib/route-handler";
import { ok } from "@/server/lib/response";
import { validateSchema } from "@/server/lib/validation";
import { resetPasswordSchema } from "@/server/modules/auth/schemas";
import { resetPasswordWithSms } from "@/server/modules/auth/service";
import { checkRateLimit } from "@/server/lib/rate-limit";

export const POST = createRouteHandler(async (request: NextRequest) => {
  checkRateLimit(request, "auth-reset-password");
  const payload = validateSchema(resetPasswordSchema, await request.json());
  await resetPasswordWithSms(payload);
  return ok({ message: "Sifreniz basariyla guncellendi." });
});
