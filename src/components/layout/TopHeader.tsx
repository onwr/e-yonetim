"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Menu, Bell, Mail, ChevronDown, User, UserPlus, UserMinus, Activity, FileText, X, CheckCheck, LogOut, Lock, Building2, CreditCard, UserCog, Key, ShieldAlert } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface TopHeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function TopHeader({ isSidebarOpen, toggleSidebar }: TopHeaderProps) {
  const { notifications, totalUnread, markAllRead, markRead } = useNotifications();
  const { isSetupComplete, anaKullaniciData, firmaData } = useOnboarding();
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showNotifPanel || showUserMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifPanel, showUserMenu]);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "sgk-giris": return <UserPlus className="w-4 h-4 text-[#0052cc]" />;
      case "sgk-cikis": return <UserMinus className="w-4 h-4 text-purple-500" />;
      case "onay": return <CheckCheck className="w-4 h-4 text-green-500" />;
      case "red": return <X className="w-4 h-4 text-red-500" />;
      case "is-kazasi": return <Activity className="w-4 h-4 text-red-500" />;
      case "sicil": return <FileText className="w-4 h-4 text-orange-500" />;
      case "abonelik": return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "odeme": return <CreditCard className="w-4 h-4 text-red-500" />;
      case "sube-acilis": return <Building2 className="w-4 h-4 text-emerald-500" />;
      case "sube-kapanis": return <Building2 className="w-4 h-4 text-orange-500" />;
      case "yetkili-ekleme": return <UserPlus className="w-4 h-4 text-indigo-500" />;
      case "yetkili-degisim": return <UserCog className="w-4 h-4 text-[#ef5a28]" />;
      case "parola": return <Key className="w-4 h-4 text-[#172b4d]" />;
      case "tehlikeli-islem": return <ShieldAlert className="w-4 h-4 text-red-600" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleNotifClick = (notif: any) => {
    markRead(notif.id);
    if (notif.href) {
      setShowNotifPanel(false);
      router.push(notif.href);
    }
  };

  return (
    <header className="h-[88px] bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-10 sticky top-0">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="w-[34px] h-[34px] rounded-full border border-[#0052cc]/30 flex items-center justify-center bg-[#f4f5f7] text-[#0052cc] hover:bg-[#0052cc] hover:text-white transition-all shadow-sm group"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-[18px] w-[18px] stroke-[2.5] hidden lg:block" />
          ) : (
            <ChevronRight className="h-[18px] w-[18px] stroke-[2.5] hidden lg:block" />
          )}
          <Menu className="h-[18px] w-[18px] stroke-[2.5] block lg:hidden" />
        </button>
        <Link href="/panel" className="lg:hidden ml-4 flex items-center">
          <Image src="/analogo.svg" alt="e-Yönetim" width={110} height={36} className="h-8 w-auto aspect-auto" priority />
        </Link>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-5">
          {/* Notification Bell */}
          <div className="relative flex items-center justify-center" ref={panelRef}>
            <button 
              onClick={() => setShowNotifPanel(p => !p)}
              className="relative text-[#6b778c] hover:text-[#172b4d] transition-colors group p-1"
            >
              <Bell className={`w-[22px] h-[22px] stroke-[2] transition-transform group-hover:scale-110 ${showNotifPanel ? "text-[#0052cc]" : ""}`} />
              {totalUnread > 0 && isSetupComplete && (
                <span className="absolute top-0 right-0 translate-x-[20%] -translate-y-[20%] min-w-[16px] h-[16px] bg-red-500 border-2 border-white rounded-full text-[9px] font-black text-white flex items-center justify-center px-1">
                  {totalUnread}
                </span>
              )}
            </button>

            {showNotifPanel && (
              <div className="absolute right-[-60px] sm:right-0 top-[calc(100%+16px)] w-[320px] sm:w-[380px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-200 z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Bell className="w-[16px] h-[16px] text-[#0052cc] stroke-[2.5]" />
                    </div>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">Bildirimler</span>
                    {totalUnread > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-[11px] font-extrabold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center">
                        {totalUnread}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {totalUnread > 0 && (
                      <button onClick={markAllRead} className="text-[12px] font-bold text-[#0052cc] hover:underline">
                        Tümünü Okundu İşaretle
                      </button>
                    )}
                    <button onClick={() => setShowNotifPanel(false)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors ml-2">
                      <X className="w-3.5 h-3.5 text-gray-600 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-[360px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Bell className="w-10 h-10 text-gray-200 stroke-[1.5] mb-3" />
                      <p className="text-[13px] font-bold text-gray-400">Yeni bildiriminiz yok</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={`flex items-start gap-3.5 px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer ${notif.read ? "opacity-60" : ""}`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${notif.read ? "bg-gray-50 border-gray-100" : "bg-[#f4f5f8] border-gray-100"}`}>
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className={`text-[13px] font-extrabold text-[#172b4d] leading-snug ${notif.read ? "font-semibold" : ""}`}>{notif.title}</span>
                          <span className="text-[12px] font-medium text-gray-500 mt-0.5 leading-relaxed">{notif.message}</span>
                          <span className="text-[11px] font-bold text-[#0052cc] mt-1">{notif.time}</span>
                        </div>
                        {!notif.read && <span className="w-2 h-2 bg-red-500 rounded-full mt-1 shrink-0" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="text-[#6b778c] hover:text-[#172b4d] transition-colors p-1">
            <Mail className="w-[22px] h-[22px] stroke-[2]" />
          </button>
        </div>
        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
        <div className="relative flex items-center" ref={userMenuRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setShowUserMenu(p => !p)}
          >
            <div className="w-[42px] h-[42px] rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-[#f4f5f7] relative shrink-0">
              <span className="font-extrabold text-[#0052cc] text-[15px]">{anaKullaniciData?.formData?.adSoyad ? anaKullaniciData.formData.adSoyad.charAt(0).toUpperCase() : "E"}</span>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="hidden sm:flex flex-col items-start justify-center">
              <div className="flex items-center gap-1.5 mb-[1px]">
                <span className="text-[12.5px] font-extrabold text-[#172b4d] block leading-none">{anaKullaniciData?.formData?.adSoyad?.toUpperCase() || "-"}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold leading-none mt-0.5">
                <span className="text-[10px] text-[#ef5a28]">{anaKullaniciData?.formData?.unvan?.toUpperCase() || "-"}</span>
                <span className="w-[3px] h-[3px] bg-gray-300 rounded-full"></span>
                <span className="text-[10px] text-gray-400">{firmaData?.formData?.firmaUnvani?.toUpperCase() || ""}</span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 stroke-[2.5] hidden sm:block group-hover:text-[#172b4d] transition-transform duration-300 ml-1 ${showUserMenu ? 'rotate-180 text-[#ef5a28]' : ''}`} />
          </div>

          {showUserMenu && (
            <div className="absolute right-0 top-[calc(100%+12px)] w-[260px] sm:w-[280px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-100 z-50 overflow-hidden animate-fade-in origin-top-right scale-95 opacity-0" style={{ animation: "popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes popIn {
                  0% { opacity: 0; transform: scale(0.95); }
                  100% { opacity: 1; transform: scale(1); }
                }
              `}} />
              <div className="p-5 border-b border-gray-100">
                <div className="text-[14px] font-extrabold text-[#172b4d] truncate">
                  {anaKullaniciData?.formData?.email || "kargalioglueren@gmail.com"}
                </div>
                <div className="text-[12px] font-semibold text-gray-400 mt-1">
                  Sistem Rolü: <span className="text-[#172b4d] font-bold">{anaKullaniciData?.formData?.unvan || "Sistem Yöneticisi"}</span>
                </div>
              </div>
              <div className="p-2 flex flex-col gap-1">
                <button 
                  onClick={() => { setShowUserMenu(false); router.push('/panel/profil-guvenlik'); }}
                  className="flex items-center gap-3 px-4 py-3 text-[14px] font-semibold text-[#253858] hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <User className="w-[18px] h-[18px] stroke-[2]" />
                  Profil & Güvenlik
                </button>
                <button 
                  onClick={() => { 
                    setShowUserMenu(false);
                    void fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" }).finally(() => {
                      router.push("/giris");
                    });
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-[14px] font-semibold text-[#e11d48] hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-[18px] h-[18px] stroke-[2]" />
                  Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}