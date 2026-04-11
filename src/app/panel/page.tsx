"use client";
import { useState, useEffect } from "react";
import { Users, Activity, AlertTriangle, Lock, CheckCircle2 } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { useRouter } from "next/navigation";
import { fetchJsonWithError } from "@/lib/fetchJsonWithError";
import { ApiLoadingText } from "@/components/common/ApiStatus";

function OnboardingScreen({ setupStep }: { setupStep: number }) {
  const router = useRouter();

  const steps = [
    {
      step: 1,
      title: "1. Firma Bilgileri ve Taahhütler",
      desc: "Evrakları yükle, sözleşmeleri onayla",
      href: "/panel/firma/bilgiler",
      active: true,
    },
    {
      step: 2,
      title: "2. Ana Kullanıcı Bilgileri",
      desc: "Kimlik belgeleri ve taahhütler",
      href: "/panel/isveren-yetkilileri/ana-kullanici-bilgileri",
      active: false,
      completed: setupStep > 1,
    },
  ];

  if (setupStep === 1) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-[13px] font-extrabold text-[#0052cc]">
          Kontrol Paneli <span className="text-gray-400 ml-1">/</span>
        </h1>
        <div className="w-full bg-[#fffbeb] border border-[#fcd34d] rounded-2xl p-10 flex flex-col items-center text-center gap-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#fef3c7] border border-[#fcd34d] flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-[#d97706]" />
          </div>
          <div className="flex flex-col gap-3 max-w-2xl">
            <h2 className="text-[22px] font-black text-[#92400e]">Ana Kullanıcı Bilgilerinizi Tamamlayınız</h2>
            <p className="text-[14px] font-medium text-[#b45309] leading-relaxed">
              Diğer panele erişebilmeniz için önce <strong>iletişim bilgilerinizi kaydedin</strong>, ardından <strong>tüm zorunlu sözleşmeleri</strong> okuyup onaylayın.
            </p>
            <p className="text-[12.5px] font-bold text-[#d97706] mt-2">
              2 adım: 1. Kimlik belgeleri yükle, iletişim bilgilerini kaydet - 2. Zorunlu sözleşmeleri onayla
            </p>
          </div>
          <button
            onClick={() => router.push("/panel/isveren-yetkilileri/ana-kullanici-bilgileri")}
            className="mt-4 bg-[#f59e0b] hover:bg-[#d97706] text-white font-extrabold text-[15px] px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none"
          >
            Ana Kullanıcı Bilgilerine Git
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[13px] font-extrabold text-[#0052cc]">
        Kontrol Paneli <span className="text-gray-400 ml-1">/</span>
      </h1>
      <div className="w-full bg-[#fffbeb] border border-[#fcd34d] rounded-2xl p-10 flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[#fef3c7] border border-[#fcd34d] flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-[#d97706]" />
        </div>
        <div className="flex flex-col gap-2 max-w-xl">
          <h2 className="text-[22px] font-black text-[#172b4d]">Firma Kurulumunuzu Tamamlayınız</h2>
          <p className="text-[13.5px] font-medium text-[#42526e] leading-relaxed">
            Sistemin <strong>Personel, Puantaj ve Şube</strong> gibi tüm temel özelliklerini kullanmaya başlayabilmeniz
            için yasal zorunluluk gereği aşağıdaki <strong>2 kurulum adımını</strong> sırasıyla tamamlamanız
            gerekmektedir. Kurulum bitene kadar diğer sayfalar <span className="text-red-500 font-bold">kilitli kalacaktır</span>.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl mt-2">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => s.active && router.push(s.href)}
              disabled={!s.active}
              className={`group relative flex flex-col items-center gap-3 p-7 rounded-2xl border-2 transition-all duration-200 text-center
                ${s.active
                  ? "bg-white border-[#f59e0b] hover:border-[#ef5a28] hover:shadow-lg hover:shadow-[#ef5a28]/10 hover:-translate-y-1 cursor-pointer"
                  : s.completed ? "bg-green-50 border-green-400 cursor-not-allowed" : "bg-white/60 border-gray-200 cursor-not-allowed opacity-70"
                }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-black transition-colors
                ${s.active
                  ? "bg-[#fef3c7] text-[#d97706] group-hover:bg-[#ef5a28] group-hover:text-white"
                  : s.completed ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {s.completed ? <CheckCircle2 className="w-5 h-5" /> : s.step}
              </div>
              {!s.active && !s.completed && (
                <div className="absolute top-3 right-3">
                  <Lock className="w-4 h-4 text-gray-300" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <span className={`text-[14px] font-extrabold transition-colors ${s.active ? "text-[#172b4d] group-hover:text-[#ef5a28]" : s.completed ? "text-green-700" : "text-gray-400"}`}>
                  {s.title}
                </span>
                <span className={`text-[12px] font-medium ${s.active ? "text-[#0052cc]" : s.completed ? "text-green-600" : "text-gray-400"}`}>
                  {s.completed ? "Tamamlandı" : s.desc}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type PersonelRow = {
  id: string;
  statu?: string;
  cinsiyet?: string;
  org?: string;
  createdAt?: string;
};

type SubeRow = {
  id: string;
  name: string;
  createdAt?: string;
};

export default function Dashboard() {
  const { isSetupComplete, setupStep } = useOnboarding();
  const [personeller, setPersoneller] = useState<PersonelRow[]>([]);
  const [subeler, setSubeler] = useState<SubeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSetupComplete) return;
    void (async () => {
      try {
        const [personelList, subeList] = await Promise.all([
          fetchJsonWithError<PersonelRow[]>("/api/v1/personel?page=1&pageSize=1000").catch(() => []),
          fetchJsonWithError<SubeRow[]>("/api/v1/subeler?page=1&pageSize=200").catch(() => []),
        ]);
        setPersoneller(Array.isArray(personelList) ? personelList : []);
        setSubeler(Array.isArray(subeList) ? subeList : []);
      } finally {
        setLoading(false);
      }
    })();
  }, [isSetupComplete]);

  if (!isSetupComplete) {
    return <OnboardingScreen setupStep={setupStep} />;
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const thisMonthStart = new Date(y, m, 1);

  const isKayitBuAy = (createdAt?: string) => {
    if (!createdAt) return false;
    const dt = new Date(createdAt);
    return !Number.isNaN(dt.getTime()) && dt >= thisMonthStart;
  };

  const totalPersonel = personeller.length;
  const aktifPersonel = personeller.filter((p) => p.statu === "Aktif").length;
  const pasifPersonel = personeller.filter((p) => p.statu === "Pasif").length;
  const kadinPersonel = personeller.filter((p) => p.cinsiyet === "Kadın").length;
  const erkekPersonel = personeller.filter((p) => p.cinsiyet === "Erkek").length;
  const aylikPersonelGirisi = personeller.filter((p) => isKayitBuAy(p.createdAt)).length;

  // Şube listesi: gerçek şubelerden türet, personelin org alanı ile eşleştir
  const subeGruplari = subeler.map((sube) => {
    const subePersoneller = personeller.filter((p) => p.org === sube.name);
    return {
      ad: sube.name,
      toplam: subePersoneller.length,
      aktif: subePersoneller.filter((p) => p.statu === "Aktif").length,
      giren: subePersoneller.filter((p) => isKayitBuAy(p.createdAt)).length,
    };
  });

  // Şubeye atanmamış personeller "Belirtilmemiş" altında göster
  const atalanmamisSayisi = personeller.filter(
    (p) => !p.org || !subeler.find((s) => s.name === p.org)
  ).length;
  if (atalanmamisSayisi > 0) {
    subeGruplari.push({
      ad: "Belirtilmemiş",
      toplam: atalanmamisSayisi,
      aktif: personeller.filter((p) => (!p.org || !subeler.find((s) => s.name === p.org)) && p.statu === "Aktif").length,
      giren: personeller.filter((p) => (!p.org || !subeler.find((s) => s.name === p.org)) && isKayitBuAy(p.createdAt)).length,
    });
  }

  const colors = ["#0052cc", "#ef5a28", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899"];

  return (
    <div className="flex flex-col gap-6 animate-slide-left w-full h-full pb-12">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInLeft {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-left { animation: slideInLeft 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
      `}} />
      <h1 className="text-[13px] font-extrabold text-[#0052cc]">
        Kontrol Paneli <span className="text-gray-400 ml-1">/</span>
      </h1>

      {loading ? (
        <ApiLoadingText message="Dashboard verileri yükleniyor..." className="py-16 text-center" />
      ) : (
        <>
          {/* Şube Özet Tablosu */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm w-full p-6 lg:p-8">
            <h2 className="text-[18px] font-extrabold text-[#172b4d] mb-1">Şube Özet Tablosu</h2>
            <p className="text-[13px] text-[#6b778c] font-medium mb-6">Gerçek veriler otomatik güncelleniyor.</p>
            <div className="overflow-x-auto w-full pb-4">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-[12px] font-semibold text-[#6b778c] pb-3 px-4 uppercase tracking-wide w-12">#</th>
                    <th className="text-[12px] font-semibold text-[#6b778c] pb-3 px-4 uppercase tracking-wide">Şube Adı</th>
                    <th className="text-[12px] font-semibold text-[#6b778c] pb-3 px-4 uppercase tracking-wide w-1/4">Toplam Personel</th>
                    <th className="text-[12px] font-semibold text-[#6b778c] pb-3 px-4 uppercase tracking-wide w-1/4">Giren (Ay)</th>
                    <th className="text-[12px] font-semibold text-[#6b778c] pb-3 px-4 uppercase tracking-wide w-1/4">Aktif</th>
                  </tr>
                </thead>
                <tbody>
                  {subeGruplari.map((sube, index) => (
                    <tr key={sube.ad} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4 text-[13.5px] font-bold text-gray-400">{index + 1}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                          <span className="text-[14px] font-bold text-[#172b4d]">{sube.ad}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[14px] font-black text-[#172b4d]">{sube.toplam}</td>
                      <td className="py-4 px-4 text-[14px] font-bold text-green-600">+{sube.giren}</td>
                      <td className="py-4 px-4 text-[14px] font-bold text-[#172b4d]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          {sube.aktif}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {subeGruplari.length === 0 && (
                    <tr><td colSpan={5} className="text-center pt-16 pb-12"><p className="text-[14px] text-gray-500 font-medium">Henüz şube kaydı yok.</p></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bar Grafik */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm w-full p-6 lg:p-8 min-h-[300px]">
            <h2 className="text-[14px] font-bold text-[#172b4d] mb-3">Şubelere Göre Personel Dağılımı</h2>
            <div className="text-[42px] font-black text-[#172b4d] leading-none mb-6">{totalPersonel}</div>
            <div className="w-full h-full flex items-center justify-center pt-8 pb-10">
              <div className="w-full h-[140px] flex items-end relative overflow-hidden">
                {subeGruplari.filter(s => s.toplam > 0).map((sube, i) => (
                  <div key={sube.ad} className="flex-1 mx-1.5 md:mx-3 rounded-t-md hover:opacity-80 transition-opacity cursor-pointer flex flex-col items-center justify-end relative group"
                    style={{ height: `${Math.max(totalPersonel > 0 ? (sube.toplam / totalPersonel) * 100 : 0, 10)}%`, backgroundColor: colors[i % colors.length] }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-900 text-white text-[11px] px-2 py-1 rounded shadow-lg whitespace-nowrap transition-opacity">{sube.ad}: {sube.toplam} Personel</div>
                    <span className="text-white font-bold text-[13px] mb-2">{sube.toplam}</span>
                  </div>
                ))}
                {subeGruplari.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center"><p className="text-[15px] font-bold text-[#172b4d]">Grafik Verisi Bekleniyor...</p></div>
                )}
              </div>
            </div>
          </div>

          {/* Alt Kartlar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* Şube Bazlı Progress */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm w-full p-6 lg:p-8 min-h-[340px] flex flex-col text-[#172b4d]">
              <h2 className="text-[14.5px] font-bold mb-6">Şube Bazlı Personel Sayıları</h2>
              <div className="flex flex-col gap-4">
                {subeGruplari.map((sube, i) => (
                  <div key={sube.ad} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[13px] font-semibold text-[#172b4d]"><span>{sube.ad}</span><span>{sube.toplam}</span></div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${totalPersonel > 0 ? (sube.toplam / totalPersonel) * 100 : 0}%`, backgroundColor: colors[i % colors.length] }}></div></div>
                  </div>
                ))}
                {subeGruplari.length === 0 && <p className="text-[13px] text-gray-400 font-medium pt-4">Şube verisi yok.</p>}
              </div>
            </div>

            {/* Aktif/Pasif Donut */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm w-full p-6 lg:p-8 min-h-[340px] flex flex-col text-[#172b4d]">
              <h2 className="text-[14.5px] font-bold mb-8">Aktif &amp; Pasif Personel Dağılımı</h2>
              <div className="flex-1 flex flex-col sm:flex-row items-center w-full">
                <div className="flex-1 flex justify-center relative">
                  <svg viewBox="0 0 36 36" className="w-36 h-36">
                    <path className="text-gray-100 stroke-current" strokeWidth="6" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path className="text-green-500 stroke-current" strokeWidth="6" strokeDasharray={`${totalPersonel > 0 ? Math.max((aktifPersonel / totalPersonel) * 100, 0) : 0}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path className="text-red-400 stroke-current" strokeWidth="6" strokeDasharray={`${totalPersonel > 0 ? Math.max((pasifPersonel / totalPersonel) * 100, 0) : 0}, 100`} strokeDashoffset={`-${totalPersonel > 0 ? Math.max((aktifPersonel / totalPersonel) * 100, 0) : 0}`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  </svg>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-4 pl-4 lg:pl-0">
                  <div><div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-green-500 rounded-[3px]"></div><span className="text-[13px] font-bold text-[#6b778c]">Aktif Personel</span></div><span className="text-[20px] font-black pl-5 leading-none mt-1">{aktifPersonel}</span></div>
                  <div><div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-red-400 rounded-[3px]"></div><span className="text-[13px] font-bold text-[#6b778c]">Pasif Personel</span></div><span className="text-[20px] font-black pl-5 leading-none mt-1">{pasifPersonel}</span></div>
                </div>
              </div>
            </div>

            {/* Aylık Giriş */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm w-full p-6 lg:p-8 min-h-[340px] flex flex-col text-[#172b4d]">
              <h2 className="text-[14.5px] font-bold mb-8">Aylık Personel Giriş ve Aktif Analizi</h2>
              <div className="flex-1 flex flex-col items-center justify-center gap-8">
                <div className="flex flex-col items-center gap-1 w-full bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2"><div className="w-10 h-10 rounded-xl bg-teal-100/50 flex items-center justify-center"><Activity className="w-5 h-5 text-teal-600" /></div></div>
                  <span className="text-[13px] font-bold text-[#42526e]">Aktif Personel Sayısı</span>
                  <span className="text-[32px] font-black leading-none mt-1">{aktifPersonel}</span>
                </div>
                <div className="flex flex-col items-center gap-1 w-full bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2"><div className="w-10 h-10 rounded-xl bg-indigo-100/50 flex items-center justify-center"><Users className="w-5 h-5 text-indigo-600" /></div></div>
                  <span className="text-[13px] font-bold text-[#42526e]">Aylık Personel Girişi</span>
                  <span className="text-[32px] font-black leading-none mt-1">+{aylikPersonelGirisi}</span>
                </div>
              </div>
            </div>

            {/* Cinsiyet Dağılımı */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm w-full p-6 lg:p-8 min-h-[340px] flex flex-col text-[#172b4d]">
              <h2 className="text-[14.5px] font-bold mb-8">Kadın &amp; Erkek Personel Oranları</h2>
              <div className="flex-1 flex flex-col justify-center gap-8 px-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center w-full"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-pink-500 rounded-[3px]"></div><span className="text-[14px] font-bold text-[#42526e]">Kadın Personel</span></div><span className="text-[20px] font-black">{kadinPersonel}</span></div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-pink-500 rounded-full transition-all duration-700" style={{ width: `${totalPersonel > 0 ? (kadinPersonel / totalPersonel) * 100 : 0}%` }}></div></div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center w-full"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#0052cc] rounded-[3px]"></div><span className="text-[14px] font-bold text-[#42526e]">Erkek Personel</span></div><span className="text-[20px] font-black">{erkekPersonel}</span></div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#0052cc] rounded-full transition-all duration-700" style={{ width: `${totalPersonel > 0 ? (erkekPersonel / totalPersonel) * 100 : 0}%` }}></div></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}