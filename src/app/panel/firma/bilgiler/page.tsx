"use client";
import React, { useState, useEffect } from "react";
import { Building2, MapPin, Folder, CloudUpload, CheckCircle2, Eye, RefreshCw, Info, Lock, Unlock, ShieldAlert, Loader2 } from "lucide-react";
import { useOnboarding, type FirmaDataType } from "@/context/OnboardingContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SEKTORLER = [
  "Bilişim ve Teknoloji", "İnşaat ve Yapı", "Tekstil", "Gıda", "Lojistik", "Sağlık", "Eğitim", "Otomotiv", "Finans", "Diğer"
];

// Dosya yükleme durumu tipi
type FileState = null | { name: string; date: string; url: string };

export default function FirmaBilgileriPage() {
  const { isSetupComplete, completeFirmaSetup, completeSetup, firmaData, setFirmaData } = useOnboarding();
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set());
  const router = useRouter();

  const formData = firmaData?.formData || {
    vergiNo: "", firmaUnvani: "", sektor: "", calisanSayisi: "0", subeSayisi: "0",
    il: "", ilce: "", mahalle: "", adres: "", postaKodu: "", telefon: "", ePosta: "", webSitesi: "",
  };
  const files = firmaData?.files || {
    vergiLevhasi: null, ticaretSicil: null, imzaSirkuleri: null,
  };

  // Mevcut yapıyı bozmamak için yardımcı fonksiyonlar
  const setFormData = (updater: React.SetStateAction<FirmaDataType["formData"]>) => {
    setFirmaData((prev) => ({
      ...prev,
      formData: typeof updater === "function" ? updater(prev.formData) : updater,
    }));
  };

  const setFiles = (updater: React.SetStateAction<FirmaDataType["files"]>) => {
    setFirmaData((prev) => ({
      ...prev,
      files: typeof updater === "function" ? updater(prev.files) : updater,
    }));
  };

  // --- ADRES UZAYI STATE ---
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  // API Bağlantıları - Türkiye İlleri
  useEffect(() => {
    setLoadingProvinces(true);
    fetch("https://turkiyeapi.dev/api/v1/provinces")
      .then(res => res.json())
      .then(data => {
        if (data.status === "OK") {
          // İlleri adına göre sıralayalım
          const sorted = data.data.sort((a: any, b: any) => a.name.localeCompare(b.name, 'tr-TR'));
          setProvinces(sorted);
        }
      })
      .catch(() => toast.error("İller yüklenirken hata oluştu."))
      .finally(() => setLoadingProvinces(false));
  }, []);

  // İl seçildiğinde ilçeleri getir
  useEffect(() => {
    if (!formData.il) {
      setDistricts([]);
      setNeighborhoods([]);
      return;
    }

    // İl id'sini bul
    const selectedProvince = provinces.find(p => p.name === formData.il);
    if (selectedProvince) {
      setLoadingDistricts(true);
      fetch(`https://turkiyeapi.dev/api/v1/provinces/${selectedProvince.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "OK") {
            const sorted = data.data.districts.sort((a: any, b: any) => a.name.localeCompare(b.name, 'tr-TR'));
            setDistricts(sorted);
          }
        })
        .catch(() => toast.error("İlçeler yüklenirken hata oluştu."))
        .finally(() => setLoadingDistricts(false));
    }
  }, [formData.il, provinces]);

  // İlçe seçildiğinde mahalleleri getir
  useEffect(() => {
    if (!formData.ilce) {
      setNeighborhoods([]);
      return;
    }

    // İlçe id'sini bul
    const selectedDistrict = districts.find(d => d.name === formData.ilce);
    if (selectedDistrict) {
      setLoadingNeighborhoods(true);
      fetch(`https://turkiyeapi.dev/api/v1/districts/${selectedDistrict.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "OK") {
            const sorted = data.data.neighborhoods.sort((a: any, b: any) => a.name.localeCompare(b.name, 'tr-TR'));
            setNeighborhoods(sorted);
          }
        })
        .catch(() => toast.error("Mahalleler yüklenirken hata oluştu."))
        .finally(() => setLoadingNeighborhoods(false));
    }
  }, [formData.ilce, districts]);


  // Handler'lar
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Eğer il değiştiyse ilçe ve mahalleyi sıfırla
      ...(name === "il" && { ilce: "", mahalle: "" }),
      // Eğer ilçe değiştiyse mahalleyi sıfırla
      ...(name === "ilce" && { mahalle: "" })
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);

    let formatted = val;
    if (val.length > 3) {
      formatted = val.slice(0, 4) + " " + val.slice(4);
    }
    if (val.length > 6) {
      formatted = formatted.slice(0, 8) + " " + formatted.slice(8);
    }
    if (val.length > 8) {
      formatted = formatted.slice(0, 11) + " " + formatted.slice(11);
    }
    setFormData(prev => ({ ...prev, telefon: formatted }));
  };

  const getInputClass = (val: string, isRequired: boolean = true) => {
    if (isRequired && (!val || val.trim() === "")) {
      return "w-full h-12 px-4 text-[14px] font-semibold rounded-xl border-2 outline-none transition-all placeholder:font-medium text-[#172b4d] border-red-300 bg-red-50 placeholder:text-red-300/70 focus:border-[#ef5a28] focus:bg-white focus:ring-4 focus:ring-[#ef5a28]/10 focus:placeholder-gray-300";
    }
    return "w-full h-12 px-4 text-[14px] font-semibold rounded-xl border-2 border-gray-200 outline-none focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10 transition-all placeholder:font-medium placeholder:text-gray-300 text-[#172b4d]";
  };

  const getSelectClass = (val: string, isRequired: boolean = true) => {
    if (isRequired && (!val || val.trim() === "")) {
      return "w-full h-12 px-4 text-[14px] font-semibold rounded-xl border-2 outline-none transition-all text-[#172b4d] border-red-300 bg-red-50 focus:border-[#ef5a28] focus:bg-white focus:ring-4 focus:ring-[#ef5a28]/10";
    }
    return "w-full h-12 px-4 text-[14px] font-semibold rounded-xl border-2 border-gray-200 outline-none focus:border-[#ef5a28] transition-all text-[#172b4d]";
  };

  const handleFileUpload = async (key: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingKeys(prev => new Set(prev).add(key));
      try {
        const body = new FormData();
        body.set("file", file, file.name);
        const res = await fetch("/api/v1/documents/upload", { method: "POST", body });
        const json = await res.json();
        if (!res.ok || !json?.success || !json?.data?.path) {
          throw new Error(json?.error?.message || "Dosya yuklenemedi.");
        }

        const cdnUrl = String(json.data.path);
        setFiles(prev => ({
          ...prev,
          [key]: {
            name: file.name,
            date: new Date().toLocaleDateString("tr-TR"),
            url: cdnUrl,
          }
        }));
        toast.success(`${file.name} başarıyla yüklendi.`);
      } catch (err: any) {
        toast.error(err?.message || "Dosya yüklenemedi. Lütfen tekrar deneyin.");
      } finally {
        setUploadingKeys(prev => { const s = new Set(prev); s.delete(key); return s; });
      }
    }
  };


  // Tüm zorunlu alanlar doldu mu?
  const isFormComplete = () => {
    const requiredText = [
      formData.vergiNo, formData.firmaUnvani, formData.sektor, formData.calisanSayisi,
      formData.subeSayisi, formData.il, formData.ilce, formData.mahalle,
      formData.adres, formData.postaKodu, formData.telefon, formData.ePosta
    ];

    const requiredFiles = [files.vergiLevhasi, files.ticaretSicil, files.imzaSirkuleri];

    return requiredText.every(val => val.trim().length > 0) && requiredFiles.every(val => val !== null);
  };

  const handleSave = () => {
    // Tüm bilgileri bir çatı altında sakla
    toast.success("Firma bilgileri başarıyla kaydedildi!");
    if (!isSetupComplete) {
      completeFirmaSetup();
      toast.success("Adım 1 tamamlandı. Ana Kullanıcı Adımına geçiliyor.", {
        icon: <Unlock className="w-5 h-5 text-orange-500" />
      });
      router.push("/panel/isveren-yetkilileri/ana-kullanici-bilgileri");
    }
  };

  // --- COMPONENT HELPERS ---
  const DosyaYuklemeKarti = ({ keyName, label }: { keyName: keyof typeof files, label: string }) => {
    const isRequired = true;
    const fileState = files[keyName];
    const isUploading = uploadingKeys.has(keyName);
    const emptyBorderClass = isRequired && !fileState ? "border-red-300 bg-red-50 hover:bg-red-100" : "border-[#e1e5ee] bg-white hover:bg-gray-50";

    return (
      <div className="flex flex-col gap-2 relative">
        <div className="flex items-center gap-2 mb-0.5">
          <label className={`text-[12.5px] font-extrabold ${isUploading ? 'text-[#0052cc]' : isRequired && !fileState ? 'text-red-500' : 'text-[#172b4d]'}`}>
            {label} (PDF)
          </label>
          {fileState && !isUploading && <Lock className="w-3.5 h-3.5 text-orange-400" />}
          {isUploading && <Loader2 className="w-3.5 h-3.5 text-[#0052cc] animate-spin" />}
        </div>

        {isUploading ? (
          // YÜKLENİYOR HALİ
          <div className="border-2 border-dashed border-[#0052cc]/40 bg-blue-50/60 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
            {/* Animasyonlu arka plan dalgası */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/80 to-transparent animate-[shimmer_1.5s_infinite] -translate-x-full" style={{backgroundSize: '200% 100%'}} />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-[#0052cc]/10 flex items-center justify-center mb-3">
                <Loader2 className="w-7 h-7 text-[#0052cc] animate-spin" />
              </div>
              <span className="text-[13px] font-extrabold text-[#0052cc] mb-1">Yükleniyor...</span>
              <span className="text-[11px] font-medium text-[#0052cc]/60">Lütfen bekleyin</span>
              {/* Progress bar animasyonu */}
              <div className="w-32 h-1.5 bg-blue-100 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-[#0052cc] rounded-full animate-[progress_1.5s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        ) : fileState ? (
          // YÜKLENMİŞ HALİ
          <div className="border border-green-500 bg-[#effcf3] rounded-3xl p-6 flex flex-col items-center justify-center min-h-[160px] animate-fade-in relative group border-dashed">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-green-500 mb-2 transform group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-[42px] h-[42px] stroke-[2]" />
            </div>
            <span className="text-[13px] font-black text-[#172b4d] text-center w-full truncate px-4">{fileState.name}</span>
            <span className="text-[11px] font-medium text-gray-400 mb-4">{fileState.date}</span>

            <div className="flex items-center gap-2 w-full mt-auto bg-[#f4f5f8]/80 p-1.5 rounded-xl border border-gray-100/50">
              <button
                type="button"
                onClick={() => window.open(fileState.url, "_blank")}
                className="h-9 w-11 rounded-lg bg-[#8385e0] text-white flex items-center justify-center hover:bg-[#7274ce] transition-colors shadow-sm shrink-0"
                title="Dosyayı Görüntüle"
              >
                <Eye className="w-[18px] h-[18px]" />
              </button>
              <button
                type="button"
                className="flex-1 h-9 rounded-lg bg-[#ef5a28] hover:bg-[#d94f20] text-white text-[12px] font-extrabold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <RefreshCw className="w-[14px] h-[14px]" /> Güncelleme Talebi
              </button>
            </div>
          </div>
        ) : (
          // BOŞ HALİ
          <div className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px] transition-colors group cursor-pointer relative overflow-hidden ${emptyBorderClass}`}>
            <input
              type="file"
              accept="application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => handleFileUpload(keyName, e)}
            />
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors mb-3 ${isRequired && !fileState ? 'bg-red-100 text-red-500 group-hover:bg-red-200' : 'bg-gray-50 text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
              <CloudUpload className="w-6 h-6" />
            </div>
            <span className={`text-[12px] font-semibold mb-3 ${isRequired && !fileState ? 'text-red-400' : 'text-gray-400'}`}>Dosya seçiniz</span>
            <div className={`px-5 py-2.5 rounded-lg text-[12px] font-bold shadow-sm pointer-events-none transition-colors ${isRequired && !fileState ? 'bg-red-500 text-white group-hover:bg-red-600' : 'bg-[#0052cc] text-white group-hover:bg-blue-700'}`}>
              <CloudUpload className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> Seç
            </div>
            <div className={`w-full h-8 mt-3 rounded-md flex items-center justify-center text-[10px] font-bold pointer-events-none ${isRequired && !fileState ? 'bg-red-100 text-red-500' : 'bg-[#f4f5f7] text-[#6b778c]'}`}>
              <CloudUpload className="w-3 h-3 mr-1" /> Dosya Seç
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full pb-10 max-w-5xl mx-auto">
      {/* Header */}
      {!isSetupComplete && (
        <div className="bg-[#fffbeb] border border-[#fcd34d] rounded-2xl p-5 flex items-start gap-4 shadow-sm mb-2">
          <div className="shrink-0 w-10 h-10 bg-[#fef3c7] rounded-full flex items-center justify-center">
            <Info className="w-5 h-5 text-[#d97706]" />
          </div>
          <div>
            <h3 className="text-[14px] font-extrabold text-[#92400e]">Kurulum Adımı 1/2</h3>
            <p className="text-[13px] font-medium text-[#b45309] mt-0.5 leading-relaxed">
              Lütfen sistemin kullanımına başlayabilmek için aşağıdaki zorunlu firma bilgilerini ve resmi evrakları tamamlayın. Eklenecek evraklar PDF formatında ve tarafınızdan onaylı olmalıdır.
            </p>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 lg:p-10">

        {/* Section 1 */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#172b4d] text-white flex items-center justify-center shrink-0 shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[18px] font-black text-[#172b4d]">Temel Firma Bilgileri</h2>
            <p className="text-[12.5px] font-medium text-[#6b778c] mt-1">Firmanızın temel bilgilerini giriniz. Bu bilgiler tüm resmi işlemlerinizde kullanılacaktır.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-12">
          <div className="flex flex-col gap-2">
            <label className={`text-[12.5px] font-extrabold flex items-center gap-2 ${!formData.vergiNo?.trim() ? 'text-red-500' : 'text-[#172b4d]'}`}>
              Vergi Kimlik Numarası
              {isSetupComplete ? (
                <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full border border-orange-100 flex items-center gap-1"><Lock className="w-3 h-3" /> Değiştirilemez</span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full border border-green-100">Düzenlenebilir</span>
              )}
            </label>
            {isSetupComplete ? (
              <>
                <div className="relative">
                  <input
                    name="vergiNo" value={formData.vergiNo} readOnly
                    type="text"
                    className="w-full h-12 px-4 pr-10 text-[14px] font-semibold rounded-xl border-2 border-gray-200 bg-gray-50 text-[#172b4d] outline-none cursor-not-allowed"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] font-semibold text-orange-500 flex items-center gap-1.5 mt-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Bu alan değiştirilemez. Düzeltme için destek talebi oluşturun.
                </p>
              </>
            ) : (
              <input
                name="vergiNo" value={formData.vergiNo} onChange={handleChange}
                type="text" placeholder="10 Haneli VKN" maxLength={10}
                className={getInputClass(formData.vergiNo)}
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className={`text-[12.5px] font-extrabold flex items-center gap-2 ${!formData.firmaUnvani?.trim() ? 'text-red-500' : 'text-[#172b4d]'}`}>
              Firma Ünvanı
              {isSetupComplete ? (
                <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full border border-orange-100 flex items-center gap-1"><Lock className="w-3 h-3" /> Değiştirilemez</span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full border border-green-100">Düzenlenebilir</span>
              )}
            </label>
            {isSetupComplete ? (
              <>
                <div className="relative">
                  <input
                    name="firmaUnvani" value={formData.firmaUnvani} readOnly
                    type="text"
                    className="w-full h-12 px-4 pr-10 text-[14px] font-semibold rounded-xl border-2 border-gray-200 bg-gray-50 text-[#172b4d] outline-none cursor-not-allowed"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] font-semibold text-orange-500 flex items-center gap-1.5 mt-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Hukuki gereklilik nedeniyle bu alan değiştirilemez.
                </p>
              </>
            ) : (
              <input
                name="firmaUnvani" value={formData.firmaUnvani} onChange={handleChange}
                type="text" placeholder="Resmi Firma Ünvanı"
                className={getInputClass(formData.firmaUnvani)}
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className={`text-[12.5px] font-extrabold ${!formData.sektor?.trim() ? 'text-red-500' : 'text-[#172b4d]'}`}>Sektör</label>
            <select
              name="sektor" value={formData.sektor} onChange={handleChange}
              className={getSelectClass(formData.sektor)}
            >
              <option value="">Seçiniz</option>
              {SEKTORLER.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className={`text-[12.5px] font-extrabold ${!formData.calisanSayisi?.trim() || formData.calisanSayisi === '0' ? 'text-red-500' : 'text-[#172b4d]'}`}>Çalışan Sayısı</label>
              <input
                name="calisanSayisi" value={formData.calisanSayisi} onChange={handleChange}
                type="number" placeholder="0"
                className={getInputClass(formData.calisanSayisi === '0' ? '' : formData.calisanSayisi)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={`text-[12.5px] font-extrabold ${!formData.subeSayisi?.trim() || formData.subeSayisi === '0' ? 'text-red-500' : 'text-[#172b4d]'}`}>Şube Sayısı</label>
              <input
                name="subeSayisi" value={formData.subeSayisi} onChange={handleChange}
                type="number" placeholder="0"
                className={getInputClass(formData.subeSayisi === '0' ? '' : formData.subeSayisi)}
              />
            </div>
          </div>
        </div>


        {/* Section 2 */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#172b4d] text-white flex items-center justify-center shrink-0 shadow-md">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[18px] font-black text-[#172b4d] mt-1">Adres ve İletişim Bilgileri</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6 mb-6">
          <div className="flex flex-col gap-2">
            <label className={`text-[12.5px] font-extrabold ${!formData.il?.trim() ? 'text-red-500' : 'text-[#172b4d]'}`}>İl</label>
            <select
              name="il" value={formData.il} onChange={handleChange}
              disabled={loadingProvinces}
              className={getSelectClass(formData.il)}
            >
              <option value="">İl Seçiniz</option>
              {provinces.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className={`text-[12.5px] font-extrabold ${!formData.ilce?.trim() ? 'text-red-500' : 'text-[#172b4d]'}`}>İlçe</label>
            <select
              name="ilce" value={formData.ilce} onChange={handleChange}
              disabled={!formData.il || loadingDistricts}
              className={getSelectClass(formData.ilce)}
            >
              <option value="">İlçe Seçiniz</option>
              {districts.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className={`text-[12.5px] font-extrabold ${!formData.mahalle?.trim() ? 'text-red-500' : 'text-[#172b4d]'}`}>Mahalle</label>
            <select
              name="mahalle" value={formData.mahalle} onChange={handleChange}
              disabled={!formData.ilce || loadingNeighborhoods}
              className={getSelectClass(formData.mahalle)}
            >
              <option value="">Mahalle Seçiniz</option>
              {neighborhoods.map((n: any) => <option key={n.id} value={n.name}>{n.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-x-4 gap-y-6 mb-6">
          <div className="flex flex-col gap-2">
            <label className={`text-[12.5px] font-extrabold ${!formData.adres?.trim() ? 'text-red-500' : 'text-[#172b4d]'}`}>Adres</label>
            <input
              name="adres" value={formData.adres} onChange={handleChange}
              type="text" placeholder="Sokak / Cadde / No"
              className={getInputClass(formData.adres)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={`text-[12.5px] font-extrabold ${!formData.postaKodu?.trim() ? 'text-red-500' : 'text-[#172b4d]'}`}>Posta Kodu</label>
            <input
              name="postaKodu" value={formData.postaKodu} onChange={handleChange}
              type="text" placeholder="00000" maxLength={5}
              className={getInputClass(formData.postaKodu)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6 mb-12">
          <div className="flex flex-col gap-2">
            <label className={`text-[12.5px] font-extrabold ${!formData.telefon?.trim() ? 'text-red-500' : 'text-[#172b4d]'}`}>Telefon</label>
            <input
              name="telefon" value={formData.telefon} onChange={handlePhoneChange}
              type="text" placeholder="05XX XXX XX XX"
              className={getInputClass(formData.telefon)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={`text-[12.5px] font-extrabold ${!formData.ePosta?.trim() ? 'text-red-500' : 'text-[#172b4d]'}`}>E-Posta</label>
            <input
              name="ePosta" value={formData.ePosta} onChange={handleChange}
              type="email" placeholder="info@firma.com"
              className={getInputClass(formData.ePosta)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-extrabold text-[#172b4d]">Web Sitesi <span className="text-gray-400 font-medium">(Opsiyonel)</span></label>
            <input
              name="webSitesi" value={formData.webSitesi} onChange={handleChange}
              type="text" placeholder="www.firma.com"
              className={getInputClass(formData.webSitesi, false)}
            />
          </div>
        </div>


        {/* Section 3 - Evraklar */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#172b4d] text-white flex items-center justify-center shrink-0 shadow-md">
            <Folder className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[18px] font-black text-[#172b4d]">Resmi Firma Evrakları</h2>
            <p className="text-[12.5px] font-medium text-[#6b778c] mt-1">PDF formatında, maksimum 20MB</p>
          </div>
        </div>

        <div className="bg-[#fffbeb] border border-[#fcd34d] text-[#b45309] px-6 py-4 rounded-xl text-[12.5px] font-black flex items-center gap-3 mb-8 shadow-sm">
          <Info className="w-5 h-5 shrink-0" />
          <p>Onaylanmış evraklar güvenlik nedeniyle doğrudan değiştirilemez. Güncelleme için <strong>Güncelleme Talebi Oluştur</strong> butonunu kullanın. Admin onayından sonra yeni belge geçerli sayılacaktır.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <DosyaYuklemeKarti keyName="vergiLevhasi" label="Vergi Levhası" />
          <DosyaYuklemeKarti keyName="ticaretSicil" label="Ticaret Sicil Gazetesi" />
          <DosyaYuklemeKarti keyName="imzaSirkuleri" label="İmza Sirküleri" />
        </div>

        {/* Submit Button */}
        <div className="w-full rounded-2xl transition-all duration-300 overflow-hidden relative group">
          {isFormComplete() ? (
            <button
              onClick={handleSave}
              className="w-full bg-[#0052cc] hover:bg-blue-700 text-white font-black text-[15px] py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none"
            >
              ONAYLA VE DEVAM ET
            </button>
          ) : (
            <div className="w-full bg-[#f4f5f8] text-gray-500 font-extrabold text-[14px] py-4 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200 decoration-gray-400">
              <span className="w-4 h-4 rounded ring-2 ring-gray-400 flex items-center justify-center mr-1">
                <span className="w-2 h-2 bg-gray-400 rounded-sm"></span>
              </span>
              Lütfen Zorunlu Alanları (Web Sitesi hariç) Doldurunuz
            </div>
          )}
        </div>

      </div>
    </div>
  );
}