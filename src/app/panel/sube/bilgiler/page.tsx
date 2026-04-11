"use client";
import React, { useState, useEffect } from "react";
import { 
  Building2, Store, MapPin, ChevronRight, ArrowLeft, 
  FileText, User, Phone, CalendarDays, Key, Users, Hash, 
  Mail, Globe, Map
} from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";

export default function SubeBilgileriPage() {
  const [subeler, setSubeler] = useState<any[]>([]);
  const [selectedSube, setSelectedSube] = useState<any | null>(null);

  useEffect(() => {
    void (async () => {
      let loadedSubeler: any[] = [];

      try {
        const response = await fetch("/api/v1/subeler?page=1&pageSize=200", {
          credentials: "include",
        });
        const json = (await response.json()) as { success?: boolean; data?: any[] };
        if (response.ok && json.success && Array.isArray(json.data)) {
          loadedSubeler = json.data.map((item) => ({
            ...item,
            subeAdi: item.name ?? item.subeAdi,
            masrafKodu: item.masrafKodu ?? "-",
          }));
        }
      } catch {
        loadedSubeler = [];
      }

      setSubeler(loadedSubeler);

      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get("id");
        if (urlId) {
          const target = loadedSubeler.find((s: any) => s.id === urlId);
          if (target) setSelectedSube(target);
        }
      }
    })();
  }, []);

  if (selectedSube) {
    return <SubeDetail sube={selectedSube} onBack={() => {
      setSelectedSube(null);
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }} />;
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full pb-10 max-w-5xl mx-auto font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50/50 p-10 py-16 w-full flex flex-col items-center">
        
        {/* Header Content */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-[60px] h-[60px] rounded-[1.25rem] bg-[#f4f7fa] flex items-center justify-center mb-5 border border-indigo-50/50">
            <Store className="w-8 h-8 text-[#0052cc] stroke-[2]" />
          </div>
          <h1 className="text-[26px] font-black text-[#0b1b42] tracking-tight mb-2">Şube Bilgileri</h1>
          <p className="text-[#6b778c] font-medium text-[13.5px]">Bilgilerini görüntülemek istediğiniz şubeyi aşağıdaki listeden seçiniz.</p>
        </div>

        {/* Sube Listesi Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {subeler.map((sube) => (
            <div 
              key={sube.id}
              onClick={() => setSelectedSube(sube)}
              className="group bg-white rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-100/80 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#0052cc]/20"
            >
              <div className="w-[45px] h-[45px] rounded-xl bg-[#f8fafc] border border-gray-100 text-[#0b1b42] flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-[#344bf1] group-hover:text-white group-hover:border-transparent">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex flex-col flex-1 pl-1">
                <h3 className="text-[14px] font-[900] text-[#0b1b42] tracking-wide mb-0.5 group-hover:text-[#0052cc] transition-colors">{sube.subeAdi.toUpperCase()}</h3>
                <span className="text-[11.5px] font-semibold text-[#8a94a6]">Masraf: {sube.masrafKodu || "-"}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#0052cc] transition-colors" />
            </div>
          ))}
        </div>

        {subeler.length === 0 && (
          <div className="py-12 flex flex-col items-center text-center mx-auto max-w-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-[#0b1b42] font-black text-lg mb-2">Kayıtlı Şube Yok</h3>
            <p className="text-gray-500 font-medium text-sm">Şu an sisteme kayıtlı bir şubeniz bulunmamaktadır. Lütfen önce "Yeni Şube Ekle" sayfasından şube kaydı oluşturun.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DETAIL COMPONENT
// -------------------------------------------------------------

function SubeDetail({ sube, onBack }: { sube: any; onBack: () => void }) {
  
  // Custom Helper for Info Rows
  const InfoRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-start gap-4 p-4 hover:bg-[#f4f5f8]/50 rounded-2xl transition-colors group">
      <div className="w-10 h-10 rounded-[0.85rem] bg-gray-50 flex items-center justify-center shrink-0 transition-colors group-hover:bg-white group-hover:shadow-[0_2px_10px_0_rgba(0,0,0,0.04)]">
        <Icon className="w-4 h-4 text-[#8a94a6] group-hover:text-[#0052cc] transition-colors" />
      </div>
      <div className="flex flex-col justify-center mt-0.5">
        <span className="text-[10px] font-extrabold text-[#8a94a6] tracking-[0.1em] uppercase mb-1">{label}</span>
        <span className="text-[14px] font-black text-[#172b4d] tracking-tight">{value || "-"}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full pb-10 max-w-5xl mx-auto font-sans">
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[#0052cc] hover:text-blue-800 font-bold text-[14px] px-2 py-1 transition-colors w-max group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Şube Listesine Dön
      </button>

      {/* Hero Banner */}
      <div className="bg-[#1e2540] rounded-[2rem] p-10 py-12 relative overflow-hidden flex flex-col justify-center min-h-[220px] shadow-lg border border-indigo-900/50">
        <div className="z-10 flex flex-col gap-4">
          <div className="w-max px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-white/80" />
            <span className="text-[11px] font-extrabold text-white tracking-widest uppercase shadow-sm">
              MASRAF NO: {sube.masrafKodu || "-"}
            </span>
          </div>
          <h1 className="text-white text-[32px] font-[900] tracking-tight drop-shadow-sm uppercase">
            {sube.subeAdi}
          </h1>
          <p className="text-indigo-100/80 font-medium text-[13.5px] max-w-2xl leading-relaxed">
            Bu ekranda {sube.subeAdi}'nin sisteme kayıtlı tüm idari ve iletişim bilgilerini görüntüleyebilirsiniz.
          </p>
        </div>
        <Building2 className="absolute -right-8 top-1/2 -translate-y-1/2 w-[240px] h-[240px] text-white/[0.03]" />
      </div>

      <div className="w-full flex flex-col md:flex-row gap-6 mt-4">
        {/* Left Column (Kurumsal & Resmi) */}
        <div className="flex-1 flex flex-col gap-6">
          <DetailCard title="Kurumsal Bilgiler" icon={Building2} iconColor="text-[#0052cc]">
            <InfoRow icon={Building2} label="BAĞLI OLDUĞU ANA FİRMA" value={sube.anaSube} />
            <InfoRow icon={CalendarDays} label="AÇILIŞ TARİHİ" value={sube.acilisTarihi} />
            <InfoRow icon={Hash} label="ŞUBE TÜRÜ" value={sube.subeTuru} />
            <InfoRow icon={Hash} label="HİZMET SEKTÖRÜ" value={sube.hizmetSektoru} />
            <InfoRow icon={Users} label="ÇALIŞAN SAYISI" value={sube.calisanSayisi} />
          </DetailCard>

          <DetailCard title="Resmi Bilgiler" icon={FileText} iconColor="text-[#0052cc]">
            <InfoRow icon={Hash} label="VERGİ KİMLİK NUMARASI (VKN)" value={sube.vergiKno} />
            <InfoRow icon={Building2} label="VERGİ DAİRESİ" value={sube.vergiDairesi} />
            <InfoRow icon={FileText} label="SGK İŞYERİ SİCİL NO" value={sube.sgkNo} />
          </DetailCard>
        </div>

        {/* Right Column (Yetkili & İletişim) */}
        <div className="flex-1 flex flex-col gap-6">
          <DetailCard title="Şube Yetkilisi Bilgileri" icon={User} iconColor="text-[#10b981]">
            <InfoRow icon={User} label="ŞUBE YETKİLİSİ" value={sube.subeYetkilisi} />
            <InfoRow icon={FileText} label="TC KİMLİK NUMARASI" value="Bilinmiyor" />
            <InfoRow icon={Phone} label="YETKİLİ TELEFONU" value={sube.telefon} />
            <InfoRow icon={Mail} label="YETKİLİ E-POSTA" value={sube.ePosta} />
          </DetailCard>

          <DetailCard title="Şube İletişim Bilgileri" icon={Phone} iconColor="text-[#0052cc]">
            <InfoRow icon={Phone} label="TELEFON NUMARASI" value={sube.telefon} />
            <InfoRow icon={Mail} label="E-POSTA ADRESİ" value={sube.ePosta} />
            <InfoRow icon={Globe} label="WEB SİTESİ" value={sube.webSitesi} />
            <div className="w-full flex items-center px-4 py-3 gap-2 mt-2">
               <MapPin className="w-[18px] h-[18px] text-[#ef5a28] stroke-[2.5]" />
               <span className="text-[13.5px] font-black text-[#0b1b42]">Adres Bilgileri</span>
            </div>
            <div className="bg-[#f4f5f8]/50 rounded-2xl mx-1 flex flex-col border border-gray-100/50 mt-1 mb-2">
               <InfoRow icon={Map} label="İL / İLÇE / MAHALLE" value={`${sube.il || ""} / ${sube.ilce || ""} / ${sube.mahalle || ""}`} />
               <InfoRow icon={MapPin} label="AÇIK ADRES" value={sube.adres || ""} />
               <InfoRow icon={Hash} label="POSTA KODU" value={sube.postaKodu || ""} />
            </div>
          </DetailCard>
        </div>
      </div>
    </div>
  );
}

// Subcomponent for standard layout block
function DetailCard({ title, icon: Icon, iconColor, children }: { title: string, icon: any, iconColor: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5 px-3 py-1.5">
        <Icon className={`w-5 h-5 ${iconColor} stroke-[2.5]`} />
        <h3 className="text-[16px] font-black tracking-tight text-[#0b1b42]">{title}</h3>
      </div>
      <div className="bg-white rounded-[1.75rem] p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
}