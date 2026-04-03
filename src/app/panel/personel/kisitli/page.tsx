"use client";
import React, { useState, useEffect } from "react";
import { Search, Plus, MoreVertical, ChevronDown } from "lucide-react";
import { KisitliPersonelModal } from "@/components/personel/Modals/KisitliPersonelModal";
import { KisitliPersonel } from "@/types";
import { fetchJsonWithError, getApiErrorMessage } from "@/lib/fetchJsonWithError";
import { ApiErrorBanner, ApiLoadingText } from "@/components/common/ApiStatus";

function mapApiKisitli(r: Record<string, unknown>): KisitliPersonel {
  const ek = r.eklenmeTarihi ? new Date(String(r.eklenmeTarihi)).toLocaleDateString("tr-TR") : "";
  const kal = r.kaldirilmaTarihi
    ? new Date(String(r.kaldirilmaTarihi)).toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : undefined;
  return {
    id: String(r.id),
    adSoyad: String(r.adSoyad ?? ""),
    tckn: String(r.tckn ?? ""),
    sube: "-",
    neden: String(r.neden ?? ""),
    aciklama: r.aciklama ? String(r.aciklama) : undefined,
    eklenmeTarihi: ek,
    durum: String(r.durum ?? "Beklemede"),
    kaldirilmaTarihi: kal,
  };
}

