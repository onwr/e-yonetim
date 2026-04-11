import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { createProtectedRouteHandler } from "@/server/lib/protected-route";
import { ok } from "@/server/lib/response";
import { mergeUserPreferences } from "@/server/lib/user-preferences";

const defaultBildirimler = [
  { id: 1, konu: "Abonelik yenileme zamanı geldiğinde", eposta: true, sms: true, push: true },
  { id: 2, konu: "Ödeme başarısız olduğunda", eposta: true, sms: true, push: true },
  { id: 3, konu: "Yeni şube açıldığında", eposta: true, sms: false, push: true },
  { id: 4, konu: "Şube kapatıldığında", eposta: true, sms: false, push: true },
  { id: 5, konu: "Yeni yetkili eklendiğinde", eposta: true, sms: true, push: true },
  { id: 6, konu: "Şube yetkilisi değiştirildiğinde", eposta: true, sms: true, push: true },
  { id: 7, konu: "Ana kullanıcı parolası değiştirildiğinde", eposta: true, sms: true, push: true },
  { id: 8, konu: "Tehlikeli işlem (hesap silme, abonelik iptali) talebi olduğunda", eposta: true, sms: true, push: true },
  { id: 9, konu: "Yeni SGK Giriş talebi oluşturulduğunda", eposta: true, sms: false, push: true },
  { id: 10, konu: "Yeni SGK Çıkış talebi oluşturulduğunda", eposta: true, sms: false, push: true },
  { id: 11, konu: "SGK talebi onaylandığında veya reddedildiğinde", eposta: true, sms: false, push: true },
];

export const GET = createProtectedRouteHandler(async (_request, session) => {
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, adSoyad: true, eposta: true, telefon: true, status: true, preferences: true },
  });
  const raw = user?.preferences && typeof user.preferences === "object" && !Array.isArray(user.preferences)
    ? (user.preferences as Record<string, unknown>)
    : {};
  const bildirimler = Array.isArray(raw.bildirimler) ? raw.bildirimler : defaultBildirimler;
  return ok({
    user: user
      ? {
          id: user.id,
          adSoyad: user.adSoyad,
          eposta: user.eposta,
          telefon: user.telefon,
          status: user.status,
        }
      : null,
    preferences: {
      twoFactorSms: Boolean(raw.twoFactorSms ?? false),
      bildirimler,
    },
  });
});

export const PATCH = createProtectedRouteHandler(async (request: NextRequest, session) => {
  const body = (await request.json()) as Record<string, unknown>;
  const current = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { preferences: true },
  });
  const merged = mergeUserPreferences(current?.preferences, body);
  await prisma.user.update({
    where: { id: session.userId },
    data: { preferences: merged },
  });
  const raw = merged && typeof merged === "object" && !Array.isArray(merged) ? (merged as Record<string, unknown>) : {};
  return ok({
    updated: true,
    preferences: {
      twoFactorSms: Boolean(raw.twoFactorSms ?? false),
      bildirimler: Array.isArray(raw.bildirimler) ? raw.bildirimler : defaultBildirimler,
    },
  });
});
