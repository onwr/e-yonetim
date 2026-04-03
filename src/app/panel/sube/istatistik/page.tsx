"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { 
  Building2, Search, ChevronDown, MapPin, Tag, User, 
  Phone, Mail, UserPlus, UserMinus, FileWarning, ClipboardList, MoreVertical, Edit, Trash2, X
} from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { mapApiPersonel, mapApiTalep } from "@/lib/MockDataContext";
import { fetchJsonWithError, getApiErrorMessage } from "@/lib/fetchJsonWithError";
import { ApiErrorBanner } from "@/components/common/ApiStatus";

function mapBranchToView(b: Record<string, unknown>, anaSubeLabel: string) {
  return {
    id: String(b.id),
    subeAdi: String(b.name ?? ""),
    anaSube: anaSubeLabel,
    subeTuru: String(b.subeTuru ?? ""),
    il: String(b.il ?? ""),
    ilce: String(b.ilce ?? ""),
    mahalle: String(b.mahalle ?? ""),
    adres: String(b.adres ?? ""),
    telefon: String(b.telefon ?? ""),
    ePosta: String(b.ePosta ?? ""),
    masrafKodu: "-",
    subeYetkilisi: "-",
    calisanSayisi: "0",
    puantajOrani: 0,
    ozlukOrani: 0,
  };
}

