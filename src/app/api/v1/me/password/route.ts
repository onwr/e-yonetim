import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import { badRequest, unauthorized } from "@/server/lib/errors";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";
import { sendNetgsmSms } from "@/server/lib/sms/netgsm";
import { normalizeTrPhone } from "@/server/lib/sms/phone";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/v1/me/password
 * Şifre değişikliği için SMS doğrulama kodu gönderir.
 * Body: { oldPassword: string }
 */
export const POST = createProtectedRouteHandler(async (request: NextRequest, session) => {
  const payload = (await request.json()) as { oldPassword: string; newPassword: string };
  if (!payload.oldPassword || !payload.newPassword) {
    throw badRequest("Mevcut ve yeni şifre zorunludur.");
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) throw unauthorized();

  // Mevcut şifreyi doğrula
  const valid = await bcrypt.compare(payload.oldPassword, user.sifreHash);
  if (!valid) throw unauthorized("Mevcut şifre hatalı.");

  // Yeni şifre hash'ini kaydet (geçici olarak SmsVerification payload'una)
  const newHash = await bcrypt.hash(payload.newPassword, 10);
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 dakika

  const telefon = normalizeTrPhone(user.telefon);

  await prisma.smsVerification.create({
    data: {
      tenantId: session.tenantId,
      userId: session.userId,
      telefon,
      type: "forgot_password",
      codeHash,
      expiresAt,
      payload: { newHash } as object,
    },
  });

  const msg = `e-Yonetim sifre degisiklik kodunuz: ${code}. Kod 5 dakika gecerlidir. Paylasmayin.`;

  try {
    const smsRes = await sendNetgsmSms({ telefon: user.telefon, message: msg });
    if (!smsRes.success) {
      console.log(`\n======================================================`);
      console.log(`📱 ŞİFRE DEĞİŞİKLİK SMS → ${user.telefon}`);
      console.log(`🔑 KOD: ${code}`);
      console.log(`======================================================\n`);
    }
  } catch {
    console.log(`\n======================================================`);
    console.log(`📱 ŞİFRE DEĞİŞİKLİK SMS → ${user.telefon}`);
    console.log(`🔑 KOD: ${code}`);
    console.log(`======================================================\n`);
  }

  return ok({ sent: true, telefon: user.telefon.slice(-4) });
});

/**
 * PATCH /api/v1/me/password
 * SMS kodunu doğrular ve şifreyi değiştirir.
 * Body: { smsKodu: string }
 */
export const PATCH = createProtectedRouteHandler(async (request: NextRequest, session) => {
  const payload = (await request.json()) as { smsKodu: string };
  if (!payload.smsKodu) throw badRequest("SMS kodu zorunludur.");

  const telefon = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { telefon: true },
  });
  if (!telefon) throw unauthorized();

  const normalized = normalizeTrPhone(telefon.telefon);

  const latest = await prisma.smsVerification.findFirst({
    where: {
      userId: session.userId,
      telefon: normalized,
      type: "forgot_password",
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) throw unauthorized("SMS kodu bulunamadı veya süresi doldu.");
  if (latest.attempts >= 5) throw unauthorized("Çok fazla hatalı deneme. Yeni kod isteyin.");

  const okCode = await bcrypt.compare(payload.smsKodu, latest.codeHash);
  if (!okCode) {
    await prisma.smsVerification.update({
      where: { id: latest.id },
      data: { attempts: { increment: 1 } },
    });
    throw unauthorized("Hatalı SMS kodu.");
  }

  // Kodu kullanıldı olarak işaretle
  await prisma.smsVerification.update({
    where: { id: latest.id },
    data: { usedAt: new Date() },
  });

  // Payload'dan yeni hash'i al
  const p = latest.payload && typeof latest.payload === "object" ? (latest.payload as Record<string, unknown>) : {};
  const newHash = String(p.newHash ?? "");
  if (!newHash) throw badRequest("Geçersiz doğrulama oturumu.");

  await prisma.user.update({
    where: { id: session.userId },
    data: { sifreHash: newHash },
  });

  return ok({ changed: true });
});
