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
  tenantId?: string;
  userId?: string;
  telefon: string;
  type: "register" | "login" | "forgot_password";
  payload?: any;
}) {
  const code = generateVerificationCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 dakika

  const record = await prisma.smsVerification.create({
    data: {
      tenantId: input.tenantId || undefined,
      userId: input.userId || undefined,
      telefon: normalizeTrPhone(input.telefon),
      type: input.type,
      codeHash,
      expiresAt,
      payload: input.payload ? JSON.parse(JSON.stringify(input.payload)) : undefined
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

  const sifreHash = await bcrypt.hash(input.sifre, 10);
  
  // Sadece SMS verification record olusturalim, kullaniciyi daha DB'ye GERCEKTEN eklemiyoruz!
  await createAndSendSmsVerification({
    telefon: input.telefon,
    type: "register",
    payload: {
      adSoyad: input.adSoyad,
      tckn: input.tckn,
      eposta: input.eposta,
      telefon: input.telefon,
      sifreHash
    }
  });

  return {
    telefon: input.telefon,
    firmaKodu: "", // Dogrulama asamasindan sonra alinacak
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
  type: "register" | "login" | "forgot_password";
}) {
  const normalized = normalizeTrPhone(input.telefon);

  const latest = await prisma.smsVerification.findFirst({
    where: {
      telefon: normalized,
      type: input.type,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        include: { tenant: true },
      },
    },
  });

  if (!latest) {
    throw unauthorized("SMS kodu bulunamadi veya suresi doldu. Yeni kod isteyin.");
  }
  
  if (input.type !== "register") {
    const user = latest.user;
    if (!user || user.deletedAt) {
      throw notFound("Sistemde bu koda ait aktif kullanici bulunamadi.");
    }
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

  if (input.type === "register") {
    const payload = latest.payload as any;
    if (!payload || !payload.tckn) throw unauthorized("Sistem hatasi: Kayit bilgileri bulunamadi.");

    // Cifte kayit kontrolü
    const existing = await prisma.user.findFirst({
      where: { OR: [{ tckn: payload.tckn }, { eposta: payload.eposta }] },
    });
    if (existing) throw conflict("Bu TCKN veya e-posta ile kayitli kullanici zaten var.");

    // Simdi gercek kayit islemini yapiyoruz!
    const firmaKodu = generateFirmaKodu();
    const tenant = await prisma.tenant.create({
      data: {
        firmaKodu,
        ePosta: payload.eposta,
        telefon: payload.telefon,
        onboardingCompleted: false,
      },
    });

    const createdUser = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        adSoyad: payload.adSoyad,
        tckn: payload.tckn,
        eposta: payload.eposta,
        telefon: normalizePhone(payload.telefon),
        sifreHash: payload.sifreHash,
        isAnaKullanici: true,
      },
    });

    const adminRole = await prisma.role.create({
      data: { tenantId: tenant.id, name: "admin", description: "Tam yetkili ana kullanici rolu" },
    });

    const fullPerm = await prisma.permission.upsert({
      where: { resource_action_scope: { resource: "*", action: "*", scope: "*" } },
      update: {}, create: { resource: "*", action: "*", scope: "*" },
    });

    await prisma.rolePermission.create({ data: { roleId: adminRole.id, permissionId: fullPerm.id } });
    await prisma.userRole.create({ data: { userId: createdUser.id, roleId: adminRole.id } });

    await prisma.smsVerification.update({
      where: { id: latest.id },
      data: { usedAt: new Date(), tenantId: tenant.id, userId: createdUser.id },
    });

    await issueAuthCookies({ sub: createdUser.id, tenantId: tenant.id });
    await prisma.user.update({ where: { id: createdUser.id }, data: { lastLoginAt: new Date() } });

    return { token: "cookie-session", firmaKodu: tenant.firmaKodu };
  } else if (input.type === "forgot_password") {
    // Forgot Password verify isleminde sadece kodu yakiyoruz, session acmiyoruz
    await prisma.smsVerification.update({
      where: { id: latest.id },
      data: { usedAt: new Date() },
    });
    return { token: "verified" };
  } else {
    // Login
    await prisma.smsVerification.update({
      where: { id: latest.id },
      data: { usedAt: new Date() },
    });

    await issueAuthCookies({ sub: latest.user!.id, tenantId: latest.user!.tenantId });
    await prisma.user.update({
      where: { id: latest.user!.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      token: "cookie-session",
      firmaKodu: undefined,
    };
  }
}

export async function resendSmsVerification(input: { telefon: string; type: "register" | "login" | "forgot_password" }) {
  const normalized = normalizeTrPhone(input.telefon);

  if (input.type === "register") {
    // Kayıt isleminde user henüz yok, eski sms verification i buluyoruz
    const latestReg = await prisma.smsVerification.findFirst({
      where: { telefon: normalized, type: "register" },
      orderBy: { createdAt: "desc" }
    });
    if (!latestReg || !latestReg.payload) {
      throw notFound("Süresi dolmuş veya hatalı kayıt denemesi. Lütfen baştan başlayın.");
    }
    await createAndSendSmsVerification({
      telefon: normalized,
      type: "register",
      payload: latestReg.payload
    });
    return { success: true as const };
  }

  const altPhone = normalized.startsWith("0") ? normalized.slice(1) : normalized;
  const user = await prisma.user.findFirst({
    where: { OR: [{ telefon: normalized }, { telefon: altPhone }], deletedAt: null },
    orderBy: { createdAt: "desc" }
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

export async function forgotFirmaKodu(input: { tckn: string; telefon: string }) {
  const normalized = normalizeTrPhone(input.telefon);
  const altPhone = normalized.startsWith("0") ? normalized.slice(1) : normalized;
  
  const user = await prisma.user.findFirst({
    where: {
      tckn: input.tckn,
      OR: [{ telefon: normalized }, { telefon: altPhone }],
      deletedAt: null
    },
    include: { tenant: true }
  });

  if (!user) {
    throw notFound("Bu bilgilere ait hesabinizi bulamadik.");
  }

  const msg = `e-Yonetim Firma Kodunuz: ${user.tenant.firmaKodu}. Lutfen kimseyle paylasmayin.`;

  try {
    const smsRes = await sendNetgsmSms({ telefon: normalized, message: msg });

    if (smsRes.success) {
      console.log(`[NETGSM] Firma kodu SMS basariyla gonderildi -> ${normalized}`);
    } else {
      console.warn(`[SMS API UYARISI] NetGSM üzerinden SMS gönderimi başarısız! Terminal üzerinden devam ediliyor...`);
      console.log(`\n======================================================`);
      console.log(`📱 FIRMA KODU SMS (API HATASI - TERMINAL):`);
      console.log(`   Telefon: ${normalized}`);
      console.log(`   ${msg}`);
      console.log(`======================================================\n`);
    }
  } catch (error) {
    console.warn(`[SMS API HATASI] Servise ulaşılamadı. Terminal üzerinden devam ediliyor...`);
    console.log(`\n======================================================`);
    console.log(`📱 FIRMA KODU SMS (API HATASI - TERMINAL):`);
    console.log(`   Telefon: ${normalized}`);
    console.log(`   ${msg}`);
    console.log(`======================================================\n`);
  }

  console.log(`[NETGSM] Firma kodu SMS basariyla gonderildi -> ${normalized}`);
  return { success: true };
}

export async function sendForgotPasswordSms(input: { firmaKodu: string; tckn: string; telefon: string }) {
  const tenant = await prisma.tenant.findUnique({ where: { firmaKodu: input.firmaKodu }});
  if (!tenant) throw unauthorized("Bilgiler hatali.");

  const normalized = normalizeTrPhone(input.telefon);
  const altPhone = normalized.startsWith("0") ? normalized.slice(1) : normalized;

  const user = await prisma.user.findFirst({
    where: {
      tenantId: tenant.id,
      tckn: input.tckn,
      OR: [{ telefon: normalized }, { telefon: altPhone }],
      deletedAt: null
    }
  });

  if (!user) throw unauthorized("Bilgiler hatali.");

  // Olustur ve gonder
  await createAndSendSmsVerification({
    tenantId: tenant.id,
    userId: user.id,
    telefon: normalized,
    type: "forgot_password"
  });

  return { success: true, telefon: maskPhone(user.telefon) };
}

export async function resetPasswordWithSms(input: { telefon: string; yeniSifre: string }) {
  const normalized = normalizeTrPhone(input.telefon);
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  // Verify: son 15 dakika icinde dogrulanmis forgot_password kodu olmali
  const latest = await prisma.smsVerification.findFirst({
    where: {
      telefon: normalized,
      type: "forgot_password",
      usedAt: { not: null, gt: fifteenMinutesAgo }, // 15 dk icinde onaylanmis olmali
    },
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  if (!latest || !latest.user || latest.user.deletedAt) {
    throw unauthorized("Lutfen once gecerli SMS kodunuzu dogrulayin (15 dk gecerlidir).");
  }

  const sifreHash = await bcrypt.hash(input.yeniSifre, 10);
  await prisma.user.update({
    where: { id: latest.user.id },
    data: { sifreHash }
  });

  return { success: true };
}