export default function KisitliPersonellerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tüm Durumlar");
  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [personeller, setPersoneller] = useState<KisitliPersonel[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        setErrorMsg("");
        setIsLoading(true);
        const rows = await fetchJsonWithError<unknown[]>(`/api/v1/personel/kisitli`);
        const list = Array.isArray(rows) ? rows : [];
        setPersoneller(list.map((x) => mapApiKisitli(x as Record<string, unknown>)));
      } catch (e) {
        setErrorMsg(getApiErrorMessage(e, "Liste yuklenemedi."));
        setPersoneller([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Dışarı tıklama durumunda menüyü kapatma
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.action-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSave = (newPersonel: Omit<KisitliPersonel, "id" | "eklenmeTarihi" | "durum">) => {
    void (async () => {
      try {
        const created = await fetchJsonWithError<Record<string, unknown>>("/api/v1/personel/kisitli", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adSoyad: newPersonel.adSoyad,
            tckn: newPersonel.tckn,
            neden: newPersonel.neden,
            aciklama: newPersonel.aciklama,
            durum: "Beklemede",
          }),
        });
        setPersoneller((prev) => [mapApiKisitli(created), ...prev]);
        setIsModalOpen(false);
      } catch (e) {
        setErrorMsg(getApiErrorMessage(e, "Kayit olusturulamadi."));
      }
    })();
  };

  const handleChangeStatus = (id: string | number, newStatus: string) => {
    let apiDurum = newStatus;
    if (newStatus === "Kısıtlıya Al") apiDurum = "Beklemede";
    void (async () => {
      try {
        const updated = await fetchJsonWithError<Record<string, unknown>>("/api/v1/personel/kisitli", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: String(id),
            durum: apiDurum,
            ...(apiDurum === "Kaldırıldı" ? { kaldirilmaTarihi: new Date().toISOString() } : {}),
          }),
        });
        setPersoneller((prev) =>
          prev.map((p) => (p.id === id ? mapApiKisitli(updated) : p)),
        );
      } catch (e) {
        setErrorMsg(getApiErrorMessage(e, "Durum guncellenemedi."));
      }
    })();
  };

  const filteredPersoneller = personeller.filter(p => {
    const matchesSearch = p.adSoyad.toLowerCase().includes(searchQuery.toLowerCase()) || p.tckn.includes(searchQuery);
    const matchesStatus = statusFilter === "Tüm Durumlar" || p.durum === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (durum: string) => {
    switch (durum) {
      case "Kaldırıldı":
        return <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black">{durum}</span>;
      case "Onaylandı":
        return <span className="px-3 py-1 rounded-full bg-red-50 text-red-500 text-[10px] font-black">{durum}</span>;
      case "Beklemede":
        return <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-[10px] font-black">{durum}</span>;
      case "Reddedildi":
        return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black">{durum}</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-[10px] font-black">{durum}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto p-2">
      <ApiErrorBanner message={errorMsg} />
      {isLoading ? <ApiLoadingText message="Liste yukleniyor..." className="py-8" /> : null}
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500">
        <span>Personel İşlemleri</span>
        <span>/</span>
        <span className="text-[#ef5a28] font-bold">Kısıtlı Personel Listesi</span>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col">
        {/* Card Header */}
        <div className="p-8 flex flex-col gap-2">
          <h1 className="text-[20px] font-black text-[#172b4d]">Kısıtlı Personel Listesi</h1>
          <p className="text-[13px] font-medium text-gray-500">
            Kısıtlı personel kayıtları ve talep durumları. Admin onayı ile aktif listeye alınır.
          </p>
        </div>

        {/* Toolbar */}
        <div className="px-8 pb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Ad Soyad veya TCKN ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10 outline-none text-[13px] font-medium text-[#172b4d] transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 stroke-[2.5]" />
            </div>

            <div className="relative w-[240px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#0052cc] outline-none text-[13px] font-medium text-[#172b4d] appearance-none focus:ring-4 focus:ring-[#0052cc]/10 transition-all cursor-pointer"
              >
                <option value="Tüm Durumlar">Tüm Durumlar</option>
                <option value="Beklemede">Beklemede</option>
                <option value="Onaylandı">Onaylandı</option>
                <option value="Reddedildi">Reddedildi</option>
                <option value="Kaldırıldı">Kaldırıldı</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none stroke-[2.5]" />
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-[#ef5a28] hover:bg-[#d94720] text-white font-extrabold text-[13px] transition-all active:scale-95 flex items-center gap-2 shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Yeni Kayıt Ekle
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto pb-32">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-y-2 border-gray-50">
                <th className="py-4 px-8 text-left text-[11px] font-black text-[#172b4d] w-16">#</th>
                <th className="py-4 px-4 text-left text-[11px] font-black text-[#172b4d]">Adı Soyadı</th>
                <th className="py-4 px-4 text-left text-[11px] font-black text-[#172b4d]">Kimlik No</th>
                <th className="py-4 px-4 text-left text-[11px] font-black text-[#172b4d]">Şube</th>
                <th className="py-4 px-4 text-left text-[11px] font-black text-[#172b4d]">Listeye Alınma Nedeni</th>
                <th className="py-4 px-4 text-left text-[11px] font-black text-[#172b4d]">Eklenme Tarihi</th>
                <th className="py-4 px-4 text-left text-[11px] font-black text-[#172b4d]">Kaldırılma Tarihi</th>
                <th className="py-4 px-4 text-left text-[11px] font-black text-[#172b4d]">Durum</th>
                <th className="py-4 px-8 text-right text-[11px] font-black text-[#172b4d]">Menü</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersoneller.map((personel, idx) => {
                const isExpanded = expandedRowId === personel.id;
                return (
                <React.Fragment key={personel.id}>
                  <tr 
                    onClick={() => setExpandedRowId(isExpanded ? null : personel.id)}
                    className={`border-b border-gray-50 transition-colors cursor-pointer group ${isExpanded ? 'bg-[#111] border-transparent' : 'hover:bg-gray-50/50'}`}
                  >
                    <td className={`py-5 px-8 text-[13px] font-black transition-colors ${isExpanded ? 'text-white' : 'text-[#172b4d]'}`}>
                      {idx + 1}
                    </td>
                    <td className={`py-5 px-4 text-[13px] font-bold transition-colors ${isExpanded ? 'text-white' : 'text-[#172b4d]'}`}>
                      {personel.adSoyad}
                    </td>
                    <td className={`py-5 px-4 text-[13px] font-bold transition-colors ${isExpanded ? 'text-white' : 'text-[#172b4d]'}`}>
                      {personel.tckn}
                    </td>
                    <td className={`py-5 px-4 text-[13px] font-medium transition-colors ${isExpanded ? 'text-gray-300' : 'text-gray-500'}`}>
                      {personel.sube}
                    </td>
                    <td className={`py-5 px-4 text-[13px] font-medium transition-colors ${isExpanded ? 'text-gray-300' : 'text-gray-500'}`}>
                      {personel.neden}
                    </td>
                    <td className={`py-5 px-4 text-[13px] font-bold transition-colors ${isExpanded ? 'text-white' : 'text-[#172b4d]'}`}>
                      {personel.eklenmeTarihi}
                    </td>
                    <td className={`py-5 px-4 text-[13px] font-bold transition-colors ${isExpanded ? 'text-gray-300' : 'text-gray-500'}`}>
                      {personel.kaldirilmaTarihi || "-"}
                    </td>
                    <td className="py-5 px-4">
                      {getStatusBadge(personel.durum)}
                    </td>
                    <td className="py-5 px-8 text-right relative">
                      <div className="action-menu-container">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === personel.id ? null : personel.id); }} 
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ml-auto ${isExpanded ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-[#172b4d]'}`}
                        >
                          <MoreVertical className="w-5 h-5 stroke-[2.5]" />
                        </button>
                        
                        {activeMenuId === personel.id && (
                          <div className="absolute right-8 top-12 w-40 bg-white border border-gray-100 shadow-lg rounded-xl flex flex-col py-2 z-[60] animate-in fade-in zoom-in duration-150">
                            <button onClick={(e) => { e.stopPropagation(); handleChangeStatus(personel.id, "Onaylandı"); setActiveMenuId(null); }} className="px-4 py-2.5 text-left text-[12px] font-bold text-[#172b4d] hover:bg-gray-50 flex items-center gap-2 transition-colors w-full">Onayla</button>
                            <button onClick={(e) => { e.stopPropagation(); handleChangeStatus(personel.id, "Reddedildi"); setActiveMenuId(null); }} className="px-4 py-2.5 text-left text-[12px] font-bold text-[#172b4d] hover:bg-gray-50 flex items-center gap-2 transition-colors w-full">Reddet</button>
                            <button onClick={(e) => { e.stopPropagation(); handleChangeStatus(personel.id, "Beklemede"); setActiveMenuId(null); }} className="px-4 py-2.5 text-left text-[12px] font-bold text-[#172b4d] hover:bg-gray-50 flex items-center gap-2 transition-colors w-full">Beklemeye Al</button>
                            <div className="h-px bg-gray-100 my-1 w-full"></div>
                            {personel.durum === "Kaldırıldı" ? (
                              <button onClick={(e) => { e.stopPropagation(); handleChangeStatus(personel.id, "Kısıtlıya Al"); setActiveMenuId(null); }} className="px-4 py-2.5 text-left text-[12px] font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors w-full">Kısıtlıya Al</button>
                            ) : (
                              <button onClick={(e) => { e.stopPropagation(); handleChangeStatus(personel.id, "Kaldırıldı"); setActiveMenuId(null); }} className="px-4 py-2.5 text-left text-[12px] font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors w-full">Kısıtı Kaldır</button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-[#111] border-b border-gray-50">
                      <td colSpan={9} className="px-8 pb-10 pt-4">
                        <div className="flex flex-col gap-8 ml-8">
                          <div className="flex items-center gap-4">
                            <h3 className="text-[16px] font-black text-[#ef5a28]">{personel.adSoyad} <span className="text-gray-500 mx-2">—</span> <span className="text-[#ef5a28]">{personel.tckn}</span></h3>
                            <div className="ml-auto flex items-center pr-4">
                              {getStatusBadge(personel.durum)}
                            </div>
                          </div>
                          
                          <div className="flex hidden gap-3"></div>
                          
                          <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-[200px_1fr] gap-4">
                              <span className="text-[13px] font-bold text-[#ef5a28]">Kayıt No</span>
                              <span className="text-[13px] font-medium text-white">: KST-{personel.id.toString().padStart(6, '0')}-26</span>
                            </div>
                            <div className="grid grid-cols-[200px_1fr] gap-4">
                              <span className="text-[13px] font-bold text-[#ef5a28]">Eklenme Tarihi</span>
                              <span className="text-[13px] font-medium text-white">: {personel.eklenmeTarihi}</span>
                            </div>
                            <div className="grid grid-cols-[200px_1fr] gap-4">
                              <span className="text-[13px] font-bold text-[#ef5a28]">Ana Firma Ünvanı</span>
                              <span className="text-[13px] font-medium text-white">: {personel.sube}</span>
                            </div>
                            <div className="grid grid-cols-[200px_1fr] gap-4">
                              <span className="text-[13px] font-bold text-[#ef5a28]">Ekleyen Yönetici</span>
                              <span className="text-[13px] font-medium text-white">: SİSTEM YÖNETİCİSİ</span>
                            </div>
                            <div className="grid grid-cols-[200px_1fr] gap-4">
                              <span className="text-[13px] font-bold text-[#ef5a28]">Listeye Alınma Nedeni</span>
                              <span className="text-[13px] font-medium text-white">: {personel.neden}</span>
                            </div>
                            <div className="grid grid-cols-[200px_1fr] gap-4">
                              <span className="text-[13px] font-bold text-[#ef5a28]">Açıklama</span>
                              <span className="text-[13px] font-medium text-white">: {personel.aciklama || "-"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
                );
              })}
              {filteredPersoneller.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[13px] font-bold text-gray-400">
                    Aranan kriterlere uygun kısıtlı personel bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <KisitliPersonelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
