import { NextRequest } from "next/server";
import { createRouteHandler } from "@/server/lib/route-handler";
import { ok } from "@/server/lib/response";
import { validateSchema } from "@/server/lib/validation";
import { loginSchema } from "@/server/modules/auth/schemas";
import { loginUser } from "@/server/modules/auth/service";
import { checkRateLimit } from "@/server/lib/rate-limit";

export const POST = createRouteHandler(async (request: NextRequest) => {
  checkRateLimit(request, "auth-login");
  const payload = validateSchema(loginSchema, await request.json());
  const result = await loginUser(payload);
  return ok({
    message: result.smsBypassed ? "Giris basarili." : "Giris bilgileri dogru, SMS dogrulama gerekli.",
    telefon: result.rawTelefon,
    maskedTelefon: result.telefon,
    smsBypassed: result.smsBypassed,
  });
});
