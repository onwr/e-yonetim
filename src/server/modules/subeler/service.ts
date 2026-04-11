import { prisma } from "@/server/db/prisma";

type ListInput = {
  tenantId: string;
  search?: string;
  skip: number;
  take: number;
};

export async function listSubeler(input: ListInput) {
  const where = {
    tenantId: input.tenantId,
    deletedAt: null,
    ...(input.search
      ? {
          name: {
            contains: input.search,
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.branch.findMany({
      where,
      skip: input.skip,
      take: input.take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.branch.count({ where }),
  ]);

  return { items, total };
}

export async function createSube(tenantId: string, payload: Record<string, unknown>) {
  const branch = await prisma.branch.create({
    data: {
      tenantId,
      name: String(payload.subeAdi ?? payload.name ?? "Yeni Sube"),
      subeTuru: payload.subeTuru ? String(payload.subeTuru) : null,
      acilisTarihi: payload.acilisTarihi ? new Date(String(payload.acilisTarihi)) : null,
      vergiNo: payload.vergiNo ? String(payload.vergiNo) : null,
      vergiDairesi: payload.vergiDairesi ? String(payload.vergiDairesi) : null,
      sgkSicilNo: payload.sgkSicilNo ? String(payload.sgkSicilNo) : null,
      il: payload.il ? String(payload.il) : null,
      ilce: payload.ilce ? String(payload.ilce) : null,
      mahalle: payload.mahalle ? String(payload.mahalle) : null,
      adres: payload.adres ? String(payload.adres) : null,
      postaKodu: payload.postaKodu ? String(payload.postaKodu) : null,
      telefon: payload.telefon ? String(payload.telefon) : null,
      ePosta: payload.ePosta ? String(payload.ePosta) : null,
    },
  });
  return branch;
}
