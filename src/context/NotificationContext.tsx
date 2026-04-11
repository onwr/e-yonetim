"use client";
import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from "react";

export interface Notification {
  id: string;
  type: 
    | "sgk-giris" | "sgk-cikis" | "onay" | "red" 
    | "is-kazasi" | "sicil"
    | "abonelik" | "odeme" | "sube-acilis" | "sube-kapanis"
    | "yetkili-ekleme" | "yetkili-degisim" | "parola" | "tehlikeli-islem" | "genel";
  talepType?: "sgk-giris" | "sgk-cikis";
  title: string;
  message: string;
  time: string;
  read: boolean;
  href?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  totalUnread: number;
  pendingCounts: Record<string, number>;
  addNotification: (n: Omit<Notification, "id" | "read" | "time">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setPendingCount: (type: string, count: number) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  totalUnread: 0,
  pendingCounts: {},
  addNotification: () => {},
  markRead: () => {},
  markAllRead: () => {},
  setPendingCount: () => {},
});

let _idCounter = 1;

function mapDbNotification(n: {
  id: string;
  title: string;
  body?: string | null;
  isRead: boolean;
  createdAt: string | Date;
}): Notification {
  const d = new Date(n.createdAt);
  const time = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  
  let type: Notification["type"] = "genel";
  const titleLower = n.title.toLowerCase();

  // Önce daha spesifik kontroller yap
  if ((titleLower.includes("onaylanmış") || titleLower.includes("onaylandi") || titleLower.includes("onayladı")) && !titleLower.includes("yeni")) {
    type = "onay";
  } else if ((titleLower.includes("reddedildi") || titleLower.includes("reddedilmiş")) && !titleLower.includes("yeni")) {
    type = "red";
  } else if (titleLower.includes("yeni sgk giriş") || (titleLower.includes("giriş") && titleLower.includes("talebi"))) {
    type = "sgk-giris";
  } else if (titleLower.includes("yeni sgk çıkış") || (titleLower.includes("çıkış") && titleLower.includes("talebi"))) {
    type = "sgk-cikis";
  } else if (titleLower.includes("giriş") || titleLower.includes("giris")) {
    type = "sgk-giris";
  } else if (titleLower.includes("çıkış") || titleLower.includes("cikis")) {
    type = "sgk-cikis";
  } else if (titleLower.includes("kaza")) {
    type = "is-kazasi";
  } else if (titleLower.includes("sicil")) {
    type = "sicil";
  } else if (titleLower.includes("abonelik")) {
    type = "abonelik";
  } else if (titleLower.includes("ödeme") || titleLower.includes("odeme")) {
    type = "odeme";
  } else if (titleLower.includes("şube açıldı") || titleLower.includes("sube acildi") || titleLower.includes("yeni şube")) {
    type = "sube-acilis";
  } else if (titleLower.includes("şube kapatıldı") || titleLower.includes("sube kapatildi")) {
    type = "sube-kapanis";
  } else if (titleLower.includes("yeni yetkili")) {
    type = "yetkili-ekleme";
  } else if (titleLower.includes("yetkili değiştirildi") || titleLower.includes("yetkili degistirildi")) {
    type = "yetkili-degisim";
  } else if (titleLower.includes("parola") || titleLower.includes("şifre") || titleLower.includes("sifre")) {
    type = "parola";
  } else if (titleLower.includes("tehlikeli") || titleLower.includes("silme") || titleLower.includes("iptal")) {
    type = "tehlikeli-islem";
  }

  return {
    id: n.id,
    type,
    title: n.title,
    message: n.body ?? "",
    time,
    read: n.isRead,
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Bildirimlerden türetilmiş okunmamış rozet sayıları
  const pendingCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "sgk-giris": 0,
      "sgk-cikis": 0,
      "is-kazasi": 0,
      "sicil": 0,
      "onay": 0,
      "red": 0,
      "abonelik": 0,
      "odeme": 0,
    };
    notifications.filter((n) => !n.read).forEach((n) => {
      if (counts[n.type] !== undefined) {
        counts[n.type]++;
      } else {
        counts[n.type] = 1;
      }
    });
    return counts;
  }, [notifications]);

  // Uygulama açılışında ve periyodik olarak bildirimler DB'den çekilir (Polling)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const fetchNotifications = async () => {
      if (!isMounted) return;
      try {
        const res = await fetch("/api/v1/notifications", { credentials: "include" });
        if (!res.ok) return;
        const json = await res.json() as { success: boolean; data?: unknown[] };
        if (json.success && Array.isArray(json.data) && isMounted) {
          setNotifications((json.data as any[]).map(mapDbNotification));
        }
      } catch {
        // Hata durumunda sessizce geç
      } finally {
        if (isMounted) {
          timeoutId = setTimeout(fetchNotifications, 5000); // Her 5 saniyede bir güncelle
        }
      }
    };

    void fetchNotifications();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const totalUnread = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((n: Omit<Notification, "id" | "read" | "time">) => {
    const id = `notif-${Date.now()}-${_idCounter++}`;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setNotifications((prev) => [{ ...n, id, read: false, time }, ...prev]);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    // DB'yi güncelle (fire-and-forget)
    void fetch(`/api/v1/notifications/${id}`, { method: "PATCH", credentials: "include" }).catch(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // DB'yi güncelle (fire-and-forget)
    void fetch("/api/v1/notifications/read-all", { method: "PATCH", credentials: "include" }).catch(() => {});
  }, []);

  const setPendingCount = useCallback((type: string, count: number) => {
    if (count === 0) {
      setNotifications((prev) => {
        const hasUnread = prev.some(n => n.type === type && !n.read);
        if (!hasUnread) return prev;
        
        // DB'ye arkadan haber ver
        const unreadIds = prev.filter(n => n.type === type && !n.read).map(n => n.id);
        unreadIds.forEach(id => {
          fetch(`/api/v1/notifications/${id}`, { method: "PATCH", credentials: "include" }).catch(() => {});
        });
        
        return prev.map((n) => n.type === type ? { ...n, read: true } : n);
      });
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications, totalUnread, pendingCounts,
      addNotification, markRead, markAllRead, setPendingCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}