import { prisma } from "@/server/db/prisma";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";

export const GET = createProtectedRouteHandler(async (_request, session) => {
  const me = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      adSoyad: true,
      eposta: true,
      telefon: true,
      status: true,
      isAnaKullanici: true,
      tenantId: true,
    },
  });
  return ok(me);
});
