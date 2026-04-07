import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import { conflict, notFound, unauthorized } from "@/server/lib/errors";
import { issueAuthCookies, verifyRefreshToken, readRefreshToken } from "@/server/lib/auth";
import { sendNetgsmSms } from "@/server/lib/sms/netgsm";
import { normalizeTrPhone } from "@/server/lib/sms/phone";



function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return phone;
  const last4 = digits.slice(-4);
  return `(5**) *** ${last4.slice(0, 2)} ${last4.slice(2, 4)}`;
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateFirmaKodu() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

async function createAndSendSmsVerification(input: {
  tenantId: string;
  userId?: string;
  telefon: string;
  type: "register" | "login";
}) {
  const code = generateVerificationCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 dakika

  const record = await prisma.smsVerification.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      telefon: normalizeTrPhone(input.telefon),
      type: input.type,
      codeHash,
      expiresAt,
    },
  });

  const msg = `e-Yonetim dogrulama kodunuz: ${code}. Kod 3 dakika gecerlidir. Paylasmayin.`;
  
  try {
    const smsRes = await sendNetgsmSms({ telefon: input.telefon, message: msg });
    
    if (smsRes.success) {
      console.log(`[NETGSM] SMS Başarıyla gönderildi -> ${input.telefon}`);
    } else {
      console.warn(`[SMS API UYARISI] NetGSM üzerinden SMS gönderimi başarısız! Terminal üzerinden devam ediliyor...`);
      console.log(`\n======================================================`);
      console.log(`📱 SMS GÖNDERİLECEK TELEFON : ${input.telefon}`);
      console.log(`🔑 OLUŞTURULAN SMS KODU     : ${code}`);
      console.log(`======================================================\n`);
    }
  } catch (error) {
    console.warn(`[SMS API HATASI] Servise ulaşılamadı. Terminal üzerinden devam ediliyor...`);
    console.log(`\n======================================================`);
    console.log(`📱 SMS GÖNDERİLECEK TELEFON : ${input.telefon}`);
    console.log(`🔑 OLUŞTURULAN SMS KODU     : ${code}`);
    console.log(`======================================================\n`);
  }

  return { ok: true as const, bypassVerify: false as const, verificationId: record.id };
}

export async function registerUser(input: {
  adSoyad: string;
  tckn: string;
  eposta: string;
  telefon: string;
  sifre: string;
}) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ tckn: input.tckn }, { eposta: input.eposta }],
    },
  });
  if (existingUser) {
    throw conflict("Bu TCKN veya e-posta ile kayitli kullanici zaten var.");
  }

  const tenant = await prisma.tenant.create({
    data: {
      firmaKodu: generateFirmaKodu(),
      ePosta: input.eposta,
      telefon: input.telefon,
      onboardingCompleted: false,
    },
  });

  const sifreHash = await bcrypt.hash(input.sifre, 10);
  const createdUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      adSoyad: input.adSoyad,
      tckn: input.tckn,
      eposta: input.eposta,
      telefon: normalizePhone(input.telefon),
      sifreHash,
      isAnaKullanici: true,
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: "admin",
      description: "Tam yetkili ana kullanici rolu",
    },
  });

  const fullPermission = await prisma.permission.upsert({
    where: {
      resource_action_scope: {
        resource: "*",
        action: "*",
        scope: "*",
      },
    },
    update: {},
    create: {
      resource: "*",
      action: "*",
      scope: "*",
    },
  });

  await prisma.rolePermission.create({
    data: {
      roleId: adminRole.id,
      permissionId: fullPermission.id,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: createdUser.id,
      roleId: adminRole.id,
    },
  });

  await createAndSendSmsVerification({
    tenantId: tenant.id,
    userId: createdUser.id,
    telefon: input.telefon,
    type: "register",
  });

  return {
    telefon: input.telefon,
    firmaKodu: tenant.firmaKodu,
    smsBypassed: false,
  };
}

