import { prisma } from "@/server/db/prisma";
import { notFound } from "@/server/lib/errors";

export async function getFirma(tenantId: string) {
  const firma = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!firma) {
    throw notFound("Firma kaydi bulunamadi.");
  }
  return firma;
}

export async function updateFirma(tenantId: string, payload: Record<string, unknown>) {
  const firma = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      firmaUnvani: payload.firmaUnvani ? String(payload.firmaUnvani) : undefined,
      vergiNo: payload.vergiNo ? String(payload.vergiNo) : undefined,
      sektor: payload.sektor ? String(payload.sektor) : undefined,
      calisanSayisi: payload.calisanSayisi ? Number(payload.calisanSayisi) : undefined,
      subeSayisi: payload.subeSayisi ? Number(payload.subeSayisi) : undefined,
      il: payload.il ? String(payload.il) : undefined,
      ilce: payload.ilce ? String(payload.ilce) : undefined,
      mahalle: payload.mahalle ? String(payload.mahalle) : undefined,
      adres: payload.adres ? String(payload.adres) : undefined,
      postaKodu: payload.postaKodu ? String(payload.postaKodu) : undefined,
      telefon: payload.telefon ? String(payload.telefon) : undefined,
      ePosta: payload.ePosta ? String(payload.ePosta) : undefined,
      webSitesi: payload.webSitesi ? String(payload.webSitesi) : undefined,
    },
  });
  return firma;
}
