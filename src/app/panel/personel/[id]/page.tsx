"use client";
import { useEffect, useState, useRef, ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { KimlikVeTemelBilgilerModal } from "@/components/personel/Modals/KimlikVeTemelBilgilerModal";
import { KurumVeKadroBilgileriModal } from "@/components/personel/Modals/KurumVeKadroBilgileriModal";
import { SgkVeStatuModal } from "@/components/personel/Modals/SgkVeStatuModal";
import { UcretVeYanHakBilgileriModal } from "@/components/personel/Modals/UcretVeYanHakBilgileriModal";
import SaglikDurumuModal from "@/components/personel/Modals/SaglikDurumuModal";
import AskerlikDurumuModal from "@/components/personel/Modals/AskerlikDurumuModal";
import MykMeslekiYeterlilikModal from "@/components/personel/Modals/MykMeslekiYeterlilikModal";
import ErisimVeYetkiModal from "@/components/personel/Modals/ErisimVeYetkiModal";
import YasalDurumVeAdliSicilModal from "@/components/personel/Modals/YasalDurumVeAdliSicilModal";
import EgitimVeMeslekiBilgilerModal from "@/components/personel/Modals/EgitimVeMeslekiBilgilerModal";
import IseGirisSaglikMuayenesiModal from "@/components/personel/Modals/IseGirisSaglikMuayenesiModal";
import IsgEgitimBilgileriModal from "@/components/personel/Modals/IsgEgitimBilgileriModal";
import { ZimmetModal } from "@/components/personel/Modals/ZimmetModal";
import { EvrakModal } from "@/components/personel/Modals/EvrakModal";
import { Zimmet, Evrak } from "@/types";
import { ApiErrorBanner, ApiLoadingText } from "@/components/common/ApiStatus";
import { fetchJsonWithError, getApiErrorMessage } from "@/lib/fetchJsonWithError";
import { 
  ChevronLeft, Search, Download, Edit2, CheckCircle2, LogOut, 
  Camera, User, Building2, Shield, DollarSign, Wifi, HeartPulse, 
  Scale, ShieldCheck, GraduationCap, Award, Stethoscope, HardHat, 
  Box, Folder, MoreHorizontal, Plus, X, ChevronDown, Trash2, Landmark
} from "lucide-react";

export default function PersonelDetayPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");
  const [personel, setPersonel] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [statu, setStatu] = useState("Aktif");
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        setErrorMsg("");
        const row = await fetchJsonWithError<any>(`/api/v1/personel/${id}`);
        if (!row || typeof row !== "object") {
          setErrorMsg("Personel detayi formati gecersiz.");
          return;
        }
        const mapped = {
          ...row,
          ...(row.personelJson && typeof row.personelJson === "object" ? row.personelJson : {}),
        };
        setPersonel(mapped);
        setStatu(mapped.statu ?? "Aktif");
      } catch (e) {
        setErrorMsg(getApiErrorMessage(e, "Personel detayi cekilirken baglanti hatasi olustu."));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  if (isLoading) {
    return <ApiLoadingText message="Personel detayi yukleniyor..." className="py-16 text-center" />;
  }
  if (errorMsg) {
    return <ApiErrorBanner message={errorMsg} />;
  }
  if (!personel) return null;
  const p = personel;

  const updatePersonelApi = async (updates: Partial<typeof p>) => {
    try {
      await fetchJsonWithError(`/api/v1/personel/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, ...updates }),
      });
    } catch (e) {
      setErrorMsg(getApiErrorMessage(e, "Personel guncelleme islemi basarisiz oldu."));
    }
  };

  const updateLocalPersonel = (updates: Partial<typeof p>) => {
    setPersonel((prev: any) => (prev ? { ...prev, ...updates } : prev));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/v1/documents/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Fotoğraf yüklenemedi.");
      }

      const imageUrl = json.data?.path || json.url || json.path;
      if (imageUrl) {
        await updatePersonelApi({ profilResmi: imageUrl });
        updateLocalPersonel({ profilResmi: imageUrl });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Bilinmeyen bir hata oluştu");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = (updates: Partial<typeof p>) => {
    void updatePersonelApi(updates);
    updateLocalPersonel(updates);
    setEditingCard(null);
  };

  const handleSaveZimmet = (newZimmet: Omit<Zimmet, "id">) => {
    const zimmetWithId = { ...newZimmet, id: Date.now().toString() };
    updateLocalPersonel({ zimmetler: [...(p.zimmetler || []), zimmetWithId] });
    setEditingCard(null);
  };

  const handleDeleteZimmet = (zimmetId: string | number) => {
    updateLocalPersonel({ zimmetler: p.zimmetler?.filter((z: any) => z.id !== zimmetId) || [] });
  };

  const handleSaveEvrak = (newEvrak: Omit<Evrak, "id">) => {
    const evrakWithId = { ...newEvrak, id: Date.now().toString() };
    updateLocalPersonel({ evraklar: [...(p.evraklar || []), evrakWithId] });
    setEditingCard(null);
  };

  const handleDeleteEvrak = (evrakId: string | number) => {
    updateLocalPersonel({ evraklar: p.evraklar?.filter((e: any) => e.id !== evrakId) || [] });
  };
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };
  const isPasif = statu === "Pasif";
  const isEmptyInfoValue = (value: ReactNode): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === "number") return false;
    if (typeof value === "boolean") return false;
    if (typeof value === "string") {
      const t = value.trim();
      return t === "" || t === "-" || t === "Seçiniz" || t === "Belirtilmemiş";
    }
    return false;
  };

  const InfoCard = ({ icon: Icon, title, items, onEdit }: { icon: any, title: string, items: { label: string, value: ReactNode }[], onEdit?: () => void }) => {
    const visibleItems = items.filter((item) => !isEmptyInfoValue(item.value));
    return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl flex flex-col shadow-sm">
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
            <Icon className="w-4 h-4 text-[#172b4d] stroke-[2.5]" />
          </div>
          <h3 className="text-[13px] font-black text-[#172b4d]">{title}</h3>
        </div>
        {onEdit && (
          <button onClick={onEdit} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors border border-gray-200">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
      <div className="p-5 flex flex-col gap-4">
        {visibleItems.length > 0 ? visibleItems.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start gap-4">
            <span className="text-[10px] font-black text-gray-400 tracking-[0.05em] uppercase w-[125px] shrink-0 mt-0.5">{item.label}</span>
            <span className={`text-[12px] font-extrabold text-[#172b4d] flex-1 min-w-0 break-words text-left leading-snug ${typeof item.value === "string" && item.value.includes("\n") ? "whitespace-pre-wrap" : ""}`}>{item.value}</span>
          </div>
        )) : (
          <div className="text-[12.5px] text-gray-400 font-medium italic text-center py-4">Bilgi girilmemiş.</div>
        )}
      </div>
    </div>
  )};
  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shadow-sm">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 tracking-wider">HIZLI PERSONEL ARA</span>
          <div className="relative mt-7">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Ad Soyad, T.C. Kimlik No veya Sicil No ile arama yapın"
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 focus:border-[#00875a] hover:border-gray-200 rounded-xl text-[13px] font-bold text-[#172b4d] outline-none transition-all focus:ring-4 focus:ring-[#00875a]/10"
            />
          </div>
        </div>
        <button className="self-end bg-[#00875a] hover:bg-[#006644] text-white px-6 py-3 rounded-xl font-extrabold text-[13px] shadow-md shadow-[#00875a]/20 transition-all active:scale-95 whitespace-nowrap">
          Personel Kartını Görüntüle
        </button>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-extrabold text-[12px] transition-colors ${isPasif ? "bg-red-50 border-red-100 text-red-600" : "bg-green-50 border-green-100 text-green-600"}`}>
            <div className={`w-2 h-2 rounded-full ${isPasif ? "bg-red-500" : "bg-green-500"} animate-pulse`}></div>
            {statu} Personel
          </div>
          <button className="flex items-center gap-2 bg-[#ef5a28] hover:bg-[#d94720] text-white px-5 py-2.5 rounded-xl font-extrabold text-[12.5px] shadow-sm transition-all active:scale-95">
            <Download className="w-4 h-4 stroke-[2.5]" /> PDF İndir
          </button>
          <button className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-[#172b4d] px-5 py-2.5 rounded-xl font-extrabold text-[12.5px] shadow-sm transition-all active:scale-95">
            <Edit2 className="w-4 h-4 stroke-[2.5]" /> Düzenle
          </button>
          {isPasif ? (
            <button onClick={() => { setStatu("Aktif"); void updatePersonelApi({ statu: "Aktif" }); updateLocalPersonel({ statu: "Aktif" }); }} className="flex items-center gap-2 bg-white border-2 border-green-100 hover:bg-green-50 text-green-600 px-5 py-2.5 rounded-xl font-extrabold text-[12.5px] shadow-sm transition-all active:scale-95">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> Aktife Al
            </button>
          ) : (
            <button onClick={() => { setStatu("Pasif"); void updatePersonelApi({ statu: "Pasif" }); updateLocalPersonel({ statu: "Pasif" }); }} className="flex items-center gap-2 bg-white border-2 border-red-100 hover:bg-red-50 text-red-500 px-5 py-2.5 rounded-xl font-extrabold text-[12.5px] shadow-sm transition-all active:scale-95">
              <LogOut className="w-4 h-4 stroke-[2.5]" /> Pasife Al
            </button>
          )}
        </div>
        <button className="flex items-center gap-2 bg-white border-2 border-red-100 hover:bg-red-50 text-red-500 px-5 py-2.5 rounded-xl font-extrabold text-[12.5px] shadow-sm transition-all active:scale-95">
          <LogOut className="w-4 h-4 stroke-[2.5]" /> İşten Çıkış
        </button>
      </div>
      <div className="flex flex-col lg:flex-row items-start gap-6">
        <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0">
          <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col items-center">
            <div className="h-28 bg-[#172b4d] w-full"></div>
            <div className="relative -mt-12 mb-4">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageUpload}
              />
              <div className="w-24 h-24 bg-gray-100 rounded-[28px] border-4 border-white shadow-sm flex items-center justify-center text-[28px] font-black text-[#172b4d] overflow-hidden relative">
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 transition-all">
                    <div className="w-5 h-5 border-2 border-[#172b4d] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {p.profilResmi ? (
                  <img src={p.profilResmi} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  getInitials(p.adSoyad)
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#172b4d] rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-[#0052cc] transition-colors shadow-sm disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-[18px] font-black text-[#172b4d] tracking-tight">{p.adSoyad}</h2>
            <div className="flex items-center gap-1.5 text-gray-500 mt-1 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0052cc]"></div>
              <span className="text-[12px] font-bold">{p.org}</span>
            </div>
            <div className="flex flex-col sm:flex-row w-full px-5 py-5 gap-3 border-t-2 border-gray-50 bg-gray-50/50">
              <div className="flex-1 bg-white border-2 border-gray-100 rounded-xl p-3 flex flex-col items-center">
                <span className="text-[9px] font-black text-gray-400 tracking-wider">SİCİL NO</span>
                <span className="text-[14px] font-black text-[#172b4d] mt-1">{p.sicil}</span>
              </div>
              <div className="flex-1 bg-white border-2 border-gray-100 rounded-xl p-3 flex flex-col items-center">
                <span className="text-[9px] font-black text-gray-400 tracking-wider">STATÜ</span>
                <span className={`text-[14px] font-black mt-1 ${isPasif ? "text-red-500" : "text-green-500"}`}>{statu}</span>
              </div>
            </div>
          </div>
          <InfoCard 
            icon={User}
            title="Kimlik ve Temel Bilgiler"
            onEdit={() => setEditingCard("Kimlik ve Temel Bilgiler")}
            items={[
               { label: "UYRUK", value: p.uyrugu },
               { label: "T.C. KİMLİK NO", value: p.tckn },
               { label: "DOĞUM TARİHİ", value: p.dogumTarihi },
               { label: "YAŞ", value: p.yas },
               { label: "DOĞUM YERİ", value: p.dogumYeri },
               { label: "CİNSİYET", value: p.cinsiyet },
               { label: "MEDENİ HAL", value: p.medeniHal },
               { label: "ANA ADI", value: p.anaAdi },
               { label: "BABA ADI", value: p.babaAdi },
               { label: "ADRES", value: p.adres },
               { label: "İL", value: p.il },
               { label: "İLÇE", value: p.ilce },
               { label: "CEP TELEFONU", value: p.cepTelefonu },
               { label: "E-POSTA", value: p.eposta },
               { label: "ACİL DURUM KİŞİSİ", value: p.acilDurumKisisi },
               { label: "YAKINLIK", value: p.yakinlik },
               { label: "ACİL DURUM TELEFON", value: p.acilDurumTelefon },
            ]}
          />
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-6">
              <InfoCard 
                icon={Building2}
                title="Kurum ve Kadro Bilgileri"
                onEdit={() => setEditingCard("Kurum ve Kadro Bilgileri")}
                items={[
                  { label: "FİRMA ÜNVANI", value: p.firmaUnvani },
                  { label: "ŞUBE / ORG", value: p.org },
                  { label: "DEPARTMAN", value: p.departman },
                  { label: "BİRİM", value: p.birim },
                  { label: "GÖREV / ÜNVAN", value: p.unvan },
                  { label: "TAKIM - SINIF", value: p.takimSinif },
                  { label: "EKİP SORUMLUSU", value: p.ekipSorumlusu },
                  { label: "İŞYERİ LOKASYONU", value: p.isyeriLokasyonu },
                  { label: "MASRAF MERKEZİ", value: p.masrafMerkezi },
                  { label: "KADRO STATÜSÜ", value: p.kadroStatusu },
                ]}
              />
              <InfoCard 
                icon={DollarSign}
                title="Ücret ve Yan Hak Bilgileri"
                onEdit={() => setEditingCard("Ücret ve Yan Hak Bilgileri")}
                items={[
                  { label: "ÜCRET TİPİ", value: p.ucretTipi },
                  { label: "NET ÜCRET", value: p.netUcret },
                  { label: "BRÜT ÜCRET", value: p.brutUcret },
                  { label: "YEMEK DESTEK ÖDEMESİ", value: p.yemekDestekOdemesi },
                  { label: "YEMEK DESTEK ÜCRETİ", value: p.yemekDestekUcreti },
                  { label: "YOL DESTEK ÖDEMESİ", value: p.yolDestekOdemesi },
                  { label: "YOL DESTEK ÜCRETİ", value: p.yolDestekUcreti },
                  { label: "1. SABİT EK ÖDEME VAR MI", value: p.sabitEkOdeme1VarMi },
                  { label: "1. SABİT EK ÖDEME TUTARI", value: p.sabitEkOdeme1Tutari },
                  { label: "1. SABİT EK ÖDEME AÇIKLAMASI", value: p.sabitEkOdeme1Aciklamasi },
                  { label: "2. SABİT EK ÖDEME VAR MI", value: p.sabitEkOdeme2VarMi },
                  { label: "2. SABİT EK ÖDEME TUTARI", value: p.sabitEkOdeme2Tutari },
                  { label: "2. SABİT EK ÖDEME AÇIKLAMASI", value: p.sabitEkOdeme2Aciklamasi },
                  { label: "SERVİS KULLANIM DURUMU", value: p.servisKullanimDurumu },
                  { label: "SERVİS NUMARASI", value: p.servisNumarasi },
                ]}
              />
              <InfoCard 
                icon={Landmark}
                title="Ödeme ve Banka Bilgileri"
                onEdit={() => setEditingCard("Ücret ve Yan Hak Bilgileri")}
                items={[
                  { label: "IBAN", value: p.ibanNo ?? p.iban },
                  { label: "BANKA ADI", value: p.bankaAdi },
                  { label: "ŞUBE ADI", value: p.bankaSube },
                ]}
              />
              <InfoCard 
                icon={HeartPulse}
                title="Sağlık Durumu Bilgileri"
                onEdit={() => setEditingCard("Sağlık Durumu Bilgileri")}
                items={[
                  { label: "KAN GRUBU", value: p.kanGrubu },
                  { label: "SÜREKLİ İLAÇ KULLANIMI", value: p.surekliIlacKullanimi },
                  { label: "KULLANILAN İLAÇ TÜRÜ", value: p.kullanilanIlacTuru },
                  { label: "ENGELLİLİK DURUMU", value: p.engellilikDurumu },
                  { label: "ENGELLİLİK TÜRÜ", value: p.engellilikTuru },
                  { label: "ENGELLİLİK ORANI (%)", value: p.engellilikOrani },
                  { label: "PROTEZ / ORTEZ", value: p.protezOrtez },
                  { label: "PROTEZ / ORTEZ TÜRÜ", value: p.protezOrtezTuru },
                ]}
              />
              <InfoCard 
                icon={ShieldCheck}
                title="Askerlik Durumu"
                onEdit={() => setEditingCard("Askerlik Durumu")}
                items={[
                  { label: "ASKERLİK DURUMU", value: p.askerlikDurumu },
                  { label: "TERHİS TARİHİ", value: p.terhisTarihi },
                  { label: "TECİL BİTİŞ TARİHİ", value: p.tecilBitisTarihi },
                  { label: "TECİLİN BİTMESİNE KALAN SÜRE", value: p.kalanSure },
                  { label: "HİZMET TÜRÜ", value: p.hizmetTuru },
                  { label: "SINIF / BRANŞ", value: p.sinifBrans },
                ]}
              />
              <InfoCard 
                icon={Award}
                title="MYK Mesleki Yeterlilik"
                onEdit={() => setEditingCard("MYK Mesleki Yeterlilik")}
                items={[
                  { label: "MYK BELGESİ", value: p.mykBelgesi },
                  { label: "MESLEK ADI", value: p.meslekAdi },
                  { label: "SEVİYE", value: p.mykSeviye },
                  { label: "BELGE NO", value: p.mykBelgeNo },
                ]}
              />
            </div>
            <div className="flex flex-col gap-6">
              <InfoCard 
                icon={Shield}
                title="SGK & Statü"
                onEdit={() => setEditingCard("SGK & Statü")}
                items={[
                  { label: "SGK STATÜSÜ", value: p.sgkStatusu },
                  { label: "İSTİHDAM TÜRÜ", value: p.istihdamTuru },
                  { label: "ÇALIŞMA TÜRÜ", value: p.calismaTuru },
                  { label: "İŞE BAŞLAMA TARİHİ", value: p.iseBaslamaTarihi },
                  { label: "MESAİ BAŞLANGIÇ SAATİ", value: p.mesaiBaslangic },
                  { label: "MESAİ BİTİŞ SAATİ", value: p.mesaiBitis },
                  { label: "İŞE ALIM DURUMU", value: p.iseAlimDurumu },
                  { label: "İŞTEN AYRILIŞ TARİHİ", value: <span className={`flex items-center gap-1.5 ${isPasif ? "text-red-500" : "text-green-600"}`}><div className={`w-1.5 h-1.5 rounded-full ${isPasif ? "bg-red-500" : "bg-green-500"}`}></div> {isPasif ? (p.istenAyrilisTarihi && p.istenAyrilisTarihi !== "-" ? p.istenAyrilisTarihi : "Ayrıldı") : "Devam Ediyor"}</span> },
                ]}
              />
              <InfoCard 
                icon={Wifi}
                title="Erişim ve Yetki Tanımlamaları"
                onEdit={() => setEditingCard("Erişim ve Yetki Tanımlamaları")}
                items={[
                  { label: "KURUMSAL E-POSTA", value: <span className={`flex items-center gap-1.5 ${p.kurumsalEposta === "Pasif" ? "text-red-500" : (p.kurumsalEposta === "Aktif" ? "text-green-600" : "")}`}><div className={`w-1.5 h-1.5 rounded-full ${p.kurumsalEposta === "Pasif" ? "bg-red-500" : (p.kurumsalEposta === "Aktif" ? "bg-green-500" : "")} ${!p.kurumsalEposta ? "hidden" : ""}`}></div>{p.kurumsalEposta}</span> },
                  { label: "KURUMSAL E-POSTA ADRESİ", value: p.kurumsalEpostaAdresi },
                  { label: "KURUMSAL TELEFON", value: <span className={`flex items-center gap-1.5 ${p.kurumsalTelefon === "Pasif" ? "text-red-500" : (p.kurumsalTelefon === "Aktif" ? "text-green-600" : "")}`}><div className={`w-1.5 h-1.5 rounded-full ${p.kurumsalTelefon === "Pasif" ? "bg-red-500" : (p.kurumsalTelefon === "Aktif" ? "bg-green-500" : "")} ${!p.kurumsalTelefon ? "hidden" : ""}`}></div>{p.kurumsalTelefon}</span> },
                  { label: "KURUMSAL GSM", value: p.kurumsalGsm },
                  { label: "DAHİLİYE NO", value: p.dahiliyeNo },
                  { label: "MANYETİK KART", value: <span className={`flex items-center gap-1.5 ${p.manyetikKart === "Pasif" ? "text-red-500" : (p.manyetikKart === "Aktif" ? "text-green-600" : "")}`}><div className={`w-1.5 h-1.5 rounded-full ${p.manyetikKart === "Pasif" ? "bg-red-500" : (p.manyetikKart === "Aktif" ? "bg-green-500" : "")} ${!p.manyetikKart ? "hidden" : ""}`}></div>{p.manyetikKart}</span> },
                  { label: "KART SERİ NO", value: p.kartSeriNo },
                  { label: "PARMAK İZİ TANIMI", value: p.parmakIzi },
                  { label: "YÜZ TANIMA YETKİSİ", value: p.yuzTanima },
                  { label: "OTOPARK KULLANIM YETKİ", value: p.otoparkYetkisi },
                  { label: "ZİYARETÇİ GİRİŞ YETKİ", value: p.ziyaretciGirisYetki },
                  { label: "MANYETİK KART DURUMU", value: p.manyetikKart },
                  { label: "KARTVİZİT", value: p.kartvizit },
                  { label: "ERP PROGRAM KULLANIMI", value: p.erpProgramKullanimi },
                ]}
              />
              <InfoCard 
                icon={Scale}
                title="Yasal Durum ve Adli Sicil"
                onEdit={() => setEditingCard("Yasal Durum ve Adli Sicil")}
                items={[
                  { label: "ADLİ SİCİL KAYDI", value: p.adliSicilKaydi },
                  { label: "SABIKA TÜRÜ / AÇIKLAMA", value: p.sabikaTuru ?? p.adliSicilNedeni },
                  { label: "ADLİ SİCİL NEDENİ", value: p.adliSicilNedeni },
                  { label: "HACİZ ALIMI", value: p.hacizAlimi },
                  { label: "ESKİ HÜKÜMLÜ", value: p.eskiHukumlu },
                  { label: "CEZA NEDENİ", value: p.cezaNedeni },
                  { label: "CEZAEVİ GİRİŞ TARİHİ", value: p.cezaeviGirisTarihi },
                  { label: "CEZAEVİ ÇIKIŞ TARİHİ", value: p.cezaeviCikisTarihi },
                  { label: "CEZA NEDENİ DETAYI", value: p.cezaNedeniDetayi },
                  { label: "ÇOCUK ÖRNEĞİ", value: p.cocukOrnegi },
                  { label: "NAFAKA DURUMU", value: p.nafakaDurumu },
                  { label: "İCRA DURUMU", value: p.icraDurumu },
                  { label: "AKTİF İCRA DOSYASI SAYISI", value: p.aktifIcraDosyasiSayisi },
                  { label: "DENETİMLİ SERBESTLİK", value: p.denetimliSerbestlik },
                  { label: "ÖZEL NEDEN", value: p.ozelNeden },
                ]}
              />
              <InfoCard 
                icon={GraduationCap}
                title="Eğitim ve Mesleki Bilgiler"
                onEdit={() => setEditingCard("Eğitim ve Mesleki Bilgiler")}
                items={[
                  { label: "EĞİTİM DURUMU", value: p.egitimDurumu },
                  { label: "OKUL ADI", value: p.okulAdi },
                  { label: "BÖLÜM", value: p.bolum },
                  { label: "MEZUNİYET YILI", value: p.mezuniyetYili },
                  { label: "TÜM EĞİTİMLER (ÖZET)", value: p.egitimlerOzeti },
                ]}
              />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <InfoCard 
                  icon={Stethoscope}
                  title="İşe Giriş Sağlık Muayenesi"
                  onEdit={() => setEditingCard("İşe Giriş Sağlık Muayenesi")}
                  items={[
                    { label: "ÇALIŞABİLİRLİK", value: p.isGirisCalisabilirlik },
                    { label: "SAĞLIK RAPORU", value: p.isGirisSaglikRaporu },
                    { label: "RAPOR TARİHİ", value: p.isGirisRaporTarihi },
                    { label: "SONRAKİ MUAYENE", value: p.isGirisSonrakiMuayene },
                  ]}
                />
                <InfoCard 
                  icon={HardHat}
                  title="İSG Eğitim Bilgileri"
                  onEdit={() => setEditingCard("İSG Eğitim Bilgileri")}
                  items={[
                    { label: "EĞİTİM DURUMU", value: p.isgEgitimDurumu },
                    { label: "EĞİTİM TÜRÜ", value: p.isgEgitimTuru },
                    { label: "EĞİTİM SÜRESİ", value: p.isgEgitimSuresi },
                    { label: "EĞİTİMİ VEREN", value: p.isgEgitimiVeren },
                  ]}
                />
              </div>
            </div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl flex flex-col shadow-sm">
            <div className="flex items-center justify-between p-5 border-b-2 border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Box className="w-4 h-4 text-[#172b4d] stroke-[2.5]" />
                </div>
                <h3 className="text-[13px] font-black text-[#172b4d]">Zimmet ve Demirbaş Kayıtları</h3>
              </div>
              <button onClick={() => setEditingCard("Zimmet Kaydı Oluştur")} className="flex items-center gap-2 border-2 border-[#ef5a28] hover:border-[#d94720] hover:bg-orange-50 text-[#ef5a28] px-4 py-2 rounded-xl font-extrabold text-[12px] shadow-sm transition-all active:scale-95">
                <Plus className="w-4 h-4 stroke-[2.5]" /> Zimmet Ekle
              </button>
            </div>
            <div className="p-5 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="py-3 px-4 text-left text-[10px] font-black text-gray-500 uppercase rounded-l-xl border-y border-l border-gray-100">#</th>
                    <th className="py-3 px-4 text-left text-[10px] font-black text-gray-500 uppercase border-y border-gray-100">DEMİRBAŞ / EKİPMAN</th>
                    <th className="py-3 px-4 text-left text-[10px] font-black text-gray-500 uppercase border-y border-gray-100">MARKA / MODEL</th>
                    <th className="py-3 px-4 text-left text-[10px] font-black text-gray-500 uppercase border-y border-gray-100">SERİ NO</th>
                    <th className="py-3 px-4 text-left text-[10px] font-black text-gray-500 uppercase border-y border-gray-100">DEPO KODU</th>
                    <th className="py-3 px-4 text-left text-[10px] font-black text-gray-500 uppercase border-y border-gray-100">ADET</th>
                    <th className="py-3 px-4 text-left text-[10px] font-black text-gray-500 uppercase border-y border-gray-100">TESLİM TARİHİ</th>
                    <th className="py-3 px-4 text-left text-[10px] font-black text-gray-500 uppercase border-y border-gray-100">İADE TARİHİ</th>
                    <th className="py-3 px-4 text-left text-[10px] font-black text-gray-500 uppercase border-y border-gray-100">DURUM</th>
                    <th className="py-3 px-4 text-center text-[10px] font-black text-gray-500 uppercase rounded-r-xl border-y border-r border-gray-100 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {p.zimmetler && p.zimmetler.length > 0 ? p.zimmetler.map((zimmet: any, idx: number) => (
                    <tr key={zimmet.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 text-[13px] font-black text-[#172b4d]">{idx + 1}</td>
                      <td className="py-3 px-4 text-[13px] font-bold text-[#172b4d]">{zimmet.demirbasAdi}</td>
                      <td className="py-3 px-4 text-[13px] font-medium text-gray-600">{zimmet.markaModel}</td>
                      <td className="py-3 px-4 text-[13px] font-medium text-gray-600">{zimmet.seriNo}</td>
                      <td className="py-3 px-4 text-[13px] font-medium text-gray-600">{zimmet.depoKodu}</td>
                      <td className="py-3 px-4 text-[13px] font-medium text-gray-600">{zimmet.adet} Adet</td>
                      <td className="py-3 px-4 text-[13px] font-medium text-gray-600">{zimmet.teslimTarihi || "-"}</td>
                      <td className="py-3 px-4 text-[13px] font-medium text-gray-600">{zimmet.iadeTarihi || "-"}</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-[8px] text-[11px] font-extrabold">{zimmet.durum}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleDeleteZimmet(zimmet.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center group transition-colors ml-auto">
                          <Trash2 className="w-4 h-4 text-red-300 group-hover:text-red-500 transition-colors" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-[12.5px] font-bold text-gray-400">
                        Zimmet kaydı bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl flex flex-col shadow-sm">
            <div className="flex items-center justify-between p-5 border-b-2 border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Folder className="w-4 h-4 text-[#172b4d] stroke-[2.5]" />
                </div>
                <h3 className="text-[13px] font-black text-[#172b4d]">Özlük Evrakları</h3>
              </div>
              <button onClick={() => setEditingCard("Yeni Evrak Yükle")} className="flex items-center gap-2 border-2 border-[#ef5a28] hover:border-[#d94720] hover:bg-orange-50 text-[#ef5a28] px-4 py-2 rounded-xl font-extrabold text-[12px] shadow-sm transition-all active:scale-95">
                <Plus className="w-4 h-4 stroke-[2.5]" /> Evrak Ekle
              </button>
            </div>
            <div className="p-5 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="py-3 px-4 text-left text-[10px] font-black text-gray-500 uppercase rounded-l-xl border-y border-l border-gray-100">#</th>
                    <th className="py-3 px-4 text-left text-[10px] font-black text-gray-500 uppercase border-y border-gray-100">EVRAK ADI</th>
                    <th className="py-3 px-4 text-left text-[10px] font-black text-gray-500 uppercase border-y border-gray-100">DOSYA</th>
                    <th className="py-3 px-4 text-left text-[10px] font-black text-gray-500 uppercase border-y border-gray-100">BOYUT</th>
                    <th className="py-3 px-4 text-left text-[10px] font-black text-gray-500 uppercase border-y border-gray-100">YÜKLEME TARİHİ</th>
                    <th className="py-3 px-4 text-center text-[10px] font-black text-gray-500 uppercase border-y border-gray-100 w-12">İNDİR</th>
                    <th className="py-3 px-4 text-center text-[10px] font-black text-gray-500 uppercase rounded-r-xl border-y border-r border-gray-100 w-12">SİL</th>
                  </tr>
                </thead>
                <tbody>
                  {p.evraklar && p.evraklar.length > 0 ? p.evraklar.map((evrak: any, idx: number) => (
                    <tr key={evrak.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 text-[13px] font-black text-[#172b4d]">{idx + 1}</td>
                      <td className="py-3 px-4 text-[13px] font-bold text-[#172b4d]">{evrak.ad}</td>
                      <td className="py-3 px-4 text-[13px] font-medium text-gray-600 truncate max-w-[150px]">{evrak.dosyaAdi}</td>
                      <td className="py-3 px-4 text-[13px] font-medium text-gray-600">{evrak.boyut}</td>
                      <td className="py-3 px-4 text-[13px] font-medium text-gray-600">{evrak.yuklemeTarihi}</td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => alert(`${evrak.dosyaAdi} indiriliyor...`)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center group transition-colors mx-auto">
                          <Download className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => handleDeleteEvrak(evrak.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center group transition-colors mx-auto">
                          <Trash2 className="w-4 h-4 text-red-300 group-hover:text-red-500 transition-colors" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[12.5px] font-bold text-gray-400">
                        Evrak yüklenmemiş.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <KurumVeKadroBilgileriModal 
        isOpen={editingCard === "Kurum ve Kadro Bilgileri"} 
        onClose={() => setEditingCard(null)} 
        data={p} 
        onSave={handleSave} 
      />
      <SgkVeStatuModal 
        isOpen={editingCard === "SGK & Statü"} 
        onClose={() => setEditingCard(null)} 
        data={p} 
        onSave={handleSave} 
      />
      <KimlikVeTemelBilgilerModal 
        isOpen={editingCard === "Kimlik ve Temel Bilgiler"} 
        onClose={() => setEditingCard(null)} 
        data={p} 
        onSave={handleSave} 
      />
      <UcretVeYanHakBilgileriModal 
        isOpen={editingCard === "Ücret ve Yan Hak Bilgileri"} 
        onClose={() => setEditingCard(null)} 
        data={p} 
        onSave={handleSave} 
      />
      <SaglikDurumuModal
        isOpen={editingCard === "Sağlık Durumu Bilgileri"} 
        onClose={() => setEditingCard(null)} 
        data={p} 
        onSave={handleSave} 
      />
      <AskerlikDurumuModal
        isOpen={editingCard === "Askerlik Durumu"} 
        onClose={() => setEditingCard(null)} 
        data={p} 
        onSave={handleSave} 
      />
      <MykMeslekiYeterlilikModal
        isOpen={editingCard === "MYK Mesleki Yeterlilik"} 
        onClose={() => setEditingCard(null)} 
        data={p} 
        onSave={handleSave} 
      />
      <ErisimVeYetkiModal
        isOpen={editingCard === "Erişim ve Yetki Tanımlamaları"} 
        onClose={() => setEditingCard(null)} 
        data={p} 
        onSave={handleSave} 
      />
      <YasalDurumVeAdliSicilModal
        isOpen={editingCard === "Yasal Durum ve Adli Sicil"} 
        onClose={() => setEditingCard(null)} 
        data={p} 
        onSave={handleSave} 
      />
      <EgitimVeMeslekiBilgilerModal
        isOpen={editingCard === "Eğitim ve Mesleki Bilgiler"} 
        onClose={() => setEditingCard(null)} 
        data={p} 
        onSave={handleSave} 
      />
      <IseGirisSaglikMuayenesiModal
        isOpen={editingCard === "İşe Giriş Sağlık Muayenesi"} 
        onClose={() => setEditingCard(null)} 
        data={p} 
        onSave={handleSave} 
      />
      <IsgEgitimBilgileriModal
        isOpen={editingCard === "İSG Eğitim Bilgileri"} 
        onClose={() => setEditingCard(null)} 
        data={p} 
        onSave={handleSave} 
      />
      <ZimmetModal
        isOpen={editingCard === "Zimmet Kaydı Oluştur"}
        onClose={() => setEditingCard(null)}
        onSave={handleSaveZimmet}
      />
      <EvrakModal
        isOpen={editingCard === "Yeni Evrak Yükle"}
        onClose={() => setEditingCard(null)}
        onSave={handleSaveEvrak}
      />
    </div>
  );
}