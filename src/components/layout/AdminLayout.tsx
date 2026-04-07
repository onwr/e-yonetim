"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import { NotificationProvider } from "@/context/NotificationContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
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
      <div className="flex h-screen bg-[#f4f5f7] font-sans text-[#172b4d] overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <TopHeader
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 scroll-smooth">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}