export async function loginUser(input: { firmaKodu: string; tckn: string; sifre: string }) {
  const tenant = await prisma.tenant.findUnique({
    where: { firmaKodu: input.firmaKodu },
  });
  if (!tenant) {
    throw unauthorized("Firma kodu veya kullanici bilgileri hatali.");
  }

  const user = await prisma.user.findFirst({
    where: {
      tenantId: tenant.id,
      tckn: input.tckn,
      deletedAt: null,
    },
  });
  if (!user) {
    throw unauthorized("Firma kodu veya kullanici bilgileri hatali.");
  }

  const passwordValid = await bcrypt.compare(input.sifre, user.sifreHash);
  if (!passwordValid) {
    throw unauthorized("Firma kodu veya kullanici bilgileri hatali.");
  }

  await createAndSendSmsVerification({
    tenantId: tenant.id,
    userId: user.id,
    telefon: user.telefon,
    type: "login",
  });

  return {
    telefon: maskPhone(user.telefon),
    rawTelefon: user.telefon,
    userId: user.id,
    tenantId: tenant.id,
    smsBypassed: false,
  };
}

export async function verifySmsAndCreateSession(input: {
  telefon: string;
  smsKodu: string;
  type: "register" | "login";
}) {
  const normalized = normalizeTrPhone(input.telefon);
  const altPhone = normalized.startsWith("0") ? normalized.slice(1) : normalized;

  const user = await prisma.user.findFirst({
    where: { 
      OR: [{ telefon: normalized }, { telefon: altPhone }],
      deletedAt: null 
    },
    include: { tenant: true },
  });
  if (!user) {
    throw notFound("Telefon numarasi ile eslesen kullanici bulunamadi.");
  }

  // En son, kullanılmamış ve süresi geçmemiş kod
  const latest = await prisma.smsVerification.findFirst({
    where: {
      tenantId: user.tenantId,
      userId: user.id,
      telefon: normalized,
      type: input.type,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) {
    throw unauthorized("SMS kodu bulunamadi veya suresi doldu. Yeni kod isteyin.");
  }
  if (latest.attempts >= 5) {
    throw unauthorized("Cok fazla hatali deneme. Yeni kod isteyin.");
  }

  const okCode = await bcrypt.compare(input.smsKodu, latest.codeHash);
  if (!okCode) {
    await prisma.smsVerification.update({
      where: { id: latest.id },
      data: { attempts: { increment: 1 } },
    });
    throw unauthorized("Hatali SMS kodu.");
  }

  await prisma.smsVerification.update({
    where: { id: latest.id },
    data: { usedAt: new Date() },
  });

  await issueAuthCookies({ sub: user.id, tenantId: user.tenantId });
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    token: "cookie-session",
    firmaKodu: input.type === "register" ? user.tenant.firmaKodu : undefined,
  };
}

export async function resendSmsVerification(input: { telefon: string; type: "register" | "login" }) {
  const normalized = normalizeTrPhone(input.telefon);
  const altPhone = normalized.startsWith("0") ? normalized.slice(1) : normalized;

  const user = await prisma.user.findFirst({
    where: { 
      OR: [{ telefon: normalized }, { telefon: altPhone }],
      deletedAt: null 
    },
  });
  if (!user) {
    throw notFound("Telefon numarasi ile eslesen kullanici bulunamadi.");
  }
  await createAndSendSmsVerification({
    tenantId: user.tenantId,
    userId: user.id,
    telefon: normalized,
    type: input.type,
  });
  return { success: true as const };
}

export async function refreshSession() {
  const refreshToken = await readRefreshToken();
  if (!refreshToken) {
    throw unauthorized("Refresh token bulunamadi.");
  }
  const payload = await verifyRefreshToken(refreshToken);
  await issueAuthCookies({ sub: payload.sub, tenantId: payload.tenantId, role: payload.role });
  return { success: true };
}
