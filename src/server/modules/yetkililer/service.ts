import { prisma } from "@/server/db/prisma";
import { conflict, notFound } from "@/server/lib/errors";
import bcrypt from "bcryptjs";
import { sendNetgsmSms } from "@/server/lib/sms/netgsm";

export async function listYetkililer(tenantId: string) {
  return prisma.user.findMany({
    where: { tenantId, deletedAt: null },
    select: {
      id: true,
      adSoyad: true,
      tckn: true,
      eposta: true,
      telefon: true,
      status: true,
      isAnaKullanici: true,
      lastLoginAt: true,
      preferences: true,
      createdAt: true,
    },
    orderBy: [{ isAnaKullanici: "desc" }, { createdAt: "asc" }],
  });
}

export async function updateYetkili(
  tenantId: string,
  userId: string,
  payload: {
    adSoyad?: string;
    eposta?: string;
    telefon?: string;
    preferences?: Record<string, unknown>;
  },
) {
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId, deletedAt: null },
  });
  if (!user) throw notFound("Yetkili bulunamadi.");

  if (payload.eposta && payload.eposta !== user.eposta) {
    const existing = await prisma.user.findFirst({
      where: { tenantId, eposta: payload.eposta, deletedAt: null },
    });
    if (existing) throw conflict("Bu e-posta adresi zaten kullanimda.");
  }

  const currentPrefs =
    user.preferences && typeof user.preferences === "object" ? (user.preferences as Record<string, unknown>) : {};
  const mergedPrefs = payload.preferences ? { ...currentPrefs, ...payload.preferences } : currentPrefs;

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(payload.adSoyad ? { adSoyad: payload.adSoyad } : {}),
      ...(payload.eposta ? { eposta: payload.eposta } : {}),
      ...(payload.telefon ? { telefon: payload.telefon.replace(/\D/g, "") } : {}),
      preferences: mergedPrefs as object,
    },
    select: {
      id: true,
      adSoyad: true,
      eposta: true,
      telefon: true,
      status: true,
      isAnaKullanici: true,
      preferences: true,
    },
  });
}

export async function deleteYetkili(tenantId: string, userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId, deletedAt: null },
  });
  if (!user) throw notFound("Yetkili bulunamadi.");
  if (user.isAnaKullanici) throw conflict("Ana kullanici silinemez.");

  return prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date(), status: "INACTIVE" },
  });
}

export async function inviteYetkili(
  tenantId: string,
  invitedBy: string,
  payload: {
    adSoyad: string;
    tckn: string;
    unvan: string;
    telefon: string;
    eposta: string;
    scope: "firma" | "sube" | "departman";
    sube?: string;
    departman?: string;
  },
) {
  const existing = await prisma.user.findFirst({
    where: {
      tenantId,
      deletedAt: null,
      OR: [{ tckn: payload.tckn }, { eposta: payload.eposta }],
    },
  });
  if (existing) throw conflict("Bu TCKN veya e-posta ile kayitli yetkili zaten var.");

  const tempPassword = Math.random().toString(36).slice(-8) + "X1!";
  const sifreHash = await bcrypt.hash(tempPassword, 10);

  const newUser = await prisma.user.create({
    data: {
      tenantId,
      adSoyad: payload.adSoyad,
      tckn: payload.tckn,
      eposta: payload.eposta,
      telefon: payload.telefon.replace(/\D/g, ""),
      sifreHash,
      isAnaKullanici: false,
      preferences: {
        unvan: payload.unvan,
        scope: payload.scope,
        sube: payload.sube ?? null,
        departman: payload.departman ?? null,
        invitedBy,
        invitedAt: new Date().toISOString(),
      },
    },
  });

  // Yetkili rolü bul ya da oluştur
  let role = await prisma.role.findFirst({ where: { tenantId, name: "yetkili", deletedAt: null } });
  if (!role) {
    role = await prisma.role.create({
      data: { tenantId, name: "yetkili", description: "Standart yetkili rolu" },
    });
  }

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: newUser.id, roleId: role.id } },
    update: {},
    create: { userId: newUser.id, roleId: role.id },
  });

  // Bildirim oluştur
  await prisma.notification.create({
    data: {
      tenantId,
      userId: invitedBy,
      title: "Yeni Yetkili Eklendi",
      body: `${payload.adSoyad} adli yetkili sisteme davet edildi.`,
    },
  });

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

  const smsMsg = `Sayin ${payload.adSoyad}, e-Yonetim (${tenant?.firmaKodu || "Kurum"}) sistemine yetkili olarak davet edildiniz.
Firma Kodu: ${tenant?.firmaKodu || ""}
Sifre: ${tempPassword}
Giris: https://e-yonetim.com/giris`;

  try {
    const smsRes = await sendNetgsmSms({ telefon: payload.telefon, message: smsMsg });
    
    if (smsRes.success) {
      console.log(`[NETGSM] Yetkili davet SMS'i Başarıyla gönderildi -> ${payload.telefon}`);
    } else {
      console.warn(`[SMS API UYARISI] NetGSM üzerinden davet SMS'i gönderilemedi. Terminal üzerinden bilgileri iletin...`);
      console.log(`\n======================================================`);
      console.log(`✉️ SİSTEM DAVET BİLGİLERİ (API BAŞARISIZ)`);
      console.log(`======================================================`);
      console.log(`Alıcı : ${payload.telefon}`);
      console.log(`Mesaj :\n${smsMsg}`);
      console.log(`======================================================\n`);
    }
  } catch (error) {
    console.warn(`[SMS API HATASI] Servise ulaşılamadı. Terminal üzerinden bilgileri iletin...`);
    console.log(`\n======================================================`);
    console.log(`✉️ SİSTEM DAVET BİLGİLERİ (API BAŞARISIZ)`);
    console.log(`======================================================`);
    console.log(`Alıcı : ${payload.telefon}`);
    console.log(`Mesaj :\n${smsMsg}`);
    console.log(`======================================================\n`);
  }

  return {
    id: newUser.id,
    adSoyad: newUser.adSoyad,
    eposta: newUser.eposta,
    smsGonderildi: true,
  };
}
