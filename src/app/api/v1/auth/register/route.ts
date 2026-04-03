import { NextRequest } from "next/server";
import { createRouteHandler } from "@/server/lib/route-handler";
import { created } from "@/server/lib/response";
import { validateSchema } from "@/server/lib/validation";
import { registerSchema } from "@/server/modules/auth/schemas";
import { registerUser } from "@/server/modules/auth/service";
import { checkRateLimit } from "@/server/lib/rate-limit";

export const POST = createRouteHandler(async (request: NextRequest) => {
  checkRateLimit(request, "auth-register");
  const payload = validateSchema(registerSchema, await request.json());
  const result = await registerUser(payload);
  return created({
    message: result.smsBypassed ? "Kayit basarili." : "Kayit basarili, SMS asamasina geciliyor.",
    telefon: result.telefon,
    firmaKodu: result.firmaKodu,
    smsBypassed: result.smsBypassed,
  });
});
