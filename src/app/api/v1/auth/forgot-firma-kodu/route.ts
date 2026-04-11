import { NextRequest } from "next/server";
import { createRouteHandler } from "@/server/lib/route-handler";
import { ok } from "@/server/lib/response";
import { validateSchema } from "@/server/lib/validation";
import { forgotFirmaKoduSchema } from "@/server/modules/auth/schemas";
import { forgotFirmaKodu } from "@/server/modules/auth/service";
import { checkRateLimit } from "@/server/lib/rate-limit";

export const POST = createRouteHandler(async (request: NextRequest) => {
  checkRateLimit(request, "auth-forgot-firma-kodu");
  const payload = validateSchema(forgotFirmaKoduSchema, await request.json());
  await forgotFirmaKodu(payload);
  return ok({ message: "Firma kodunuz SMS olarak gonderildi." });
});