export default function SubeIstatistikPage() {
  const { firmaData } = useOnboarding();
  const anaSubeLabel = firmaData?.formData?.firmaUnvani ?? "Firma";
  const [personeller, setPersoneller] = useState<any[]>([]);
  const [talepler, setTalepler] = useState<any[]>([]);
  const [subeler, setSubeler] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnaSube, setFilterAnaSube] = useState("Firma veya Şube Seçin");
  const [filterDurum, setFilterDurum] = useState("Tüm Durumlar");
  const [isLoaded, setIsLoaded] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingSube, setEditingSube] = useState<any>(null);
  const [deletingSube, setDeletingSube] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setErrorMsg("");
      const [branches, rawPersonel, rawTalepler] = await Promise.all([
        fetchJsonWithError<any[]>(`/api/v1/subeler?page=1&pageSize=200`),
        fetchJsonWithError<any[]>(`/api/v1/personel?page=1&pageSize=500`),
        fetchJsonWithError<any[]>(`/api/v1/talepler?page=1&pageSize=500`),
      ]);
      const branchList = Array.isArray(branches) ? branches : [];
      setSubeler(branchList.map((b) => mapBranchToView(b as Record<string, unknown>, anaSubeLabel)));
      setPersoneller((Array.isArray(rawPersonel) ? rawPersonel : []).map(mapApiPersonel));
      setTalepler((Array.isArray(rawTalepler) ? rawTalepler : []).map(mapApiTalep));
    } catch (e) {
      setErrorMsg(getApiErrorMessage(e, "Sube verileri yuklenemedi."));
    }
  }, [anaSubeLabel]);

  useEffect(() => {
    setMounted(true);
    void loadData();
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [loadData]);

  const filteredSubeler = subeler.filter(s => {
    const matchesSearch = s.subeAdi?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.anaSube?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAnaSube = filterAnaSube === "Firma veya Şube Seçin" || s.anaSube === filterAnaSube || s.subeAdi === filterAnaSube;
    const matchesDurum = filterDurum === "Tüm Durumlar" || filterDurum === "Aktif"; 
    
    return matchesSearch && matchesAnaSube && matchesDurum;
  });

  const uniqueFirmaOrSube = Array.from(new Set(subeler.flatMap(s => [s.anaSube, s.subeAdi]))).filter(Boolean);

  const handleDeleteConfirm = () => {
    if (!deletingSube) return;
    const id = deletingSube.id;
    void (async () => {
      try {
        await fetchJsonWithError(`/api/v1/subeler/${id}`, { method: "DELETE" });
        setDeletingSube(null);
        await loadData();
      } catch (e) {
        setErrorMsg(getApiErrorMessage(e, "Sube silinemedi."));
        setDeletingSube(null);
      }
    })();
  };

  const handleEditSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSube) return;
    const formData = new FormData(e.currentTarget);
    const payload = {
      subeAdi: String(formData.get("subeAdi") ?? ""),
      subeTuru: String(formData.get("subeTuru") ?? ""),
      il: String(formData.get("il") ?? ""),
      ilce: String(formData.get("ilce") ?? ""),
      mahalle: String(formData.get("mahalle") ?? ""),
      adres: String(formData.get("adres") ?? ""),
      telefon: String(formData.get("telefon") ?? ""),
      ePosta: String(formData.get("ePosta") ?? ""),
    };
    void (async () => {
      try {
        await fetchJsonWithError(`/api/v1/subeler/${editingSube.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setEditingSube(null);
        await loadData();
      } catch (err) {
        setErrorMsg(getApiErrorMessage(err, "Sube guncellenemedi."));
      }
    })();
  };

  const chartData = subeler.slice(0, 5);
  const maxCalisan = Math.max(
    ...chartData.map((s) =>
      personeller.filter(
        (p) =>
          p.org?.toUpperCase() === s.subeAdi?.toUpperCase() ||
          p.org?.toUpperCase() === s.anaSube?.toUpperCase(),
      ).length,
    ),
    1,
  );
  
  // X ekseni değerleri
  const xLabels = [0, Math.ceil(maxCalisan/4), Math.ceil(maxCalisan/2), Math.ceil((maxCalisan*3)/4), maxCalisan];

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full pb-10 max-w-[1400px] mx-auto font-sans">
      <ApiErrorBanner message={errorMsg} className="max-w-3xl" />
      
      {/* 1. Bar Chart Card */}
      <div className="bg-white rounded-3xl p-8 pt-10 pb-8 shadow-sm border border-gray-100 flex flex-col w-full relative overflow-hidden">
        <h2 className="text-[14px] font-black text-[#0b1b42] mb-10 pl-2">Ana Şubelere Göre Çalışan Dağılımı</h2>
        
        {subeler.length === 0 ? (
          <div className="text-[#6b778c] text-sm text-center py-6">Henüz kayıtlı şube bulunmuyor.</div>
        ) : (
          <div className="flex flex-col w-full px-2 lg:px-12 relative pb-8">
            
            {/* Grid Lines */}
            <div className="absolute inset-0 flex justify-between px-2 lg:px-12 pointer-events-none pb-8 ml-[90px] lg:ml-[140px]">
               {xLabels.map((_, i) => (
                 <div key={i} className="h-full w-px bg-gray-100 border-dashed border-gray-200"></div>
               ))}
            </div>

            {/* Bars */}
            <div className="flex flex-col gap-6 z-10 w-full">
              {chartData.map((sube, idx) => {
                const subePersonel = personeller.filter(p => p.org?.toUpperCase() === sube.subeAdi?.toUpperCase() || p.org?.toUpperCase() === sube.anaSube?.toUpperCase());
                const val = subePersonel.filter(p => p.statu === 'Aktif').length;
                const widthPercent = maxCalisan > 0 ? (val / maxCalisan) * 100 : 0;
                return (
                  <div key={idx} className="flex items-center gap-4 lg:gap-8 w-full">
                    <span className="w-[90px] lg:w-[140px] text-[10px] font-extrabold text-right text-gray-500 uppercase tracking-widest shrink-0 truncate">
                      {sube.subeAdi}
                    </span>
                    <div className="flex-1 h-[14px] relative bg-gray-50 rounded-r-md overflow-hidden">
                      <div 
                        className="h-full bg-[#22c55e] rounded-r-md transition-all duration-[1200ms] ease-out shadow-sm"
                        style={{ width: isLoaded ? `${widthPercent}%` : '0%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

             {/* X-Axis Labels */}
             <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 lg:px-12 ml-[90px] lg:ml-[140px] pt-4">
               {xLabels.map((lbl, i) => (
                 <span key={i} className="text-[10px] font-bold text-gray-400 -translate-x-1/2">{lbl}</span>
               ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 w-full">
        <div className="flex flex-col gap-1 flex-[1.5]">
          <span className="text-[11px] font-black text-[#0b1b42] ml-1">Hızlı Ara</span>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Firma veya Şube Ara" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 outline-none focus:border-[#ef5a28] text-[13px] font-semibold text-[#172b4d] placeholder:font-medium placeholder:text-gray-400 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <span className="text-[11px] font-black text-[#0b1b42] ml-1">Firma & Şube Seçin</span>
          <div className="relative">
            <select 
              value={filterAnaSube}
              onChange={(e) => setFilterAnaSube(e.target.value)}
              className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-200 outline-none focus:border-[#ef5a28] text-[13px] font-semibold text-[#6b778c] appearance-none cursor-pointer transition-all bg-white"
            >
              <option>Firma veya Şube Seçin</option>
              {uniqueFirmaOrSube.map((name, i) => (
                <option key={i} value={name}>{name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <span className="text-[11px] font-black text-[#0b1b42] ml-1">Firma & Şube Durumu</span>
          <div className="relative">
            <select 
              value={filterDurum}
              onChange={(e) => setFilterDurum(e.target.value)}
              className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-200 outline-none focus:border-[#ef5a28] text-[13px] font-semibold text-[#6b778c] appearance-none cursor-pointer transition-all bg-white"
            >
              <option>Tüm Durumlar</option>
              <option>Aktif</option>
              <option>Pasif</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full mt-2">
        {filteredSubeler.map((sube, idx) => {
          // Gerçek sistem verileri (MockDataContext'ten anlık çekilir)
          const subeTalepler = talepler.filter(t => t.sube?.toUpperCase().includes(sube.subeAdi?.toUpperCase()) || sube.subeAdi?.toUpperCase().includes(t.sube?.toUpperCase() as string));
          const subePersoneller = personeller.filter(p => p.org?.toUpperCase().includes(sube.subeAdi?.toUpperCase()) || sube.subeAdi?.toUpperCase().includes(p.org?.toUpperCase() as string));
          
          const aGiris = subeTalepler.filter(t => t.type === "sgk-giris" && t.durum === "ONAYLANAN").length;
          const aCikis = subeTalepler.filter(t => t.type === "sgk-cikis" && t.durum === "ONAYLANAN").length;
          
          const bGiris = subeTalepler.filter(t => t.type === "sgk-giris" && t.durum === "BEKLEYEN").length;
          const bCikis = subeTalepler.filter(t => t.type === "sgk-cikis" && t.durum === "BEKLEYEN").length;
          const isKazas = subeTalepler.filter(t => t.type === "is-kazasi").length; // Mock
          const aktifSayi = subePersoneller.filter(p => p.statu === "Aktif").length;

          return (
          <div 
            key={sube.id || idx} 
            className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col opacity-0 group hover:shadow-lg hover:border-gray-200 transition-all duration-300"
            style={{ 
              animation: isLoaded ? `fade-in-up 0.6s ease-out ${idx * 0.1}s forwards` : 'none',
              transform: 'translateY(10px)'
            }}
          >
            {/* Kart Başlığı */}
            <div className="flex items-center justify-between pb-5 border-b border-gray-100/80 mb-5">
              <div className="flex items-center gap-3">
                <h3 className="text-[15.5px] font-[900] text-[#0b1b42] uppercase tracking-tight">{sube.subeAdi}</h3>
                <span className="bg-[#22c55e] text-white text-[9.5px] tracking-wider font-black px-2 py-0.5 rounded uppercase shadow-sm">Aktif</span>
              </div>
              <div className="relative">
                <button 
                   onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === sube.id ? null : sube.id); }}
                   className="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors"
                >
                  <MoreVertical className="w-[18px] h-[18px] text-gray-400" />
                </button>
                {openMenuId === sube.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-fade-in flex flex-col">
                      <button onClick={() => window.location.href = `/panel/sube/bilgiler?id=${sube.id}`} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2.5 text-[13px] text-[#0b1b42] font-semibold transition-colors">
                        <Building2 className="w-4 h-4 text-gray-400"/> Şube Bilgileri
                      </button>
                      <button onClick={() => { setEditingSube(sube); setOpenMenuId(null); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2.5 text-[13px] text-[#0b1b42] font-semibold transition-colors">
                        <Edit className="w-4 h-4 text-gray-400"/> Şube Düzenle
                      </button>
                      <div className="h-px bg-gray-100 my-0.5 mx-2"></div>
                      <button onClick={() => { setDeletingSube(sube); setOpenMenuId(null); }} className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2.5 text-[13px] text-red-600 font-bold transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500"/> Şube Sil
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Info 1 */}
            <div className="flex flex-col gap-3 mb-7">
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-[#8a94a6] mt-0.5" />
                <span className="text-[12.5px] font-bold text-[#172b4d]">{sube.anaSube}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#8a94a6] mt-0.5" />
                <span className="text-[12px] font-semibold text-[#6b778c] uppercase">{sube.il} / {sube.ilce} / {sube.mahalle}</span>
              </div>
              <div className="flex items-start gap-3">
                <Tag className="w-4 h-4 text-[#8a94a6] mt-0.5" />
                <span className="text-[12px] font-semibold text-[#6b778c]">Masraf Merkezi Kodu: <strong className="text-[#172b4d]">{sube.masrafKodu || "-"}</strong></span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-[#8a94a6]" />
                <span className="text-[12.5px] font-bold text-[#172b4d]">{sube.subeYetkilisi}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#8a94a6]" />
                <span className="text-[12.5px] font-bold text-[#172b4d]">{sube.telefon}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#8a94a6]" />
                <span className="text-[12.5px] font-bold text-[#172b4d]">{sube.ePosta}</span>
              </div>
            </div>

            {/* Bekleyen İşlemler Tablosu */}
            <div className="flex flex-col gap-3 mb-8">
              <span className="text-[10px] font-black text-[#8a94a6] uppercase tracking-widest px-1">Bekleyen İşlemler</span>
              <div className="grid grid-cols-2 gap-3">
                 <div className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2 bg-white">
                   <div className="flex items-center gap-2">
                     <UserPlus className="w-[14px] h-[14px] text-gray-400" />
                     <span className="text-[11.5px] font-semibold text-[#172b4d]">Giriş Talebi</span>
                   </div>
                   <span className="text-[12.5px] font-black text-[#0b1b42]">{bGiris}</span>
                 </div>
                 <div className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2 bg-white">
                   <div className="flex items-center gap-2">
                     <UserMinus className="w-[14px] h-[14px] text-gray-400" />
                     <span className="text-[11.5px] font-semibold text-[#172b4d]">Çıkış Talebi</span>
                   </div>
                   <span className="text-[12.5px] font-black text-[#0b1b42]">{bCikis}</span>
                 </div>
                 <div className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2 bg-white">
                   <div className="flex items-center gap-2">
                     <FileWarning className="w-[14px] h-[14px] text-gray-400" />
                     <span className="text-[11.5px] font-semibold text-[#172b4d]">İş Kazası Bld.</span>
                   </div>
                   <span className="text-[12.5px] font-black text-[#0b1b42]">{isKazas}</span>
                 </div>
                 <div className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2 bg-white">
                   <div className="flex items-center gap-2">
                     <ClipboardList className="w-[14px] h-[14px] text-gray-400" />
                     <span className="text-[11.5px] font-semibold text-[#172b4d]">Toplantı Formu</span>
                   </div>
                   <span className="text-[12.5px] font-black text-[#0b1b42]">0</span>
                 </div>
              </div>
            </div>

            {/* Durum & Takip Barları */}
            <div className="flex flex-col gap-4 mb-8">
              <span className="text-[10px] font-black text-[#8a94a6] uppercase tracking-widest px-1">Durum & Takip</span>
              
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-[#0b1b42]">
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span className="text-[11.5px] font-bold">Puantaj Girişi</span>
                  </div>
                  <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded bg-[#0b1b42] text-white">{sube.puantajOrani || 100}% Tamam</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full bg-[#0052cc] rounded-full transition-all duration-[1500ms] ease-out w-0" 
                        style={{ width: isLoaded ? `${sube.puantajOrani || 100}%` : '0%' }} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-[#0b1b42]">
                    <FileWarning className="w-3.5 h-3.5" />
                    <span className="text-[11.5px] font-bold">Özlük Evrak Girişi</span>
                  </div>
                  <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded bg-[#0b1b42] text-white">{sube.ozlukOrani || 100}% Tamam</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full bg-[#0052cc] rounded-full transition-all duration-[1500ms] ease-out w-0" 
                        style={{ width: isLoaded ? `${sube.ozlukOrani || 100}%` : '0%' }} />
                </div>
              </div>
            </div>

            {/* Alt İstatistik Kutuları */}
            <div className="grid grid-cols-3 gap-2 mt-auto">
              <div className="flex flex-col items-center justify-center p-3 py-4 border border-gray-100 rounded-2xl bg-white shadow-[0_2px_10px_0_rgba(0,0,0,0.015)] group-hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.03)] transition-shadow">
                <User className="w-[18px] h-[18px] text-[#8a94a6] mb-2" />
                <span className="text-[10px] font-extrabold text-[#6b778c] mb-1 text-center">Aktif Personel</span>
                <span className="text-[18px] font-black text-[#0b1b42]">{aktifSayi}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 py-4 border border-gray-100 rounded-2xl bg-white shadow-[0_2px_10px_0_rgba(0,0,0,0.015)] group-hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.03)] transition-shadow">
                <UserPlus className="w-[18px] h-[18px] text-[#22c55e] mb-2" />
                <span className="text-[10px] font-extrabold text-[#6b778c] mb-1 text-center">Aylık Giriş</span>
                <span className="text-[18px] font-black text-[#0b1b42]">{aGiris}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 py-4 border border-gray-100 rounded-2xl bg-white shadow-[0_2px_10px_0_rgba(0,0,0,0.015)] group-hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.03)] transition-shadow">
                <UserMinus className="w-[18px] h-[18px] text-[#ef4444] mb-2" />
                <span className="text-[10px] font-extrabold text-[#6b778c] mb-1 text-center">Aylık Çıkış</span>
                <span className="text-[18px] font-black text-[#0b1b42]">{aCikis}</span>
              </div>
            </div>

          </div>
        )})}
      </div>

      {/* Edit Modal */}
      {mounted && editingSube && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0b1b42]/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl p-8 relative">
            <button onClick={() => setEditingSube(null)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4 text-[#0b1b42]"/>
            </button>
            <h2 className="text-[22px] font-black text-[#0b1b42] mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
               <Edit className="w-6 h-6 text-[#0052cc]" />
               Şubeyi Düzenle
            </h2>
            <form onSubmit={handleEditSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-5">
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">Şube Adı</label>
                   <input required name="subeAdi" defaultValue={editingSube.subeAdi} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"/>
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">Firma / Ana Şube</label>
                   <input required name="anaSube" defaultValue={editingSube.anaSube} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"/>
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">Şube Türü</label>
                   <input required name="subeTuru" defaultValue={editingSube.subeTuru} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"/>
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">Masraf Merkezi</label>
                   <input required name="masrafKodu" defaultValue={editingSube.masrafKodu} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"/>
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">Yetkili Kişi</label>
                   <input required name="subeYetkilisi" defaultValue={editingSube.subeYetkilisi} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"/>
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">Telefon</label>
                   <input required name="telefon" defaultValue={editingSube.telefon} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"/>
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">E-Posta</label>
                   <input required name="ePosta" type="email" defaultValue={editingSube.ePosta} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"/>
                 </div>
                 <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-4 col-span-2 mt-2">
                   <span className="text-[12px] font-black text-[#0b1b42]">Lokasyon Bilgileri</span>
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">İl</label>
                   <input required name="il" defaultValue={editingSube.il} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"/>
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">İlçe</label>
                   <input required name="ilce" defaultValue={editingSube.ilce} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"/>
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">Mahalle</label>
                   <input required name="mahalle" defaultValue={editingSube.mahalle} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"/>
                 </div>
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                 <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">Açık Adres</label>
                 <textarea name="adres" defaultValue={editingSube.adres} className="w-full h-24 p-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all resize-none"/>
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-4 pt-6 border-t border-gray-100">
                 <button type="button" onClick={() => setEditingSube(null)} className="px-6 py-3 rounded-xl font-bold text-[14px] text-gray-500 hover:bg-gray-50 transition-colors">İptal Et</button>
                 <button type="submit" className="px-6 py-3 rounded-xl font-bold text-[14px] text-white bg-[#0052cc] hover:bg-blue-700 transition-colors shadow-sm">Değişiklikleri Kaydet</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {mounted && deletingSube && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0b1b42]/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-sm flex flex-col shadow-2xl p-8 relative items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
               <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-[20px] font-black text-[#0b1b42] mb-2">
               Şubeyi Sil
            </h2>
            <p className="text-[13px] font-semibold text-[#6b778c] mb-8 leading-relaxed">
              <strong className="text-[#172b4d]">{deletingSube.subeAdi}</strong> isimli şubeyi tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex items-center gap-3 w-full">
               <button onClick={() => setDeletingSube(null)} className="flex-1 py-3.5 rounded-xl font-bold text-[14px] text-[#6b778c] bg-gray-50 hover:bg-gray-100 transition-colors">İptal Et</button>
               <button onClick={handleDeleteConfirm} className="flex-1 py-3.5 rounded-xl font-bold text-[14px] text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm">Evet, Sil</button>
            </div>
          </div>
        </div>,
        document.body
      )}

       <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />
    </div>
  );
}