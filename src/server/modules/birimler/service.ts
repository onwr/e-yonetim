import { prisma } from "@/server/db/prisma";
import { notFound } from "@/server/lib/errors";

export async function listBirimler(input: {
  tenantId: string;
  departmanId?: string;
  search?: string;
  skip: number;
  take: number;
}) {
  const where = {
    tenantId: input.tenantId,
    deletedAt: null,
    ...(input.departmanId ? { departmentId: input.departmanId } : {}),
    ...(input.search
      ? {
          name: {
            contains: input.search,
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.unit.findMany({
      where,
      include: {
        department: {
          include: {
            branch: true,
            yetkiliUser: { select: { id: true, adSoyad: true } },
          },
        },
      },
      skip: input.skip,
      take: input.take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.unit.count({ where }),
  ]);

  return { items, total };
}

export async function createBirim(tenantId: string, payload: Record<string, unknown>) {
  const departmentId = String(payload.departmanId ?? payload.departmentId ?? "");
  if (!departmentId) {
    throw notFound("Gecerli bir departman secimi gereklidir.");
  }

  const dept = await prisma.department.findFirst({
    where: { id: departmentId, tenantId, deletedAt: null },
  });
  if (!dept) {
    throw notFound("Departman bulunamadi.");
  }

  const unit = await prisma.unit.create({
    data: {
      tenantId,
      departmentId,
      name: String(payload.birimAdi ?? payload.name ?? "Yeni Birim"),
    },
    include: {
      department: {
        include: {
          branch: true,
          yetkiliUser: { select: { id: true, adSoyad: true } },
        },
      },
    },
  });
  return unit;
}
