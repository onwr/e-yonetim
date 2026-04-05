"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import { NotificationProvider } from "@/context/NotificationContext";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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