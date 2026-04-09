import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { created, ok } from "@/server/lib/response";
import { getPagination } from "@/server/lib/request-context";
import { listPersonel } from "@/server/modules/personel/service";
import { createAuthorizedRouteHandler } from "@/server/lib/authorized-route";

export const GET = createAuthorizedRouteHandler("ik_1", "view", async (request: NextRequest, session) => {
  const { page, pageSize, skip, take } = getPagination(request.nextUrl.searchParams);
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const result = await listPersonel({
    tenantId: session.tenantId,
    q,
    skip,
    take,
  });
  return ok(result.items, { page, pageSize, total: result.total });
});

export const POST = createAuthorizedRouteHandler("ik_2", "create", async (request: NextRequest, session) => {
  const payload = (await request.json()) as Record<string, unknown>;
  const createdPersonel = await prisma.employee.create({
    data: {
      tenantId: session.tenantId,
      tckn: String(payload.tckn),
      adSoyad: String(payload.adSoyad),
      unvan: payload.unvan ? String(payload.unvan) : null,
      org: payload.org ? String(payload.org) : null,
      sicil: payload.sicil ? String(payload.sicil) : null,
      statu: payload.statu ? String(payload.statu) : "Aktif",
      personelJson: payload as object,
    },
  });
  return created(createdPersonel);
});
