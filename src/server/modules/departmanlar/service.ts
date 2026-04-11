import { prisma } from "@/server/db/prisma";
import { notFound } from "@/server/lib/errors";

export async function listDepartmanlar(input: {
  tenantId: string;
  subeId?: string;
  search?: string;
  skip: number;
  take: number;
}) {
  const where = {
    tenantId: input.tenantId,
    deletedAt: null,
    ...(input.subeId ? { branchId: input.subeId } : {}),
    ...(input.search
      ? {
          name: {
            contains: input.search,
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.department.findMany({
      where,
      include: {
        branch: true,
        yetkiliUser: { select: { id: true, adSoyad: true } },
      },
      skip: input.skip,
      take: input.take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.department.count({ where }),
  ]);

  return { items, total };
}

export async function createDepartman(tenantId: string, payload: Record<string, unknown>) {
  const branchId = String(payload.subeId ?? payload.branchId ?? "");
  if (!branchId) {
    throw notFound("Gecerli bir sube secimi gereklidir.");
  }
  const department = await prisma.department.create({
    data: {
      tenantId,
      branchId,
      name: String(payload.departmanAdi ?? payload.name ?? "Yeni Departman"),
      masrafKodu: payload.masrafKodu ? String(payload.masrafKodu) : null,
      acilisTarihi: payload.acilisTarihi ? new Date(String(payload.acilisTarihi)) : null,
      yetkiliUserId: payload.yetkiliId ? String(payload.yetkiliId) : null,
    },
    include: {
      branch: true,
      yetkiliUser: { select: { id: true, adSoyad: true } },
    },
  });
  return department;
}
