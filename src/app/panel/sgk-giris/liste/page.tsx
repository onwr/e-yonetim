"use client";
import { Clock, CheckCircle2, AlertTriangle, Search, ChevronLeft, ChevronRight, FileText, UserSquare2, Briefcase, FileBadge2, Calendar, MoreVertical, Building2, HardHat, FileSignature, Wallet, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TalepDetayModal from "../components/TalepDetayModal";
import { ApiErrorBanner, ApiLoadingText } from "@/components/common/ApiStatus";
import { fetchJsonWithError, getApiErrorMessage } from "@/lib/fetchJsonWithError";

export default function Page() {
  const router = useRouter();
  const [talepler, setTalepler] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [firma, setFirma] = useState("");
  
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTalep, setSelectedTalep] = useState<any>(null);
  const [modalInitialTab, setModalInitialTab] = useState("Özlük Bilgileri");

  useEffect(() => {
    void (async () => {
      try {
        setErrorMsg("");
        const data = await fetchJsonWithError<any[]>(
          "/api/v1/talepler?page=1&pageSize=500&type=sgk-giris",
        );
        if (!Array.isArray(data)) {
          setErrorMsg("SGK giris talepleri formati gecersiz.");
          return;
        }
        setTalepler(data);
      } catch (e) {
        setErrorMsg(getApiErrorMessage(e, "SGK giris talepleri cekilirken baglanti hatasi olustu."));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const bekleyenTalepler = talepler.filter(t => t.type === "sgk-giris" && t.durum === "BEKLEYEN");
  const onaylananTalepler = talepler.filter(t => t.type === "sgk-giris" && t.durum === "ONAYLANAN");
  const reddedilenTalepler = talepler.filter(t => t.type === "sgk-giris" && t.durum === "REDDEDİLEN");

  const getActiveData = () => {
    switch(activeTab) {
      case "1": return bekleyenTalepler;
      case "2": return onaylananTalepler;
      case "3": return reddedilenTalepler;
      default: return [];
    }
  };

  const currentData = getActiveData().filter(item => {
    if (firma && item.sirket !== firma) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      if (!item.adSoyad?.toLowerCase().includes(q) && !item.tckn?.includes(q)) return false;
    }
    return true;
  });

  const TabButton = ({ id, label, icon: Icon, count, isActive }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2.5 px-6 py-3.5 transition-all relative shrink-0 rounded-t-xl overflow-hidden group border-x border-t ${
        isActive 
          ? "bg-[#ef5a28] text-white border-transparent z-10" 
          : "bg-gray-50 text-[#6b778c] hover:bg-gray-100 hover:text-[#172b4d] border-gray-200"
      }`}
    >
      <Icon className={`w-[18px] h-[18px] stroke-[2.5] ${!isActive && "text-gray-400 group-hover:text-gray-600"} transition-colors`} />
      <span className="text-[14px] font-extrabold tracking-wide">{label}</span>
      <span className={`ml-2 text-[12px] font-extrabold px-2.5 py-0.5 rounded-lg min-w-[26px] text-center ${
        isActive ? "bg-white/20 text-white" : "bg-gray-200 text-[#172b4d]"
      }`}>
        {count}
      </span>
    </button>
  );

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-3xl animate-fade-in p-6 lg:p-10 shadow-sm border border-gray-100">
      <ApiErrorBanner message={errorMsg} className="mb-4" />
      <style dangerouslySetInnerHTML={{__html: `
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}} />

      <TalepDetayModal 
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        talep={selectedTalep}
        initialTab={modalInitialTab}
      />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-1.5">
        <h1 className="text-[26px] font-extrabold text-[#172b4d] tracking-tight">SGK Giriş Taleplerim</h1>
        <p className="text-[14px] text-gray-500 font-medium">Oluşturduğunuz SGK giriş taleplerini buradan takip edebilirsiniz.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-end border-b-2 border-[#ef5a28] overflow-x-auto custom-scrollbar">
        <TabButton id="1" label="Bekleyen Talepler" icon={Clock} count={bekleyenTalepler.length} isActive={activeTab === "1"} />
        <TabButton id="2" label="Onaylanan Talepler" icon={CheckCircle2} count={onaylananTalepler.length} isActive={activeTab === "2"} />
        <TabButton id="3" label="Reddedilen Talepler" icon={AlertTriangle} count={reddedilenTalepler.length} isActive={activeTab === "3"} />
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mt-6 mb-5 items-start">
        {/* Firma Filtresi */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-extrabold text-[#172b4d] tracking-widest uppercase">Firma</label>
          <div className="flex gap-2">
            <select 
              className="bg-white border border-gray-200 text-gray-700 text-[13px] rounded-xl px-4 py-2.5 outline-none focus:border-[#ef5a28] focus:ring-2 focus:ring-[#ef5a28]/10 transition-all font-semibold shadow-sm min-w-[260px] cursor-pointer"
              value={firma}
              onChange={(e) => setFirma(e.target.value)}
            >
              <option value="">Tüm Firmalar</option>
              {Array.from(new Set(talepler.filter((t: any) => t.type === "sgk-giris").map((t: any) => t.sirket))).filter(Boolean).map((s: any) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Arama - sağa hizalı */}
        <div className="flex gap-2 lg:ml-auto items-end">
          <div className="relative">
            <Search className="w-[16px] h-[16px] text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
            <input 
              type="text" 
              placeholder="Ad Soyad, TCKN veya Personel Sicil No ile hızlı personel ara" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 placeholder-gray-400 text-[13px] rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-[#ef5a28] focus:ring-2 focus:ring-[#ef5a28]/10 transition-all font-semibold shadow-sm w-[400px]"
            />
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-[13px]">
          <span className="font-extrabold text-[#172b4d]">
            Toplam <span className="text-[#ef5a28] text-[15px]">{currentData.length}</span> Kayıt
          </span>
          <div className="w-px h-5 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-500">Sayfa Başına</span>
            <select className="bg-white border border-gray-200 text-center text-[13px] font-extrabold text-[#172b4d] rounded-lg px-2 py-1 outline-none">
              <option>10</option><option>20</option><option>50</option>
            </select>
            <span className="font-semibold text-gray-500">Kişi Göster</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#ef5a28] text-white font-extrabold text-[13px]">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 ml-2">
            <input type="text" defaultValue="1" className="w-9 text-center border border-gray-200 rounded-lg text-[13px] font-extrabold py-1 outline-none text-[#172b4d]" />
            <button className="bg-[#8c9bab] hover:bg-[#6b778c] text-white px-3.5 py-1.5 font-bold text-[12px] rounded-lg transition-colors">Git</button>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="hidden lg:flex w-full bg-[#ef5a28] rounded-xl rounded-b-none py-3.5 px-6 items-center text-white text-[12px] font-extrabold tracking-wider mt-2 border-b-2 border-[#d94a1c]">
        <div className="w-12 text-center shrink-0">#</div>
        <div className="w-[35%] pl-4 border-l border-white/20">PERSONEL KİMLİK BİLGİLERİ</div>
        <div className="flex-1 pl-4 border-l border-white/20">FİRMA, KADRO VE İŞE GİRİŞ BİLGİLERİ</div>
        <div className="w-32 text-center border-l border-white/20 shrink-0">İŞLEM MENÜ</div>
      </div>

      {/* Table Body */}
      <div className="w-full flex flex-col gap-3 pt-3 pb-3">
        {isLoading ? <ApiLoadingText message="Talepler yukleniyor..." className="py-12 flex items-center justify-center" /> : null}
        {currentData.length > 0 ? (
          currentData.map((item, index) => (
            <div key={item.id} className="w-full flex items-stretch flex-col lg:flex-row rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
              <div className="w-full lg:w-12 py-3 lg:py-0 shrink-0 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 lg:bg-white text-center">
                <span className="text-[15px] font-bold text-gray-400">#{index + 1}</span>
              </div>
              
              {/* Left Column */}
              <div className="w-full lg:w-[35%] p-6 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center shadow-sm mb-4">
                    <UserCircle2 className="w-12 h-12 text-gray-300 stroke-[1.5]" />
                  </div>
                  <h3 className="text-[16px] font-black text-[#172b4d] uppercase tracking-wide text-center leading-tight">
                    {item.adSoyad}
                  </h3>
                </div>
                
                <div className="flex flex-col gap-2 mb-8">
                  <div className="grid grid-cols-[100px_10px_1fr] text-[13px]">
                    <span className="font-semibold text-gray-500">Uyruğu</span>
                    <span className="font-semibold text-gray-500">:</span>
                    <span className="font-extrabold text-[#172b4d]">{item.uyruk || "TÜRKİYE CUMHURİYETİ"}</span>
                  </div>
                  <div className="grid grid-cols-[100px_10px_1fr] text-[13px]">
                    <span className="font-semibold text-gray-500">TCKN</span>
                    <span className="font-semibold text-gray-500">:</span>
                    <span className="font-extrabold text-[#172b4d]">{item.tckn}</span>
                  </div>
                  <div className="grid grid-cols-[100px_10px_1fr] text-[13px]">
                    <span className="font-semibold text-gray-500">Doğum Tarihi</span>
                    <span className="font-semibold text-gray-500">:</span>
                    <span className="font-extrabold text-[#172b4d]">{item.dogumTarihi || "Belirtilmedi"}</span>
                  </div>
                  <div className="grid grid-cols-[100px_10px_1fr] text-[13px]">
                    <span className="font-semibold text-gray-500">Cinsiyeti</span>
                    <span className="font-semibold text-gray-500">:</span>
                    <span className="font-extrabold text-[#172b4d]">{item.cinsiyet || "Belirtilmedi"}</span>
                  </div>
                  <div className="grid grid-cols-[100px_10px_1fr] text-[13px]">
                    <span className="font-semibold text-gray-500">Engel Durumu</span>
                    <span className="font-semibold text-gray-500">:</span>
                    <span className="font-extrabold text-[#172b4d]">{item.engelDurumu || "Engelsiz"}</span>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-2">
                  <button 
                    onClick={() => router.push(`/panel/personel/${item.id || 1}`)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-300 bg-white text-[#172b4d] font-bold text-[13px] hover:bg-gray-50 transition-colors"
                  >
                    <UserSquare2 className="w-4 h-4" /> Personel Kartı
                  </button>
                  <button 
                    onClick={() => router.push(`/panel/personel/${item.id || 1}?tab=evraklar`)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-300 bg-white text-[#172b4d] font-bold text-[13px] hover:bg-gray-50 transition-colors"
                  >
                    <FileBadge2 className="w-4 h-4" /> Özlük Evrakları
                  </button>
                  <button 
                    onClick={() => router.push('/panel/puantaj')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#172b4d] hover:bg-[#0a1a3a] text-white font-bold text-[13px] transition-colors shadow-md"
                  >
                    <Calendar className="w-4 h-4" /> Puantajına Bak
                  </button>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex-1 p-6 flex flex-col bg-white">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#172b4d]" />
                    <h2 className="text-[17px] font-black text-[#172b4d]">Firma ve Kadro Bilgileri</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.durum === "ONAYLANAN" && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide">Onaylandı</span>
                    )}
                    {item.durum === "BEKLEYEN" && (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide">Beklemede</span>
                    )}
                    {item.durum === "REDDEDİLEN" && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide">Reddedildi</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-[13px] mb-8">
                  {/* Sol Kadro Listesi */}
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-[110px_10px_1fr]">
                      <span className="font-semibold text-gray-500">Firma Ünvanı</span>
                      <span className="font-semibold text-gray-500">:</span>
                      <span className="font-black text-[#172b4d]">{item.sirket || "İNNOAPP"}</span>
                    </div>
                    <div className="grid grid-cols-[110px_10px_1fr]">
                      <span className="font-semibold text-gray-500">Şube</span>
                      <span className="font-semibold text-gray-500">:</span>
                      <span className="font-extrabold text-[#172b4d]">{item.sube || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[110px_10px_1fr]">
                      <span className="font-semibold text-gray-500">Birim</span>
                      <span className="font-semibold text-gray-500">:</span>
                      <span className="font-extrabold text-[#172b4d]">{item.birim || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[110px_10px_1fr]">
                      <span className="font-semibold text-gray-500">Kadro Statüsü</span>
                      <span className="font-semibold text-gray-500">:</span>
                      <span className="font-extrabold text-[#172b4d]">{item.kadroStatusu || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[110px_10px_1fr]">
                      <span className="font-semibold text-gray-500">İşe Giriş Tarihi</span>
                      <span className="font-semibold text-gray-500">:</span>
                      <span className="font-extrabold text-[#172b4d]">{item.iseGirisTarihi || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[110px_10px_1fr]">
                      <span className="font-semibold text-gray-500">Brüt Maaş</span>
                      <span className="font-semibold text-gray-500">:</span>
                      <span className="font-extrabold text-[#172b4d]">{item.brutMaas || "-"}</span>
                    </div>
                  </div>
                  {/* Sağ Kadro Listesi */}
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-[110px_10px_1fr]">
                      <span className="font-semibold text-gray-500">Departman</span>
                      <span className="font-semibold text-gray-500">:</span>
                      <span className="font-extrabold text-[#172b4d]">{item.departman || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[110px_10px_1fr]">
                      <span className="font-semibold text-gray-500">Görevi / Ünvanı</span>
                      <span className="font-semibold text-gray-500">:</span>
                      <span className="font-extrabold text-[#172b4d]">{item.unvan || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[110px_10px_1fr]">
                      <span className="font-semibold text-gray-500">SGK Statüsü</span>
                      <span className="font-semibold text-gray-500">:</span>
                      <span className="font-black text-[#172b4d]">{item.sgkStatusu || "Emekli"}</span>
                    </div>
                    <div className="grid grid-cols-[110px_10px_1fr]">
                      <span className="font-semibold text-gray-500">NET Maaş</span>
                      <span className="font-semibold text-gray-500">:</span>
                      <span className="font-extrabold text-[#172b4d]">{item.netMaas || "-"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t-2 border-[#ef5a28]/20 flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setSelectedTalep(item);
                        setModalInitialTab("Evraklar");
                        setDetailModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#172b4d]/20 hover:bg-gray-50 text-[#172b4d] rounded-full text-[12.5px] font-extrabold transition-colors"
                    >
                      <FileSignature className="w-4 h-4" /> Belge & Evraklar
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedTalep(item);
                        setModalInitialTab("Özlük Bilgileri");
                        setDetailModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#172b4d]/20 hover:bg-gray-50 text-[#172b4d] rounded-full text-[12.5px] font-extrabold transition-colors"
                    >
                      <Search className="w-4 h-4" /> Tüm Detaylar
                    </button>
                  </div>
                  
                  {item.durum !== "BEKLEYEN" && (
                    <div className="flex flex-col items-end gap-1 text-[11px] text-gray-500">
                      <div><span className="font-semibold">Onay Tarihi:</span> <span className="font-extrabold text-[#172b4d]">{item.tarih}</span></div>
                      <div><span className="font-semibold">Onaylayan Yetkili:</span> <span className="font-extrabold text-[#172b4d]">{item.yetkiliEmail || "kargalioglueren@gmail.com"}</span></div>
                    </div>
                  )}
                </div>
              </div>

              {/* İşlem Menü Column */}
              <div className="w-full lg:w-32 py-4 lg:py-0 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 flex items-center justify-center bg-gray-50/50">
                 <button
                   onClick={() => {
                     router.push(`/panel/personel/1?tckn=${item.tckn}`);
                   }}
                   className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white hover:shadow-sm text-gray-500 transition-all cursor-pointer"
                   title="Personel Bilgisine Git"
                 >
                    <MoreVertical className="w-5 h-5" />
                 </button>
              </div>

            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400 stroke-[1.5]" />
            </div>
            <p className="text-[14px] font-bold text-gray-500">Aktif talep yok.</p>
          </div>
        )}
      </div>
    </div>
  );
}