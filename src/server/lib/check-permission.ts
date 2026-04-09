/**
 * Yetki Kontrol Yardımcısı
 * 
 * Kullanıcının preferences.yetkiMatrix alanından belirli bir modül/işlem için
 * yetki sorgulaması yapar.
 * 
 * Modül ID'leri (PERMISSION_MODULES ile eşleşmeli):
 *   Operasyon: op_1 (Kontrol Paneli), op_2 (Gelen Talepler)
 *   E-Yönetim: yo_1 (Puantaj Giriş), yo_2 (Puantaj Onay)
 *   E-İK:      ik_1 (Personel Listesi), ik_2 (Yeni Personel), ik_3 (SGK Giriş Talebi/Yeni),
 *              ik_4 (SGK Giriş Talebi/Liste), ik_5 (SGK Çıkış Talebi/Yeni), ik_6 (Kısıtlı Personel)
 *   E-Kurum:   ku_1 (İşveren Bilgileri), ku_2 (Firma Listesi), ku_3 (Şube Listesi), ku_4 (Departman Listesi)
 * 
 * Action türleri: view | create | edit | delete | verify | export
 */

import { prisma } from "@/server/db/prisma";
import { unauthorized } from "@/server/lib/errors";

export type PermAction = "view" | "create" | "edit" | "delete" | "verify" | "export";

/**
 * Verilen kullanıcının belirtilen modüldeki yetkisini kontrol eder.
 * Ana kullanıcı (isAnaKullanici=true) her zaman tüm yetkilere sahiptir.
 * Yetki matrisi kayıtlı değilse varsayılan olarak izin verir (soft enforcement).
 * 
 * @throws 403 Unauthorized if the user does not have the required permission
 */
export async function checkPermission(
  userId: string,
  tenantId: string,
  moduleId: string,
  action: PermAction,
): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId, deletedAt: null },
    select: { isAnaKullanici: true, preferences: true },
  });

  if (!user) throw unauthorized("Kullanıcı bulunamadı.");

  // Ana kullanıcı her zaman her yetkiye sahip
  if (user.isAnaKullanici) return;

  const prefs =
    user.preferences && typeof user.preferences === "object" && !Array.isArray(user.preferences)
      ? (user.preferences as Record<string, unknown>)
      : {};

  const matrix = prefs.yetkiMatrix;

  // Yetki matrisi hiç tanımlanmamışsa: varsayılan izin ver (setup henüz yapılmamış)
  if (!matrix || typeof matrix !== "object") return;

  const mod = (matrix as Record<string, any>)[moduleId];

  // Bu modül için kayıt yoksa: varsayılan izin ver
  if (!mod || typeof mod !== "object") return;

  const allowed = Boolean(mod[action]);
  if (!allowed) {
    throw unauthorized(`Bu işlem için yetkiniz bulunmamaktadır. (${moduleId}:${action})`);
  }
}

/**
 * Kullanıcının yetki matrisini döndürür.
 * Ana kullanıcı için tüm izinleri true olarak döndürür.
 */
export async function getUserPermissions(
  userId: string,
  tenantId: string,
): Promise<Record<string, Record<PermAction, boolean>> | null> {
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId, deletedAt: null },
    select: { isAnaKullanici: true, preferences: true },
  });

  if (!user) return null;

  if (user.isAnaKullanici) return null; // null = tüm yetkiler açık (Ana kullanıcı)

  const prefs =
    user.preferences && typeof user.preferences === "object" && !Array.isArray(user.preferences)
      ? (user.preferences as Record<string, unknown>)
      : {};

  return (prefs.yetkiMatrix as Record<string, Record<PermAction, boolean>>) ?? null;
}
