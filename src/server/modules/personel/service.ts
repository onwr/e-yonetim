import { prisma } from "@/server/db/prisma";
import { notFound } from "@/server/lib/errors";

export async function listPersonel(input: {
  tenantId: string;
  q?: string;
  skip: number;
  take: number;
}) {
  const where = {
    tenantId: input.tenantId,
    deletedAt: null,
    ...(input.q
      ? {
          OR: [
            { adSoyad: { contains: input.q } },
            { tckn: { contains: input.q } },
            { unvan: { contains: input.q } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
      skip: input.skip,
      take: input.take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.employee.count({ where }),
  ]);
  return { items, total };
}

export async function getPersonelById(tenantId: string, id: string) {
  const personel = await prisma.employee.findFirst({
    where: { id, tenantId, deletedAt: null },
  });
  if (!personel) {
    throw notFound("Personel bulunamadi.");
  }
  return personel;
}
