"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  CalendarDays,
  Users,
  ArrowUpCircle,
  ArrowDownCircle,
  UserCheck,
  Building2,
  Store,
  Briefcase,
  Layers,
  LogOut,
  ChevronDown,
  Lock,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { fetchJsonWithError } from "@/lib/fetchJsonWithError";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

type SubmenuItem = {
  name: string;
  href: string;
};

type MenuItem = {
  name: string;
  icon: any;
  href?: string;
  submenu?: SubmenuItem[];
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { pendingCounts, setPendingCount } = useNotifications();
  const { setupStep, anaKullaniciData } = useOnboarding();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [kisitliBeklemedeCount, setKisitliBeklemedeCount] = useState(0);
  const [userToggledMenu, setUserToggledMenu] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const rows = await fetchJsonWithError<unknown[]>(`/api/v1/personel/kisitli`);
        const list = Array.isArray(rows) ? rows : [];
        const pending = list.filter(
          (r) => String((r as any)?.durum ?? "").toLowerCase() === "beklemede"
        ).length;
        setKisitliBeklemedeCount(pending);
      } catch {
        setKisitliBeklemedeCount(0);
      }
    })();
  }, []);

  const badgeMap: Record<string, number> = {
    "Gelen Talepler": (pendingCounts["sgk-giris"] || 0) + (pendingCounts["sgk-cikis"] || 0) + kisitliBeklemedeCount,
    "SGK Giriş Talepleri": pendingCounts["sgk-giris"] || 0,
    "SGK Çıkış Talepleri": pendingCounts["sgk-cikis"] || 0,
    "Kısıtlı Personel Talepleri": kisitliBeklemedeCount,
    "SGK Giriş Talebi": (pendingCounts["onay"] || 0) + (pendingCounts["red"] || 0),
    "SGK Çıkış Talebi": (pendingCounts["onay"] || 0) + (pendingCounts["red"] || 0),
    "İş Kazası": pendingCounts["is-kazasi"] || 0,
  };

  const LOCKED_ITEMS: string[] = [];
  if (setupStep === 0) {
    LOCKED_ITEMS.push(
      "Gelen Talepler",
      "Günlük Puantaj Girişi",
      "Personel Yönetimi",
      "SGK Giriş Talebi",
      "SGK Çıkış Talebi",
      "İşveren Yetkilileri",
      "Şube İşlemleri",
      "Departman İşlemleri",
      "Birim İşlemleri"
    );
  } else if (setupStep === 1) {
    LOCKED_ITEMS.push(
      "Gelen Talepler",
      "Günlük Puantaj Girişi",
      "Personel Yönetimi",
      "SGK Giriş Talebi",
      "SGK Çıkış Talebi",
      "Şube İşlemleri",
      "Departman İşlemleri",
      "Birim İşlemleri"
    );
  }

  const LOCKED_SUBITEMS: string[] = [];
  if (setupStep === 0) {
    LOCKED_SUBITEMS.push(
      "Ana Kullanıcı Bilgileri",
      "Yetkili Listesi",
      "Yeni Yetkili Ekle",
      "Şube Bilgileri",
      "Yeni Şube Ekle",
      "Şube İstatistikleri",
      "Departman Listesi",
      "Yeni Departman Ekle",
      "Birim Listesi",
      "Yeni Birim Ekle",
      "SGK Giriş Talepleri",
      "SGK Çıkış Talepleri",
      "Personel Listesi",
      "Kısıtlı Personeller",
      "Kısıtlı Personel Talepleri",
      "Yeni Talep Oluştur",
      "Taleplerim",
      "Giriş Talep Ayarları",
      "Çıkış Talep Ayarları"
    );
  } else if (setupStep === 1) {
    LOCKED_SUBITEMS.push(
      "Yetkili Listesi",
      "Yeni Yetkili Ekle",
      "Şube Bilgileri",
      "Yeni Şube Ekle",
      "Şube İstatistikleri",
      "Departman Listesi",
      "Yeni Departman Ekle",
      "Birim Listesi",
      "Yeni Birim Ekle",
      "SGK Giriş Talepleri",
      "SGK Çıkış Talepleri",
      "Personel Listesi",
      "Kısıtlı Personeller",
      "Kısıtlı Personel Talepleri",
      "Yeni Talep Oluştur",
      "Taleplerim",
      "Giriş Talep Ayarları",
      "Çıkış Talep Ayarları"
    );
  }

  const menuGroups: MenuGroup[] = [
    {
      title: "OPERASYON MERKEZİ",
      items: [
        { name: "Kontrol Paneli", icon: LayoutDashboard, href: "/panel" },
        {
          name: "Gelen Talepler",
          icon: Inbox,
          submenu: [
            { name: "SGK Giriş Talepleri", href: "/panel/gelen-talepler/sgk-giris" },
            { name: "SGK Çıkış Talepleri", href: "/panel/gelen-talepler/sgk-cikis" },
            { name: "Kısıtlı Personel Talepleri", href: "/panel/personel/kisitli" },
          ],
        },
      ],
    },
    {
      title: "E-YÖNETİM",
      items: [{ name: "Günlük Puantaj Girişi", icon: CalendarDays, href: "/panel/puantaj" }],
    },
    {
      title: "E-İK",
      items: [
        {
          name: "Personel Yönetimi",
          icon: Users,
          submenu: [
            { name: "Personel Listesi", href: "/panel/personel/liste" },
            { name: "Kısıtlı Personeller", href: "/panel/personel/kisitli" },
          ],
        },
        {
          name: "SGK Giriş Talebi",
          icon: ArrowUpCircle,
          submenu: [
            { name: "Yeni Talep Oluştur", href: "/panel/sgk-giris/yeni" },
            { name: "Taleplerim", href: "/panel/sgk-giris/liste" },
            { name: "Giriş Talep Ayarları", href: "/panel/sgk-giris/ayarlar" },
          ],
        },
        {
          name: "SGK Çıkış Talebi",
          icon: ArrowDownCircle,
          submenu: [
            { name: "Yeni Talep Oluştur", href: "/panel/sgk-cikis/yeni" },
            { name: "Taleplerim", href: "/panel/sgk-cikis/liste" },
            { name: "Çıkış Talep Ayarları", href: "/panel/sgk-cikis/ayarlar" },
          ],
        },
      ],
    },
    {
      title: "E-KURUM",
      items: [
        {
          name: "İşveren Yetkilileri",
          icon: UserCheck,
          submenu: [
            { name: "Ana Kullanıcı Bilgileri", href: "/panel/isveren-yetkilileri/ana-kullanici-bilgileri" },
            { name: "Yetkili Listesi", href: "/panel/yetkililer/liste" },
            { name: "Yeni Yetkili Ekle", href: "/panel/yetkililer/yeni" },
          ],
        },
        {
          name: "Firma İşlemleri",
          icon: Building2,
          submenu: [{ name: "Firma Bilgileri", href: "/panel/firma/bilgiler" }],
        },
        {
          name: "Şube İşlemleri",
          icon: Store,
          submenu: [
            { name: "Şube Bilgileri", href: "/panel/sube/bilgiler" },
            { name: "Yeni Şube Ekle", href: "/panel/sube/yeni" },
            { name: "Şube İstatistikleri", href: "/panel/sube/istatistik" },
          ],
        },
        {
          name: "Departman İşlemleri",
          icon: Briefcase,
          submenu: [
            { name: "Departman Listesi", href: "/panel/departman/liste" },
            { name: "Yeni Departman Ekle", href: "/panel/departman/yeni" },
          ],
        },
        {
          name: "Birim İşlemleri",
          icon: Layers,
          submenu: [
            { name: "Birim Listesi", href: "/panel/birim/liste" },
            { name: "Yeni Birim Ekle", href: "/panel/birim/yeni" },
          ],
        },
      ],
    },
  ];

  const activeParentMenu = useMemo(() => {
    for (const group of menuGroups) {
      for (const item of group.items) {
        if (item.href && pathname === item.href) return item.name;
        if (item.submenu?.some((sub) => pathname === sub.href || pathname.startsWith(sub.href + "/"))) {
          return item.name;
        }
      }
    }
    return null;
  }, [pathname]);

  useEffect(() => {
    if (!userToggledMenu) {
      setOpenMenu(activeParentMenu);
    }
  }, [activeParentMenu, userToggledMenu]);

  useEffect(() => {
    if (!isOpen) {
      setOpenMenu(null);
      setUserToggledMenu(false);
    }
  }, [isOpen]);

  const isActive = (href?: string, submenu?: { href: string }[]) => {
    if (href && pathname === href) return true;
    if (submenu && submenu.some((sub) => pathname === sub.href || pathname.startsWith(sub.href + "/"))) return true;
    return false;
  };

  const handleMenuToggle = (menuName: string) => {
    setUserToggledMenu(true);
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  };

  const handleItemClick = (item: MenuItem, isLocked: boolean) => {
    if (isLocked) return;
    if (item.submenu) {
      handleMenuToggle(item.name);
      return;
    }
    if (item.href) {
      router.push(item.href);
      if (window.innerWidth < 1024 && onClose) onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      router.push("/giris");
    }
  };

  return (
    <aside
      className={`fixed lg:relative h-screen bg-white border-r border-[#E9EDF5] flex flex-col transition-all duration-300 z-50 shrink-0 left-0 top-0 ${
        isOpen 
          ? "w-[280px] sm:w-[300px] translate-x-0" 
          : "w-[280px] sm:w-[300px] lg:w-[88px] -translate-x-full lg:translate-x-0 lg:items-center"
      }`}
    >
      <div className={`h-[88px] flex items-center border-b border-[#F1F4F9] shrink-0 ${isOpen ? "px-6" : "justify-center w-full"}`}>
        {isOpen ? (
          <div className="flex items-center justify-between w-full">
            <Link href="/panel" className="flex items-center">
              <Image src="/analogo.svg" alt="e-Yönetim" width={150} height={50} className="h-11 w-auto" priority />
            </Link>

            <div className="w-10 h-10 rounded-2xl bg-[#F6F8FB] border border-[#EEF2F7] flex items-center justify-center">
              <UserCheck className="w-[18px] h-[18px] text-[#172B4D] stroke-[2.2]" />
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-2xl bg-[#ef5a28] flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            e
          </div>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto overflow-x-hidden py-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className={`mb-5 ${!isOpen ? "flex flex-col items-center" : ""}`}>
            {isOpen && (
              <h4 className="px-7 text-[10px] font-extrabold text-[#97A0AF] mb-2 tracking-[0.16em] uppercase select-none">
                {group.title}
              </h4>
            )}

            <ul className={`space-y-1 ${isOpen ? "px-4" : "px-0 w-full flex flex-col items-center"}`}>
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const itemActive = isActive(item.href, item.submenu);
                const menuOpen = openMenu === item.name;
                const badge = badgeMap[item.name] || 0;
                const isLocked = LOCKED_ITEMS.includes(item.name);

                return (
                  <li key={itemIdx} className={!isOpen ? "w-full flex justify-center" : ""}>
                    <button
                      onClick={() => handleItemClick(item, isLocked)}
                      className={`group flex items-center justify-between w-full transition-all duration-200 ${
                        isOpen ? "px-3 py-2.5 rounded-2xl" : "p-3 rounded-2xl w-[56px] justify-center"
                      } ${
                        isLocked
                          ? "text-[#A7B0BF] cursor-not-allowed bg-transparent"
                          : itemActive
                          ? "bg-[#F4F7FB] text-[#0052CC] shadow-[inset_0_0_0_1px_rgba(0,82,204,0.04)]"
                          : "text-[#253858] hover:bg-[#F8FAFD] hover:text-[#0052CC]"
                      }`}
                      title={isLocked ? "Firma kurulumunu tamamlayın" : !isOpen ? item.name : undefined}
                    >
                      <div className={`flex items-center ${isOpen ? "gap-3.5" : "justify-center"}`}>
                        <div
                          className={`relative w-[38px] h-[38px] rounded-[14px] flex items-center justify-center transition-all duration-200 ${
                            itemActive && !isLocked
                              ? "bg-white border border-[#EAF0FB] shadow-sm"
                              : "bg-transparent border border-transparent"
                          }`}
                        >
                          <Icon
                            className={`${isOpen ? "w-[18px] h-[18px]" : "w-[20px] h-[20px]"} ${
                              itemActive && !isLocked ? "stroke-[2.4]" : "stroke-[2]"
                            }`}
                          />

                          {!isOpen && badge > 0 && !isLocked && (
                            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 border-2 border-white rounded-full text-[8px] font-black text-white flex items-center justify-center px-[2px]">
                              {badge}
                            </span>
                          )}
                        </div>

                        {isOpen && (
                          <span className={`text-[13.5px] whitespace-nowrap ${itemActive && !isLocked ? "font-extrabold" : "font-semibold"}`}>
                            {item.name}
                          </span>
                        )}
                      </div>

                      {isOpen && (
                        <div className="flex items-center gap-2">
                          {isLocked ? (
                            <Lock className="w-3.5 h-3.5 text-[#C5CCD8]" />
                          ) : (
                            <>
                              {badge > 0 && (
                                <span className="min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1.5 shadow-sm">
                                  {badge}
                                </span>
                              )}
                              {item.submenu && (
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform duration-300 ${
                                    menuOpen ? "rotate-180 text-[#0052CC]" : "rotate-0 text-[#98A1B2]"
                                  }`}
                                />
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </button>

                    {isOpen && item.submenu && !isLocked && (
                      <div
                        className={`grid transition-all duration-300 ease-out ${
                          menuOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <ul className="ml-[26px] border-l border-[#E4EAF3] pl-5 py-2 space-y-2">
                            {item.submenu.map((sub, sIdx) => {
                              const subActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
                              const subLocked = LOCKED_SUBITEMS.includes(sub.name);
                              const subBadge = badgeMap[sub.name] || 0;

                              return (
                                <li key={sIdx}>
                                  {subLocked ? (
                                    <span
                                      className="flex items-center gap-3 text-[12.5px] font-medium text-[#C1C8D3] cursor-not-allowed"
                                      title="Firma kurulumunu tamamlayın"
                                    >
                                      <span className="w-[5px] h-[5px] rounded-full bg-[#D8DEE8]"></span>
                                      <span className="truncate">{sub.name}</span>
                                      <Lock className="w-3 h-3 ml-auto text-[#D8DEE8]" />
                                    </span>
                                  ) : (
                                    <Link
                                      href={sub.href}
                                      onClick={() => {
                                        if (subBadge > 0) {
                                          if (sub.name === "SGK Giriş Talepleri") setPendingCount("sgk-giris", 0);
                                          else if (sub.name === "SGK Çıkış Talepleri") setPendingCount("sgk-cikis", 0);
                                          else if (sub.name === "Kısıtlı Personel Talepleri") setKisitliBeklemedeCount(0);
                                          else if (sub.name === "Taleplerim") {
                                            setPendingCount("onay", 0);
                                            setPendingCount("red", 0);
                                          }
                                        }
                                      }}
                                      className={`flex items-center gap-3 text-[12.5px] transition-colors ${
                                        subActive
                                          ? "text-[#0052CC] font-bold"
                                          : "text-[#5E6C84] hover:text-[#0052CC] font-medium"
                                      }`}
                                    >
                                      <span
                                        className={`w-[5px] h-[5px] rounded-full transition-colors ${
                                          subActive ? "bg-[#0052CC]" : "bg-[#C1C7D0]"
                                        }`}
                                      ></span>
                                      <span className="truncate">{sub.name}</span>
                                      {subBadge > 0 && (
                                        <span className="min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1.5 shadow-sm ml-auto">
                                          {subBadge}
                                        </span>
                                      )}
                                    </Link>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className={`p-4 border-t border-[#F1F4F9] shrink-0 ${!isOpen ? "flex justify-center" : ""}`}>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 border border-[#E7ECF3] rounded-2xl bg-white hover:bg-[#FAFBFD] transition-colors shadow-sm ${
            !isOpen ? "justify-center w-[56px] h-[56px] p-0" : "px-3 py-2.5 w-full"
          }`}
          title="Çıkış Yap"
        >
          <div className="w-9 h-9 rounded-full bg-[#F4F6F9] border border-[#E8EDF4] flex items-center justify-center text-[#172B4D] font-extrabold text-[15px] shrink-0">
            {anaKullaniciData?.formData?.adSoyad
              ? anaKullaniciData.formData.adSoyad.charAt(0).toUpperCase()
              : "E"}
          </div>

          {isOpen && (
            <>
              <div className="flex flex-col flex-1 min-w-0 text-left">
                <span className="text-[11.5px] font-extrabold text-[#172B4D] truncate">
                  {(anaKullaniciData?.formData?.adSoyad || "Eren Arif").toUpperCase()}
                </span>
                <span className="text-[11px] font-semibold text-[#77839A] truncate">
                  {anaKullaniciData?.formData?.unvan || "Yönetici"}
                </span>
              </div>
              <LogOut className="w-[18px] h-[18px] text-[#9AA5B5] hover:text-red-500 transition-colors shrink-0" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}