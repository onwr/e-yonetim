import { Prisma, RequestStatus, RequestType } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { badRequest, notFound } from "@/server/lib/errors";
import { buildPersonelPayloadFromSgkGirisForm } from "@/lib/sgkGirisToPersonelPayload";
import type { SgkGirisFormState } from "@/types";

function mapType(type: string): RequestType {
  if (type === "sgk-giris") return RequestType.SGK_GIRIS;
  if (type === "sgk-cikis") return RequestType.SGK_CIKIS;
  throw badRequest("Gecersiz talep tipi.");
}

export function mapStatus(status: string): RequestStatus {
  if (status === "BEKLEYEN") return RequestStatus.BEKLEYEN;
  if (status === "ONAYLANAN" || status === "ONAYLANDI") return RequestStatus.ONAYLANDI;
  if (status === "REDDEDİLEN" || status === "REDDEDILDI") return RequestStatus.REDDEDILDI;
  throw badRequest("Gecersiz talep durumu.");
}

/** DB statusunu frontend'in beklediği string'e dönüştür */
function mapStatusToFrontend(status: RequestStatus): string {
  if (status === RequestStatus.BEKLEYEN) return "BEKLEYEN";
  if (status === RequestStatus.ONAYLANDI) return "ONAYLANAN";
  if (status === RequestStatus.REDDEDILDI) return "REDDEDİLEN";
  return String(status);
}

/** DB type'ını frontend string'e dönüştür */
function mapTypeToFrontend(type: RequestType): string {
  if (type === RequestType.SGK_GIRIS) return "sgk-giris";
  if (type === RequestType.SGK_CIKIS) return "sgk-cikis";
  return String(type).toLowerCase().replace("_", "-");
}

/**
 * Request kaydını frontend'in beklediği formata dönüştür.
 * payload JSON'ından adSoyad, tckn, sirket, sube, departman, unvan çıkarır.
 */
function formatTalep(item: any, approvals?: any[]) {
  const payload = item.payload && typeof item.payload === "object" ? (item.payload as Record<string, unknown>) : {};
  const formBilgileri = (payload.formBilgileri ?? payload) as Record<string, unknown>;

  const fromPayloadName =
    String(payload.adSoyad ?? formBilgileri.adSoyad ?? "")
      .trim()
      .replace(/\s+/g, " ") ||
    `${String(formBilgileri.ad ?? "").trim()} ${String(formBilgileri.soyad ?? "").trim()}`.trim();

  const adSoyad =
    String(item.employee?.adSoyad ?? "")
      .trim()
      .replace(/\s+/g, " ") ||
    fromPayloadName ||
    "-";

  const tckn =
    String(item.employee?.tckn ?? payload.tckn ?? formBilgileri.tckn ?? "")
      .trim() || "-";

  const sirket =
    String(payload.sirket ?? payload.firmaAdi ?? formBilgileri.firmaAdi ?? "")
      .trim() || "-";
  const sube =
    String(payload.sube ?? payload.subeAdi ?? formBilgileri.subeAdi ?? "")
      .trim() || "-";
  const departman = String(payload.departman ?? formBilgileri.departman ?? "").trim() || "-";
  const unvan =
    String(payload.unvan ?? payload.gorevi ?? formBilgileri.gorevi ?? "")
      .trim() || "-";

  const personelIdRaw = item.employeeId ?? payload.personelId;
  const personelId = typeof personelIdRaw === "string" && personelIdRaw.trim() ? personelIdRaw.trim() : undefined;
  const cikisTarihi = typeof payload.cikisTarihi === "string" ? payload.cikisTarihi : undefined;
  const cikisNedeni = typeof payload.cikisNedeni === "string" ? payload.cikisNedeni : undefined;

  // Onay bilgisi
  const latestApproval = approvals?.length ? approvals[approvals.length - 1] : null;
  const onayTarih = latestApproval?.createdAt
    ? new Date(latestApproval.createdAt).toLocaleDateString("tr-TR")
    : null;
  const onayYetkili = latestApproval?.user?.eposta ?? null;

  return {
    id: item.id,
    adSoyad,
    tckn,
    sgkNo: String(payload.sgkNo ?? "-"),
    sirket,
    sube,
    departman,
    unvan,
    durum: mapStatusToFrontend(item.status),
    tarih: new Date(item.createdAt).toLocaleDateString("tr-TR"),
    onayTarih,
    onayYetkili,
    type: mapTypeToFrontend(item.type),
    formBilgileri: formBilgileri,
    personelId,
    cikisTarihi,
    cikisNedeni,
    evrakUrl: typeof payload.evrakUrl === 'string' ? payload.evrakUrl : undefined,
    evraklar: Array.isArray(payload.evraklar) ? payload.evraklar : undefined,
  };
}

