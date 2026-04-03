import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import { badRequest, unauthorized } from "@/server/lib/errors";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";

export const PATCH = createProtectedRouteHandler(async (request: NextRequest, session) => {
  const payload = (await request.json()) as { oldPassword: string; newPassword: string };
  if (!payload.oldPassword || !payload.newPassword) {
    throw badRequest("Eski ve yeni sifre zorunludur.");
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    throw unauthorized();
  }
  const valid = await bcrypt.compare(payload.oldPassword, user.sifreHash);
  if (!valid) {
    throw unauthorized("Mevcut sifre hatali.");
  }
  const newHash = await bcrypt.hash(payload.newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { sifreHash: newHash },
  });
  return ok({ changed: true });
});
