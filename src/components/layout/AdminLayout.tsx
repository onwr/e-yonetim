"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import { NotificationProvider } from "@/context/NotificationContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Mobilde varsayılan kapalı ekran genişliği açıldığında otomatik ayarla.
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
    // Oturum kontrolü: /api/v1/me veya herhangi bir protected endpoint'e ping at
    const checkSession = async () => {
      try {
        const res = await fetch("/api/v1/me", { credentials: "include" });
        if (res.status === 401 || res.status === 403) {
          router.replace("/");
        }
      } catch {
        // Network hatası — sessizce geç
      }
    };

    void checkSession();

    // Her 5 dakikada bir oturumu kontrol et
    const interval = setInterval(() => void checkSession(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-[#f4f5f7] font-sans text-[#172b4d] overflow-hidden relative">
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-sm z-40 lg:hidden block transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10 w-full lg:w-auto">
          <TopHeader
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 scroll-smooth w-full relative">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}