export async function listTalepler(input: {
  tenantId: string;
  type?: string;
  status?: string;
  q?: string;
  skip: number;
  take: number;
}) {
  const where: Prisma.RequestWhereInput = {
    tenantId: input.tenantId,
    deletedAt: null,
  };
  if (input.type) where.type = mapType(input.type);
  if (input.status) where.status = mapStatus(input.status);

  const [items, total] = await Promise.all([
    prisma.request.findMany({
      where,
      include: {
        employee: true,
        approvals: {
          include: { user: { select: { id: true, adSoyad: true, eposta: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      skip: input.skip,
      take: input.take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.request.count({ where }),
  ]);

  return { items: items.map((item) => formatTalep(item, item.approvals)), total };
}

export async function createTalep(tenantId: string, type: "sgk-giris" | "sgk-cikis", payload: unknown) {
  const p = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  let employeeId: string | undefined;
  if (type === "sgk-cikis") {
    const pid = typeof p.personelId === "string" ? p.personelId.trim() : "";
    if (pid) {
      const emp = await prisma.employee.findFirst({
        where: { id: pid, tenantId, deletedAt: null },
        select: { id: true },
      });
      if (emp) employeeId = emp.id;
    }
  }
  const created = await prisma.request.create({
    data: {
      tenantId,
      type: mapType(type),
      payload: payload as Prisma.InputJsonValue,
      status: RequestStatus.BEKLEYEN,
      ...(employeeId ? { employeeId } : {}),
    },
  });

  // Tüm tenant kullanıcılarına bildirim gönder
  try {
    const allUsers = await prisma.user.findMany({
      where: { tenantId, deletedAt: null },
      select: { id: true, preferences: true },
    });
    const typeLabel = type === "sgk-giris" ? "SGK Giriş" : "SGK Çıkış";
    const bildirimId = type === "sgk-giris" ? 9 : 10;
    const p = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const adSoyad = String(p.adSoyad ?? "").trim() || "Yeni Personel";

    // Sadece açıkça push:false yapmış kullanıcıları filtrele
    const filteredUsers = allUsers.filter((u) => {
      const prefs = u.preferences && typeof u.preferences === "object" && !Array.isArray(u.preferences)
        ? (u.preferences as Record<string, unknown>)
        : {};
      const bildirimler = Array.isArray(prefs.bildirimler) ? prefs.bildirimler as any[] : null;
      if (!bildirimler) return true; // Tercih yoksa varsayılan: gönder
      const pref = bildirimler.find((b: any) => b.id === bildirimId);
      return pref ? pref.push !== false : true;
    });

    if (filteredUsers.length > 0) {
      await prisma.notification.createMany({
        data: filteredUsers.map((u) => ({
          tenantId,
          userId: u.id,
          title: `Yeni ${typeLabel} Talebi`,
          body: `${adSoyad} adı personel için yeni bir ${typeLabel.toLowerCase()} talebi oluşturuldu.`,
        })),
      });
    }
  } catch {
    // bildirim gönderemesek de talep oluşturuldu, sessizce geç
  }

  return created;
}

export async function updateTalepStatus(input: {
  tenantId: string;
  talepId: string;
  status: RequestStatus;
  userId: string;
  note?: string;
}) {
  const talep = await prisma.request.findFirst({
    where: { id: input.talepId, tenantId: input.tenantId, deletedAt: null },
  });
  if (!talep) {
    throw notFound("Talep bulunamadi.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.request.update({
      where: { id: talep.id },
      data: { status: input.status },
    });

    await tx.requestApproval.create({
      data: {
        requestId: talep.id,
        userId: input.userId,
        status: input.status,
        note: input.note,
      },
    });

    if (input.status === RequestStatus.ONAYLANDI && talep.type === RequestType.SGK_GIRIS) {
      const payload = talep.payload && typeof talep.payload === "object" ? (talep.payload as Record<string, unknown>) : null;
      const formBilgileri = (payload?.formBilgileri ?? payload ?? {}) as SgkGirisFormState;
      const adSoyad =
        String(payload?.adSoyad ?? "").trim() ||
        `${formBilgileri.ad ?? ""} ${formBilgileri.soyad ?? ""}`.trim();
      const tckn = String(formBilgileri.tckn ?? "").trim();
      if (!tckn || !adSoyad) return;

      const existing = await tx.employee.findUnique({
        where: { tenantId_tckn: { tenantId: input.tenantId, tckn } },
      });
      const prevJson =
        existing?.personelJson && typeof existing.personelJson === "object" && !Array.isArray(existing.personelJson)
          ? (existing.personelJson as Record<string, unknown>)
          : {};
      const full = buildPersonelPayloadFromSgkGirisForm(formBilgileri, adSoyad, { prevPersonelJson: prevJson });
      const mergedJson = { ...prevJson, ...full } as Prisma.InputJsonValue;

      await tx.employee.upsert({
        where: { tenantId_tckn: { tenantId: input.tenantId, tckn } },
        create: {
          tenantId: input.tenantId,
          tckn,
          adSoyad: String(full.adSoyad),
          unvan: full.unvan != null ? String(full.unvan) : null,
          org: full.org != null ? String(full.org) : null,
          sicil: full.sicil != null ? String(full.sicil) : null,
          statu: full.statu != null ? String(full.statu) : "Aktif",
          personelJson: mergedJson,
        },
        update: {
          adSoyad: String(full.adSoyad),
          unvan: full.unvan != null ? String(full.unvan) : null,
          org: full.org != null ? String(full.org) : null,
          sicil: full.sicil != null ? String(full.sicil) : null,
          statu: full.statu != null ? String(full.statu) : "Aktif",
          personelJson: mergedJson,
        },
      });
    }

    if (input.status === RequestStatus.ONAYLANDI && talep.type === RequestType.SGK_CIKIS) {
      const rawPayload =
        talep.payload && typeof talep.payload === "object" ? (talep.payload as Record<string, unknown>) : {};
      const empIdRaw = talep.employeeId ?? rawPayload.personelId;
      const empId = typeof empIdRaw === "string" ? empIdRaw.trim() : "";
      const cikisTarihi =
        typeof rawPayload.cikisTarihi === "string" ? rawPayload.cikisTarihi.trim() : "";
      if (!empId) return;

      const emp = await tx.employee.findFirst({
        where: { id: empId, tenantId: input.tenantId, deletedAt: null },
      });
      if (!emp) return;

      const prevJson =
        emp.personelJson && typeof emp.personelJson === "object" && !Array.isArray(emp.personelJson)
          ? ({ ...(emp.personelJson as Record<string, unknown>) } as Record<string, unknown>)
          : {};
      prevJson.statu = "Pasif";
      if (cikisTarihi) prevJson.istenAyrilisTarihi = cikisTarihi;

      await tx.employee.update({
        where: { id: emp.id },
        data: {
          statu: "Pasif",
          personelJson: prevJson as Prisma.InputJsonValue,
        },
      });
    }
  });

  // Onay/Red bildirimi — tüm kullanıcılara gönder
  try {
    const allUsers = await prisma.user.findMany({
      where: { tenantId: input.tenantId, deletedAt: null },
      select: { id: true, preferences: true },
    });
    const rawPayload = talep.payload && typeof talep.payload === "object" ? (talep.payload as Record<string, unknown>) : {};
    const adSoyad = String(rawPayload.adSoyad ?? "").trim() || "Personel";
    const typeLabel = talep.type === RequestType.SGK_GIRIS ? "SGK Giriş" : "SGK Çıkış";
    const durumLabel = input.status === RequestStatus.ONAYLANDI ? "Onaylandı" : "Reddedildi";
    const emoji = input.status === RequestStatus.ONAYLANDI ? "✅" : "❌";

    const filteredUsers = allUsers.filter((u) => {
      const prefs = u.preferences && typeof u.preferences === "object" && !Array.isArray(u.preferences)
        ? (u.preferences as Record<string, unknown>)
        : {};
      const bildirimler = Array.isArray(prefs.bildirimler) ? prefs.bildirimler as any[] : null;
      if (!bildirimler) return true;
      const pref = bildirimler.find((b: any) => b.id === 11); // SGK onay/red
      return pref ? pref.push !== false : true;
    });

    if (filteredUsers.length > 0) {
      await prisma.notification.createMany({
        data: filteredUsers.map((u) => ({
          tenantId: input.tenantId,
          userId: u.id,
          title: `${emoji} ${typeLabel} Talebi ${durumLabel}`,
          body: `${adSoyad} adlı personelin ${typeLabel.toLowerCase()} talebi ${durumLabel.toLowerCase()}.${input.note ? ` Not: ${input.note}` : ""}`,
        })),
      });
    }
  } catch {
    // bildirim gönderilemese de işlem tamamlandı
  }
}

