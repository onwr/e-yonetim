"use client";
import { Clock, CheckCircle2, AlertTriangle, FileText, Activity, UserPlus, UserMinus, Eye, Search, User, Shield, Building2, Folder, Calendar } from "lucide-react";
import DataGridTemplate from "@/components/dashboard/DataGridTemplate";
import { useState, useEffect, useRef } from "react";
import IseGirisTalebiDokumuModal from "@/components/personel/Modals/IseGirisTalebiDokumuModal";
import SgkCikisTalebiModal from "@/components/personel/Modals/SgkCikisTalebiModal";
import { useNotifications } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import { ApiErrorBanner, ApiLoadingText } from "@/components/common/ApiStatus";
import { fetchJsonWithError, getApiErrorMessage } from "@/lib/fetchJsonWithError";

const MODULE_CONFIGS = {
  "sgk-giris": { title: "SGK Giriş Talepleri", icon: UserPlus, desc: "Firmanız bünyesindeki personel bildirim taleplerinizi buradan yönetebilirsiniz. Tüm resmi giriş süreçlerini ve onay durumlarını takip edin.", activeTitle: "SGK GİRİŞ" },
  "sgk-cikis": { title: "SGK Çıkış Talepleri", icon: UserMinus, desc: "İşten ayrılma süreçleri ve SGK çıkış bildirgelerinin operasyonel yönetimini bu ekrandan gerçekleştirebilirsiniz.", activeTitle: "SGK ÇIKIŞ" },
  "is-kazasi": { title: "İş Kazası Bildirimleri", icon: Activity, desc: "Kurum içi kaza ve olay raporlamalarını yasal sürelere uygun şekilde bu ekrandan e-Devlet sistemine bildirebilirsiniz.", activeTitle: "İŞ KAZASI" },
  "sicil": { title: "Sicil Güncelleme İşlemleri", icon: FileText, desc: "Mevcut personellerin adres, unvan, bordro veya medeni hal gibi resmi sicil değişikliklerini buradan yönetebilirsiniz.", activeTitle: "SİCİL İŞLEMLERİ" },
};
export default function Page() {
  const router = useRouter();
  const [talepler, setTalepler] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState("1");
  const [activeModule, setActiveModule] = useState<keyof typeof MODULE_CONFIGS>("sgk-giris");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTalep, setSelectedTalep] = useState<any | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setErrorMsg("");
        const data = await fetchJsonWithError<any[]>("/api/v1/talepler?page=1&pageSize=500");
        if (!Array.isArray(data)) {
          setErrorMsg("Talepler formati gecersiz.");
          return;
        }
        setTalepler(data);
      } catch (e) {
        setErrorMsg(getApiErrorMessage(e, "Talepler cekilirken baglanti hatasi olustu."));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Track previously seen talep IDs so we can detect genuinely new talepler
  const seenIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    talepler.forEach((t: any) => {
      if (t.durum === "BEKLEYEN" && !seenIds.current.has(t.id)) {
        if (seenIds.current.size > 0) {
          // Only fire notification after the initial load
          const isGiris = t.type === "sgk-giris";
          addNotification({
            type: isGiris ? "sgk-giris" : "sgk-cikis",
            title: isGiris ? "Yeni SGK Giriş Talebi" : "Yeni SGK Çıkış Talebi",
            message: `${t.adSoyad} için yeni bir ${isGiris ? "giriş" : "çıkış"} talebi onay bekliyor.`,
            href: isGiris ? "/panel/gelen-talepler/sgk-giris" : "/panel/gelen-talepler/sgk-cikis",
          });
        }
        seenIds.current.add(t.id);
      }
    });
  }, [talepler, addNotification]);

  const handleAction = async (id: string, newStatus: string) => {
    const targetTalep = talepler.find((t: any) => t.id === id);
    try {
      await fetchJsonWithError(`/api/v1/talepler/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      setErrorMsg(getApiErrorMessage(e, "Talep durumu guncellenemedi."));
      return;
    }
    setTalepler((prev: any) => prev.map((item: any) => (item.id === id ? { ...item, durum: newStatus } : item)));

    // Emit notification for approve/reject
    if (targetTalep) {
      const isGiris = targetTalep.type === "sgk-giris";
      if (newStatus === "ONAYLANAN") {
        addNotification({
          type: "onay",
          title: isGiris ? "SGK Giriş Talebi Onaylandı" : "SGK Çıkış Talebi Onaylandı",
          message: `${targetTalep.adSoyad} adlı kişinin talebi onaylandı.`,
          href: isGiris ? "/panel/gelen-talepler/sgk-giris" : "/panel/gelen-talepler/sgk-cikis",
        });
      } else if (newStatus === "REDDEDİLEN") {
        addNotification({
          type: "red",
          title: isGiris ? "SGK Giriş Talebi Reddedildi" : "SGK Çıkış Talebi Reddedildi",
          message: `${targetTalep.adSoyad} adlı kişinin talebi reddedildi.`,
          href: isGiris ? "/panel/gelen-talepler/sgk-giris" : "/panel/gelen-talepler/sgk-cikis",
        });
      }
    }

    // SGK giriş onayında personel sicil aktarımı sunucuda (talepler/updateTalepStatus) yapılır.
  };

  const moduleData = talepler.filter(item => item.type === activeModule);
  const filteredData = moduleData.filter((item) => {
    if (activeTab === "1" && item.durum !== "BEKLEYEN") return false;
    if (activeTab === "2" && item.durum !== "ONAYLANAN") return false;
    if (activeTab === "3" && item.durum !== "REDDEDİLEN") return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      if (!item.adSoyad?.toLowerCase().includes(q) && 
          !item.tckn?.includes(q) && 
          !item.id?.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });
  const handleExport = () => {
    let headers = "";
    let rows = "";
    if (activeModule === "is-kazasi") {
      headers = "SIRA,AD SOYAD,TC KIMLIK,KAZA TÜRÜ,KAZA TARİHİ,OLAY YERİ,RAPOR DURUMU,DURUM,BİLDİRİM TARİHİ\n";
      rows = filteredData.map((d, i) => `${i+1},${d.adSoyad},${d.tckn},${d.kazaTuru},${d.kazaTarihi},${d.olayYeri},${d.raporDurumu},${d.durum},${d.tarih}`).join("\n");
    } else {
      headers = "SIRA,AD SOYAD,TC KIMLIK,ŞİRKET,ŞUBE,DEPARTMAN,UNVAN,DURUM,TARİH\n";
      rows = filteredData.map((d, i) => `${i+1},${d.adSoyad},${d.tckn},${d.sirket},${d.sube},${d.departman},${d.unvan},${d.durum},${d.tarih}`).join("\n");
    }
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `${MODULE_CONFIGS[activeModule].title}_Raporu.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const getStatusBadge = (durum: string) => {
    switch (durum) {
      case "BEKLEYEN": return <span className="bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm"><Clock className="w-3 h-3 stroke-[2.5]" /> ONAY BEKLİYOR</span>;
      case "ONAYLANAN": return <span className="bg-green-50 border border-green-200 text-green-600 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm"><CheckCircle2 className="w-3 h-3 stroke-[2.5]" /> ONAYLANDI</span>;
      case "REDDEDİLEN": return <span className="bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm"><AlertTriangle className="w-3 h-3 stroke-[2.5]" /> REDDEDİLDİ</span>;
      default: return null;
    }
  };
  const TableHeader = (
    <div className="bg-[#172b4d] rounded-xl p-4 flex items-center text-white text-[11.5px] font-extrabold tracking-wider uppercase shadow-md mb-2 transition-all">
      <div className="w-16 shrink-0 pl-4 text-center">SIRA</div>
      <div className="w-[30%] pl-4">PERSONEL & KİMLİK VERİLERİ</div>
      <div className="w-[45%] pl-4">FİRMA, KADRO VE İSTİHDAM DETAYLARI</div>
      <div className="flex-1 text-center pr-6">İŞLEM VE KONTROL</div>
    </div>
  );
  const TableBody = (
    <div className="flex flex-col gap-3">
      {filteredData.length > 0 ? (
        filteredData.map((item, index) => (
          <div key={item.id} className="bg-white border border-gray-200/80 rounded-[1rem] flex items-stretch shadow-sm hover:shadow-lg hover:border-[#172b4d]/20 transition-all group duration-300 overflow-hidden">
            <div className="w-[60px] shrink-0 flex flex-col justify-center items-center bg-transparent group-hover:bg-[#172b4d] transition-colors duration-300 border-r border-gray-100 group-hover:border-transparent">
              <span className="text-[15px] font-black text-[#172b4d] group-hover:text-white transition-colors duration-300">{index + 1}</span>
            </div>
            
            <div className="w-[30%] py-5 pl-5 flex items-center gap-4">
              <div className="w-[60px] h-[60px] rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 relative">
                <User className="w-6 h-6" />
                {item.adSoyad ? <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"><Shield className="w-3.5 h-3.5 text-blue-500" /></div> : null}
              </div>
              <div className="flex flex-col">
                <span className="text-[14.5px] font-black text-[#172b4d] mb-2">{item.adSoyad}</span>
                <div className="grid grid-cols-[45px_1fr] gap-x-2 gap-y-1 text-[11px] font-bold items-center">
                  <span className="text-gray-400 tracking-wider">TCKN</span>
                  <span className="text-[#172b4d]">: {item.tckn}</span>
                  <span className="text-gray-400 tracking-wider">DOĞUM</span>
                  <span className="text-[#172b4d]">: {item.formBilgileri?.dogumTarihi || '-'}</span>
                </div>
                <button className="text-[9.5px] font-black text-[#ef5a28] mt-2.5 text-left flex items-center gap-1.5 hover:underline decoration-[#ef5a28] underline-offset-2">
                  <CheckCircle2 className="w-3 h-3" />
                  PERSONEL SİCİL KARTINI GÖRÜNTÜLE
                </button>
              </div>
            </div>

            <div className="w-[45%] py-5 pl-4 flex flex-col justify-center border-l border-gray-100/50">
              <div className="text-[10px] font-extrabold text-gray-400 mb-1.5 uppercase tracking-wider">ÇALIŞTIĞI KURUM & FİRMA</div>
              <div className="bg-[#f4f5f7] rounded-lg px-3 py-2 flex items-center gap-2 mb-4 w-11/12 border border-gray-200/50">
                <div className="w-4 h-4 text-[#0052cc]"><Building2 className="w-full h-full" /></div>
                <span className="text-[12.5px] font-black text-[#172b4d]">{item.sirket}</span>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 pr-4">
                <div>
                  <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">ŞUBE / DEPARTMAN</div>
                  <div className="text-[11.5px] font-bold text-[#172b4d] flex items-center gap-1.5 mt-1">
                    <Folder className="w-3 h-3 text-gray-400" /> {item.sube} / {item.departman}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">İŞE GİRİŞ TARİHİ</div>
                  <div className="text-[11.5px] font-bold text-[#172b4d] flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3 h-3 text-[#ef5a28]" /> {item.formBilgileri?.iseBaslamaTarihi || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">GÖREV & ÜNVAN</div>
                  <div className="text-[11.5px] font-bold text-[#172b4d] mt-1 truncate">{item.unvan}</div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">ÜCRET BİLGİSİ (NET)</div>
                  <div className="text-[12px] font-black text-[#00875a] flex items-center gap-1.5 mt-1">
                    <span className="text-[#00875a] font-black">$</span> {item.formBilgileri?.netMaasi || 'BELİRTİLMEDİ'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center border-l border-gray-100 py-4 px-5 gap-3">
              <div className={`text-[10.5px] font-black px-4 py-1.5 rounded-[0.5rem] flex items-center gap-1.5 w-full justify-center flex-shrink-0 ${
                item.durum === 'BEKLEYEN' ? 'bg-orange-50 text-orange-600' :
                item.durum === 'ONAYLANAN' ? 'bg-[#e2f5ec] text-[#00875a]' :
                'bg-red-50 text-red-600'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {item.durum === 'BEKLEYEN' ? 'ONAY BEKLİYOR' : item.durum === 'ONAYLANAN' ? 'ONAYLANDI' : 'REDDEDİLDİ'}
              </div>
              
              {item.durum !== 'BEKLEYEN' && (
                <div className="w-full flex justify-between items-center text-[9px] font-extrabold px-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-400 tracking-wider">ONAY TARİHİ:</span>
                    <span className="text-gray-400 tracking-wider">YETKİLİ:</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[#172b4d]">{item.onayTarih || "-"}</span>
                    <span className="text-[#172b4d]">{item.onayYetkili || "-"}</span>
                  </div>
                </div>
              )}
              
              <div className="w-full mt-auto flex flex-col gap-2">
                {item.durum === 'BEKLEYEN' && (
                  <button onClick={() => handleAction(item.id, "ONAYLANAN")} className="w-full bg-[#172b4d] hover:bg-[#0052cc] text-white text-[11px] font-black py-2.5 rounded-[0.5rem] transition-colors shadow-sm">
                    TALEBİ ONAYLA
                  </button>
                )}
                <div className="flex items-center gap-2 w-full">
                  {item.durum === 'BEKLEYEN' && (
                    <button onClick={() => handleAction(item.id, "REDDEDİLEN")} className="bg-white border border-red-100 hover:bg-red-50 text-red-500 text-[11px] font-black px-3 py-2.5 rounded-[0.5rem] transition-colors shadow-sm">
                      REDDET
                    </button>
                  )}
                  <button onClick={() => setSelectedTalep(item)} className="flex-1 bg-[#f4f5f7] hover:bg-[#ebecf0] text-[#172b4d] text-[10.5px] font-black py-2.5 rounded-[0.4rem] transition-colors whitespace-nowrap">
                    AYRINTILI DÖKÜM
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="w-full flex justify-center py-8 pb-12 animate-fade-in-up">
          <div className="border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-[2rem] w-full p-20 flex flex-col items-center justify-center text-center transition-colors hover:border-gray-300 hover:bg-gray-50 group cursor-pointer">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300">
              <Search className="w-[34px] h-[34px] text-gray-300 stroke-[2] group-hover:text-blue-400 transition-colors" />
            </div>
            <h3 className="text-[15.5px] font-extrabold text-[#6b778c] tracking-widest mb-2.5">KAYIT BULUNAMADI</h3>
            <p className="text-[13.5px] text-gray-500 font-medium max-w-md mx-auto">Bu sekmede henüz listelenecek bir talep yok veya uyguladığınız arama kriterlerine uyan sonuç bulunamadı.</p>
          </div>
        </div>
      )}
    </div>
  );
  return (
    <>
      <ApiErrorBanner message={errorMsg} className="mb-4" />
      <DataGridTemplate
        title={MODULE_CONFIGS[activeModule].title}
        badge="RESMİ İŞLEMLER"
        icon={MODULE_CONFIGS[activeModule].icon}
        description={MODULE_CONFIGS[activeModule].desc}
        onCardClick={(id) => {
          if (id === "sgk-giris" || id === "sgk-cikis") {
            router.push(`/panel/gelen-talepler/${id}`);
          } else {
            setActiveModule(id as keyof typeof MODULE_CONFIGS);
            setActiveTab("1"); 
          }
        }}
        onExport={handleExport}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        totalRecords={filteredData.length}
        topCards={[
        { id: "sgk-giris", title: "SGK GİRİŞ", value: talepler.filter(d => d.type === "sgk-giris" && d.durum === "BEKLEYEN").length, icon: UserPlus, isActive: activeModule === "sgk-giris" },
        { id: "sgk-cikis", title: "SGK ÇIKIŞ", value: talepler.filter(d => d.type === "sgk-cikis" && d.durum === "BEKLEYEN").length, icon: UserMinus, isActive: activeModule === "sgk-cikis" },
        { id: "is-kazasi", title: "İŞ KAZASI", value: talepler.filter(d => d.type === "is-kazasi" && d.durum === "BEKLEYEN").length, icon: Activity, isActive: activeModule === "is-kazasi" },
        { id: "sicil", title: "SİCİL İŞLEMLERİ", value: talepler.filter(d => d.type === "sicil" && d.durum === "BEKLEYEN").length, icon: FileText, isActive: activeModule === "sicil" }
      ]}
        tabs={[
          { id: "1", label: "BEKLEYEN TALEPLER", icon: Clock, count: moduleData.filter(d => d.durum === "BEKLEYEN").length },
          { id: "2", label: "ONAYLANANLAR", icon: CheckCircle2, count: moduleData.filter(d => d.durum === "ONAYLANAN").length },
          { id: "3", label: "REDDEDİLENLER", icon: AlertTriangle, count: moduleData.filter(d => d.durum === "REDDEDİLEN").length }
        ]}
        tableHeader={TableHeader}
        tableBody={TableBody}
      />
      {isLoading ? <ApiLoadingText message="Talepler yukleniyor..." className="py-6 text-center" /> : null}
      {selectedTalep && activeModule === 'sgk-giris' && (
        <IseGirisTalebiDokumuModal
          talep={selectedTalep}
          onClose={() => setSelectedTalep(null)}
          onApprove={(id) => handleAction(id, "ONAYLANAN")}
        />
      )}
      {selectedTalep && activeModule === 'sgk-cikis' && (
        <SgkCikisTalebiModal
          talep={selectedTalep}
          onClose={() => setSelectedTalep(null)}
          onApprove={(id) => handleAction(id, "ONAYLANAN")}
        />
      )}
    </>
  );
}
