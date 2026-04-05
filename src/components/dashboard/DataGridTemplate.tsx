"use client";
import { ReactNode } from "react";
import { Download, Filter, Search, ChevronDown, ChevronLeft, ChevronRight, FolderOpen, LucideIcon } from "lucide-react";
export interface TopCardProps {
  id: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  isActive?: boolean;
}
export interface TabProps {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
}
export interface DataGridTemplateProps {
  title: string;
  badge?: string;
  icon: LucideIcon;
  description: string;
  topCards: TopCardProps[];
  tabs: TabProps[];
  activeTabId: string;
  onTabChange?: (id: string) => void;
  tableHeader?: ReactNode;
  tableBody?: ReactNode;
  onCardClick?: (id: string) => void;
  onExport?: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  totalRecords?: number;
}
export default function DataGridTemplate({
  title,
  badge,
  icon: TitleIcon,
  description,
  topCards,
  tabs,
  activeTabId,
  onTabChange,
  tableHeader,
  tableBody,
  onCardClick,
  onExport,
  searchValue,
  onSearchChange,
  totalRecords
}: DataGridTemplateProps) {
  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in pb-12">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-stagger-1 { animation: fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0ms forwards; opacity: 0; }
        .animate-stagger-2 { animation: fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 75ms forwards; opacity: 0; }
        .animate-stagger-3 { animation: fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 150ms forwards; opacity: 0; }
        .animate-stagger-4 { animation: fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 225ms forwards; opacity: 0; }
        .animate-stagger-5 { animation: fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 300ms forwards; opacity: 0; }
      `}} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {topCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.id} 
              onClick={() => onCardClick?.(card.id)}
              className={`rounded-[1.25rem] p-5 relative overflow-hidden group transition-all duration-300 animate-stagger-${Math.min(idx + 1, 5)} ${
                card.isActive 
                  ? "bg-[#0a1a3a] text-white shadow-xl shadow-blue-900/20 scale-[1.02]" 
                  : "bg-white text-[#172b4d] border border-gray-200/80 shadow-sm hover:border-[#0052cc]/30 hover:shadow-md cursor-pointer hover:-translate-y-1"
              }`}
            >
              <div className="flex justify-between items-start mb-6 z-10 relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  card.isActive ? "bg-white/10 border border-white/10 group-hover:bg-white/20" : "bg-[#f4f5f8] border border-gray-100 group-hover:bg-blue-50"
                }`}>
                  <Icon className={`w-6 h-6 transition-colors ${card.isActive ? "text-white" : "text-[#6b778c] group-hover:text-[#0052cc]"}`} />
                </div>
                {card.isActive ? (
                  <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-[11.5px] font-bold tracking-wider">Aktif Görünüm</span>
                  </div>
                ) : (
                  <span className="text-[11.5px] font-extrabold tracking-wider text-[#ef5a28] bg-[#ef5a28]/10 px-3 py-1.5 rounded-full">Talep Sayısı</span>
                )}
              </div>
              <div className="text-[44px] font-black leading-none mb-1 z-10 relative">{card.value}</div>
              <p className={`text-[11px] font-extrabold tracking-widest uppercase mt-1 z-10 relative ${
                card.isActive ? "text-[#8c9bab]" : "text-[#6b778c]"
              }`}>
                {card.title}
              </p>
              {card.isActive && (
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              )}
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-[1.5rem] border border-gray-200/80 shadow-sm w-full p-6 lg:p-10 flex flex-col gap-8 animate-stagger-5">
        <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-6">
          <div className="flex gap-5">
            <div className="w-[68px] h-[68px] rounded-2xl bg-[#0a1a3a] flex items-center justify-center shrink-0 shadow-lg shadow-blue-950/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 group-hover:opacity-100 transition-opacity"></div>
              <TitleIcon className="w-8 h-8 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[24px] font-extrabold text-[#172b4d] tracking-tight leading-none">{title}</h1>
                {badge && (
                  <span className="text-[10px] font-extrabold text-[#0052cc] bg-[#0052cc]/10 px-3 py-1.5 rounded-lg tracking-wider pt-2">{badge}</span>
                )}
              </div>
              <p className="text-[13px] text-[#6b778c] font-medium leading-relaxed max-w-3xl pr-4">
                {description}
              </p>
            </div>
          </div>
          <button onClick={onExport} className="flex items-center justify-center gap-2.5 bg-green-50/50 hover:bg-green-50 border border-green-500/30 hover:border-green-500/60 text-[#00875a] font-bold text-[13px] px-5 py-3 rounded-xl transition-all shadow-sm shrink-0 active:scale-95 group">
            <Download className="w-4 h-4 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
            Excel Raporu
          </button>
        </div>
        <div className="flex items-center gap-2 border-b border-gray-100 pb-0 overflow-x-auto custom-scrollbar mt-2">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isTabActive = activeTabId === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => onTabChange && onTabChange(tab.id)}
                className={`flex items-center gap-2.5 px-5 py-3.5 transition-all shrink-0 relative overflow-hidden group ${
                  isTabActive 
                    ? "bg-[#172b4d] text-white rounded-t-[1.1rem] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]" 
                    : "bg-transparent text-[#6b778c] hover:bg-gray-50 hover:text-[#172b4d] rounded-t-xl"
                }`}
              >
                {isTabActive && <div className="absolute top-0 inset-x-0 h-[2px] bg-blue-400"></div>}
                <TabIcon className={`w-[18px] h-[18px] stroke-[2.5] transition-transform group-hover:scale-110 ${!isTabActive && "text-gray-400"}`} />
                <span className="text-[13px] font-extrabold tracking-wide">{tab.label}</span>
                <span className={`ml-1 text-[11px] font-extrabold px-2 py-0.5 rounded-md min-w-[24px] text-center border ${
                  isTabActive ? "bg-white/20 text-white border-white/10" : "bg-gray-100 text-[#172b4d] border-gray-200"
                }`}>{tab.count}</span>
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-50/30 border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col gap-2.5">
            <label className="text-[11px] font-extrabold text-gray-400 tracking-wider">LOKASYON / ŞUBE FİLTRESİ</label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <select className="w-full pl-5 pr-10 py-[15px] bg-white border border-gray-200 rounded-xl text-[14px] font-bold text-[#172b4d] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all hover:border-gray-300 shadow-sm">
                  <option>Tüm Lokasyonlar</option>
                  <option>Merkez Kampüs</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-500 stroke-[2.5]" />
                </div>
              </div>
              <button className="bg-[#172b4d] hover:bg-[#0a1b3a] text-white px-7 py-[15px] rounded-xl transition-colors flex items-center gap-2.5 font-extrabold text-[13px] tracking-wide shrink-0 shadow-md shadow-[#172b4d]/20 active:scale-95 group">
                <Filter className="w-4 h-4 stroke-[2.5] group-hover:rotate-12 transition-transform" /> UYGULA
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="text-[11px] font-extrabold text-gray-400 tracking-wider">HIZLI ARAMA</label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-[18px] h-[18px] text-gray-400" />
                </div>
                <input 
                  type="text" 
                  value={searchValue || ""}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder="İsim, TCKN veya Referans No ile hızlıca arayın..." 
                  className="w-full pl-[42px] pr-4 py-[15px] bg-white border border-gray-200 rounded-xl text-[14px] font-semibold text-[#172b4d] placeholder-[#8c9bab] tracking-wide focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all hover:border-gray-300 shadow-sm"
                />
              </div>
              <button onClick={() => onSearchChange?.("")} className="bg-[#172b4d] hover:bg-[#0a1b3a] text-white px-7 py-[15px] rounded-xl transition-colors font-extrabold text-[13px] tracking-wide shrink-0 shadow-md shadow-[#172b4d]/20 active:scale-95">
                TEMİZLE
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50/80 p-3 rounded-xl border border-gray-100 gap-4 mt-2">
          <div className="flex items-center gap-3 px-2">
            <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-[#172b4d] tracking-wide">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
              TOPLAM <span className="text-[#ef5a28] text-[16px] font-black mx-0.5">{totalRecords !== undefined ? totalRecords : 0}</span> KAYIT
            </div>
            <div className="w-px h-6 bg-gray-200 hidden sm:block mx-2"></div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 tracking-wider">GÖSTERİM:</span>
              <div className="relative">
                <select className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-[#172b4d] outline-none appearance-none cursor-pointer hover:border-gray-300 transition-colors focus:ring-2 focus:ring-blue-500/20">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-[#172b4d] stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 opacity-50 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 opacity-50 cursor-not-allowed hidden sm:flex">
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>
            <input type="text" defaultValue="1" className="w-12 h-8 text-center rounded-lg border border-gray-200 text-[13.5px] font-extrabold text-[#172b4d] outline-none focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/20 transition-all" />
            <button className="h-8 px-4 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-[12px] font-extrabold text-[#172b4d] transition-colors active:scale-95">
              GİT
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {tableHeader || (
            <div className="bg-[#0a1a3a] rounded-xl p-4 flex items-center text-white text-[11.5px] font-extrabold tracking-wider uppercase shadow-md shadow-blue-900/10">
              <div className="w-16 shrink-0 pl-4">SIRA</div>
              <div className="flex-1">TEMEL VERİLER</div>
              <div className="flex-1">KURUM VE DETAYLAR</div>
              <div className="w-52 shrink-0 text-right pr-6">İŞLEM VE KONTROL</div>
            </div>
          )}
          {tableBody || (
            <div className="w-full flex justify-center py-10 pb-16">
              <div className="border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-[2rem] w-full p-20 flex flex-col items-center justify-center text-center transition-colors hover:border-gray-300 hover:bg-gray-50 group cursor-pointer">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                  <FolderOpen className="w-[34px] h-[34px] text-gray-300 stroke-[2] group-hover:text-blue-400 transition-colors" />
                </div>
                <h3 className="text-[15.5px] font-extrabold text-[#6b778c] tracking-widest mb-2.5">AKTİF KAYIT BULUNAMADI</h3>
                <p className="text-[13.5px] text-gray-500 font-medium max-w-md mx-auto">Bu tablo görünümünde henüz listelenecek bir veri yok veya uyguladığınız filtrelere uygun sonuç bulunamadı.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}