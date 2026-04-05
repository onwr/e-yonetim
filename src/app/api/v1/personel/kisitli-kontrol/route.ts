import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";
import { badRequest } from "@/server/lib/errors";

/**
 * GET /api/v1/personel/kisitli-kontrol?tckn=...
 *
 * Belirtilen TCKN'nin kısıtlı personel listesinde olup olmadığını kontrol eder.
 */
export const GET = createProtectedRouteHandler(async (request: NextRequest, session) => {
  const { searchParams } = new URL(request.url);
  const tckn = searchParams.get("tckn")?.trim();

  if (!tckn || tckn.length !== 11) {
    throw badRequest("Gecerli bir TCKN giriniz (11 hane).");
  }

  // 1. Mevcut çalışan kaydını kontrol et
  const mevcutPersonel = await prisma.employee.findFirst({
    where: { tckn, tenantId: session.tenantId, deletedAt: null },
    select: { id: true, statu: true, adSoyad: true, createdAt: true },
  });

  if (mevcutPersonel) {
    if (mevcutPersonel.statu === "Aktif") {
      return ok({
        kisitli: true,
        sebep: "Bu TCKN zaten aktif çalışan olarak kayıtlı",
        tarih: new Date(mevcutPersonel.createdAt).toLocaleDateString("tr-TR"),
      });
    }
    if (mevcutPersonel.statu === "Pasif") {
      return ok({
        kisitli: true,
        sebep: "Pasif statüde kayıtlı personel",
        tarih: new Date(mevcutPersonel.createdAt).toLocaleDateString("tr-TR"),
      });
    }
  }

  // 2. Reddedilen talep geçmişi kontrol et — JSON path sorgusunu try/catch ile yap
  try {
    // Tüm REDDEDILDI talepleri çek, sonra payload içinde TCKN ara
    const redliTalepler = await prisma.request.findMany({
      where: {
        tenantId: session.tenantId,
        status: "REDDEDILDI",
        deletedAt: null,
      },
      include: {
        approvals: {
          where: { status: "REDDEDILDI" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const redliTalep = redliTalepler.find((t) => {
      const p = t.payload && typeof t.payload === "object" ? (t.payload as Record<string, unknown>) : {};
      const formBilgileri = p.formBilgileri && typeof p.formBilgileri === "object"
        ? (p.formBilgileri as Record<string, unknown>)
        : {};
      return String(p.tckn ?? formBilgileri.tckn ?? "") === tckn;
    });

    if (redliTalep) {
      const approval = redliTalep.approvals[0];
      return ok({
        kisitli: true,
        sebep: approval?.note ?? "Önceki SGK talebi reddedildi",
        tarih: approval?.createdAt
          ? new Date(approval.createdAt).toLocaleDateString("tr-TR")
          : new Date(redliTalep.createdAt).toLocaleDateString("tr-TR"),
      });
    }
  } catch {
    // Hata durumunda engelleme yapma
  }

  return ok({ kisitli: false });
});
