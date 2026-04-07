"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Building2, GitFork, Check, Calendar, ChevronDown, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";

export default function YeniDepartmanEklePage() {
  const router = useRouter();
  const [personeller, setPersoneller] = useState<any[]>([]);
  const [yetkililer, setYetkililer] = useState<any[]>([]);
  const [subeler, setSubeler] = useState<any[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Form State
  const [subeId, setSubeId] = useState("");
  const [departmanAdi, setDepartmanAdi] = useState("");
  const [acilisTarihi, setAcilisTarihi] = useState("");
  const [masrafKodu, setMasrafKodu] = useState("");
  const [yetkiliId, setYetkiliId] = useState("");

  useEffect(() => {
    setMounted(true);
    void (async () => {
      try {
        const personelResponse = await fetch("/api/v1/personel?page=1&pageSize=500", {
          credentials: "include",
        });
        const personelJson = (await personelResponse.json()) as { success?: boolean; data?: any[] };
        if (personelResponse.ok && personelJson.success && Array.isArray(personelJson.data)) {
          setPersoneller(personelJson.data);
        }
      } catch {}

      try {
        const yetkiliRes = await fetch("/api/v1/yetkililer", { credentials: "include" });
        const yetkiliJson = (await yetkiliRes.json()) as { success?: boolean; data?: any[] };
        if (yetkiliRes.ok && yetkiliJson.success && Array.isArray(yetkiliJson.data)) {
          setYetkililer(yetkiliJson.data);
        }
      } catch {}

      try {
        const response = await fetch("/api/v1/subeler?page=1&pageSize=200", {
          credentials: "include",
        });
        const json = (await response.json()) as { success?: boolean; data?: any[] };
        if (response.ok && json.success && Array.isArray(json.data)) {
          setSubeler(
            json.data.map((item) => ({
              id: item.id,
              subeAdi: item.name ?? item.subeAdi,
            })),
          );
          return;
        }
      } catch {
        setSubeler([]);
      }
    })();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subeId || !departmanAdi) {
      toast.error("Lütfen şube ve departman adını doldurunuz.");
      return;
    }

    void (async () => {
      try {
        const response = await fetch("/api/v1/departmanlar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            subeId,
            departmanAdi,
            acilisTarihi,
            masrafKodu,
            yetkiliId: yetkiliId || undefined,
          }),
        });
        const json = await response.json().catch(() => null);
        if (!response.ok) {
          const msg = json?.error?.message || json?.message || `Sunucu hatası: ${response.status}`;
          toast.error(`Departman kaydedilemedi: ${msg}`);
          return;
        }
        setIsSuccessModalOpen(true);
      } catch (error: any) {
        toast.error(error?.message || "Bağlantı hatası. Lütfen tekrar deneyin.");
      }
    })();
  };

  const getSubeName = () => {
     const s = subeler.find(x => x.id === subeId || x.subeAdi === subeId);
     return s ? s.subeAdi : subeId;
  };

  return (
    <div className="flex flex-col animate-fade-in w-full pb-20 max-w-[1000px] mx-auto font-sans mt-2">
      <Toaster richColors position="top-right" />
      
      {/* Breadcrumb & Header */}
      <div className="flex flex-col mb-8">
        <div className="flex items-center text-[12.5px] font-bold text-[#6b778c] mb-3">
          <Link href="/panel/departman/liste" className="hover:text-[#0b1b42] transition-colors">Departman İşlemleri</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5" />
          <span className="text-[#0052cc]">Yeni Departman Ekle</span>
        </div>
        <h1 className="text-[26px] font-[900] text-[#0b1b42] tracking-tight">Yeni Departman Ekle</h1>
        <p className="text-[13.5px] font-semibold text-[#6b778c] mt-1.5">Şubenize bağlı yeni bir departman oluşturun ve yöneticisini atayın.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        
        {/* Card 1: Şubeyi Belirleyin */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col items-start gap-6">
           <div className="flex items-start gap-4 w-full">
              <div className="w-14 h-14 rounded-2xl bg-[#ecf4ff] flex items-center justify-center shrink-0">
                 <Building2 className="w-7 h-7 text-[#0052cc] stroke-[2]" />
              </div>
              <div className="flex flex-col pt-1">
                 <h2 className="text-[18px] font-black text-[#0b1b42]">Şubeyi Belirleyin</h2>
                 <p className="text-[13px] font-semibold text-[#6b778c] mt-0.5">Departmanın oluşturulacağı şubeyi seçin. Tüm departman bilgileri bu şubeye bağlı kaydedilir.</p>
              </div>
           </div>

           <div className="w-full mt-2">
              <label className="text-[11px] font-black text-[#0b1b42] uppercase tracking-wide mb-2 block">Şube Belirleyin</label>
              <div className="relative">
                 <select 
                   required
                   value={subeId}
                   onChange={(e) => setSubeId(e.target.value)}
                   className="w-full h-14 pl-5 pr-12 rounded-xl border border-gray-200 outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] text-[13.5px] font-semibold text-[#0b1b42] appearance-none cursor-pointer transition-all bg-white shadow-sm"
                 >
                    <option value="" disabled>Şube seçiniz...</option>
                    {subeler.map(s => (
                       <option key={s.id || s.subeAdi} value={s.id || s.subeAdi}>{s.subeAdi}</option>
                    ))}
                 </select>
                 {!subeId ? (
                    <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                 ) : (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none bg-[#10b981] text-white px-3 h-10 rounded-lg flex items-center gap-1.5 shadow-sm text-[12px] font-bold">
                       <Check className="w-4 h-4" /> Şube Seçildi
                    </div>
                 )}
              </div>
              <span className="text-[10px] font-bold text-gray-400 mt-2 block pl-1">Alt menülerden ilgili Firma / Şubeyi Seçin</span>
           </div>
        </div>

        {/* Card 2: Departman Bilgilerini Girin */}
        <div className={`bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col items-start gap-6 transition-all duration-300 ${!subeId ? "opacity-50 pointer-events-none select-none" : "opacity-100"}`}>
           <div className="flex items-start gap-4 w-full">
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-50 flex items-center justify-center shrink-0">
                 <GitFork className="w-7 h-7 text-fuchsia-500 stroke-[2]" />
              </div>
              <div className="flex flex-col pt-1">
                 <h2 className="text-[18px] font-black text-[#0b1b42]">Departman Bilgilerini Girin</h2>
                 <p className="text-[13px] font-semibold text-[#6b778c] mt-0.5">Firmanız adına sisteme tanımlı yetkili kişiye ait ad, soyad, iletişim ve görev bilgelerini bu modül üzerinden tek noktadan yönetebilirsiniz.</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7 w-full mt-2">
              <div className="flex flex-col">
                 <label className="text-[11px] font-black text-[#0b1b42] uppercase tracking-wide mb-2 block">Departman Adını Girin</label>
                 <input 
                   required 
                   value={departmanAdi}
                   onChange={e => setDepartmanAdi(e.target.value)}
                   placeholder="Muhasebe" 
                   className="w-full h-14 px-5 rounded-xl border border-gray-200 outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] text-[13.5px] font-semibold text-[#0b1b42] placeholder:text-gray-300 transition-all shadow-sm"
                 />
                 <span className="text-[10px] font-bold text-gray-400 mt-2 block pl-1">En fazla 20 karakter, harf ve rakam içerebilir.</span>
              </div>

              <div className="flex flex-col relative w-full">
                 <label className="text-[11px] font-black text-[#0b1b42] uppercase tracking-wide mb-2 block">Departman Açılışı Tarihi</label>
                 <input 
                   required
                   type="date"
                   value={acilisTarihi}
                   onChange={e => setAcilisTarihi(e.target.value)}
                   className="w-full h-14 px-5 rounded-xl border border-gray-200 outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] text-[13.5px] font-semibold text-[#0b1b42] transition-all shadow-sm appearance-none"
                 />
              </div>

              <div className="flex flex-col">
                 <label className="text-[11px] font-black text-[#0b1b42] uppercase tracking-wide mb-2 block">Masraf Merkezi Kodu</label>
                 <input 
                   required 
                   value={masrafKodu}
                   onChange={e => setMasrafKodu(e.target.value)}
                   placeholder="HM-0012" 
                   className="w-full h-14 px-5 rounded-xl border border-gray-200 outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] text-[13.5px] font-semibold text-[#0b1b42] placeholder:text-gray-300 transition-all shadow-sm"
                 />
                 <span className="text-[10px] font-bold text-gray-400 mt-2 block pl-1">En fazla 20 karakter, harf ve rakam içerebilir.</span>
              </div>

              <div className="flex flex-col relative w-full">
                 <label className="text-[11px] font-black text-[#0b1b42] uppercase tracking-wide mb-2 block">Departman Yetkilisi</label>
                 <select
                   value={yetkiliId}
                   onChange={e => setYetkiliId(e.target.value)}
                   className="w-full h-14 pl-5 pr-12 rounded-xl border border-gray-200 outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] text-[13.5px] font-semibold text-[#0b1b42] appearance-none cursor-pointer transition-all bg-white shadow-sm"
                 >
                    <option value="">Yetkili seçin (isteğe bağlı)</option>
                    {yetkililer.length > 0 && (
                      <optgroup label="── İşveren Yetkilileri">
                        {yetkililer.map(y => (
                          <option key={y.id} value={y.id}>
                            {y.adSoyad}{y.unvan ? ` — ${y.unvan}` : ""}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {personeller.length > 0 && (
                      <optgroup label="── Yetkili Kişiler (Personel)">
                        {personeller.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.adSoyad}{p.unvan ? ` — ${p.unvan}` : ""}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {yetkililer.length === 0 && personeller.length === 0 && (
                      <option disabled>Henüz kayıtlı yetkili bulunamadı</option>
                    )}
                 </select>
                 <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-[38px] pointer-events-none" />
              </div>
           </div>
        </div>

        {/* Action Button */}
        <button 
          disabled={!subeId}
          className={`w-full h-[60px] rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-[14.5px] shadow-lg transition-colors mt-2 ${!subeId ? "bg-gray-400 cursor-not-allowed opacity-60" : "bg-[#1a1c2e] hover:bg-[#252840]"}`}
        >
           <Check className="w-5 h-5 stroke-[2.5] text-white/80" />
           Bilgileri Kaydet
        </button>
      </form>

      {/* Success Modal */}
      {mounted && isSuccessModalOpen && createPortal(
         <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0b1b42]/50 backdrop-blur-md animate-fade-in">
           <div className="bg-white rounded-[2rem] w-full max-w-[420px] flex flex-col items-center justify-center shadow-2xl p-10 relative">
             <div className="w-[84px] h-[84px] rounded-full bg-[#ecfdf5] flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-[#10b981] stroke-[3]" />
             </div>
             <h2 className="text-[22px] font-black text-[#0b1b42] mb-3 text-center">
                Departman Eklendi!
             </h2>
             <p className="text-[13px] font-semibold text-[#6b778c] mb-8 text-center px-4 leading-relaxed">
               <strong className="text-[#172b4d]">{departmanAdi}</strong> departmanı <strong className="text-[#172b4d]">{getSubeName()}</strong> şubesine başarıyla eklendi.
             </p>
             <div className="flex items-center gap-4 w-full px-2">
                <button 
                  onClick={() => {
                     setDepartmanAdi("");
                     setSubeId("");
                     setMasrafKodu("");
                     setYetkiliId("");
                     setAcilisTarihi("");
                     setIsSuccessModalOpen(false);
                  }} 
                  className="flex-1 py-3.5 rounded-xl font-bold text-[14px] text-[#0b1b42] bg-white border-2 border-gray-100 hover:border-gray-200 transition-colors h-14"
                >
                  Yeni Ekle
                </button>
                <button 
                  onClick={() => router.push("/panel/departman/liste")} 
                  className="flex-1 py-3.5 rounded-xl font-bold text-[14px] text-white bg-[#1a1c2e] hover:bg-[#252840] transition-colors shadow-sm h-14"
                >
                  Listeye Git
                </button>
             </div>
           </div>
         </div>,
         document.body
      )}

    </div>
  );
}