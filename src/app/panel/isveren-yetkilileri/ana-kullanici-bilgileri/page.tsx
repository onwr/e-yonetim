"use client";
import React, { useState, useEffect } from "react";
import { User, Folder, FileText, AlertTriangle, CheckCircle2, ShieldCheck, HelpCircle, Eye, RefreshCw, Smartphone, Download, UploadCloud, Info, Lock } from "lucide-react";
import { useOnboarding, type AnaKullaniciDataType } from "@/context/OnboardingContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Dosya yükleme durumu tipi
type FileState = null | { name: string; date: string; url: string };

const CONTRACTS = [
  {
    id: "kvkk",
    title: "KVKK Aydınlatma Metni & Rıza Beyanı",
    desc: "Kişisel verilerinizin hangi amaçlarla işleneceğini ve yasal haklarınızı açıklamaktadır.",
  },
  {
    id: "hizmet",
    title: "Kullanıcı Hizmet Sözleşmesi",
    desc: "E-Yönetim sistemini kullanma koşullarını ve tarafların hak ve yükümlülükleri içerir.",
  },
  {
    id: "iletisim",
    title: "Elektronik İletişim İzni",
    desc: "SMS, e-posta ve diğer dijital kanallar üzerinden bilgilendirme gönderilmesine izin verilmektedir.",
  },
  {
    id: "veri",
    title: "Kişisel Veri İşleme Taahhüdü",
    desc: "Veri sorumlusu sıfatıyla kişisel verilerin korunmasına ilişkin taahhütleri içerir.",
  }
];

export default function AnaKullaniciBilgileriPage() {
  const { setupStep, completeAnaKullaniciSetup, anaKullaniciData, setAnaKullaniciData } = useOnboarding();
  const router = useRouter();

  // --- FORM STATE: Local copy prevents immediate context mutation before Save ---
  const contextFormData = anaKullaniciData?.formData || {
    adSoyad: "", tckn: "", unvan: "", telefon: "", email: "",
  };
  const files = anaKullaniciData?.files || {
    kimlikOn: null, kimlikArka: null, vekaletname: null,
  };
  const contractsStatus = anaKullaniciData?.contractsStatus || {
    kvkk: { read: false, approved: false },
    hizmet: { read: false, approved: false },
    iletisim: { read: false, approved: false },
    veri: { read: false, approved: false },
  };

  // Local state — only saved to context when user clicks "Kaydet"
  const [localFormData, setLocalFormData] = useState({ ...contextFormData });

  // Keep local in sync if context changes from outside (e.g. first load)
  useEffect(() => {
    setLocalFormData({ ...contextFormData });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anaKullaniciData]);

  // Shorthand so rest of file can use formData unchanged
  const formData = localFormData;

  const setFiles = (updater: React.SetStateAction<AnaKullaniciDataType["files"]>) => {
    setAnaKullaniciData((prev) => ({
      ...prev,
      files: typeof updater === "function" ? updater(prev.files) : updater,
    }));
  };

  const setContractsStatus = (updater: React.SetStateAction<AnaKullaniciDataType["contractsStatus"]>) => {
    setAnaKullaniciData((prev) => ({
      ...prev,
      contractsStatus: typeof updater === "function" ? updater(prev.contractsStatus) : updater,
    }));
  };

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) value = value.substring(0, 4) + " " + value.substring(4);
    if (value.length > 8) value = value.substring(0, 8) + " " + value.substring(8);
    if (value.length > 11) value = value.substring(0, 11) + " " + value.substring(11, 13);
    setLocalFormData(prev => ({ ...prev, telefon: value.trim() }));
  };

  const handleFileUpload = async (key: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      }
    }
  };

  const toggleContract = (id: string) => {
    let wasApproved = false;
    let isNowApproved = false;

    setContractsStatus((prev: any) => {
      const current = prev[id];
      if (!current.read) return prev; // okunmadıysa tıklanamaz
      wasApproved = current.approved;
      isNowApproved = !wasApproved;
      return { ...prev, [id]: { ...current, approved: isNowApproved } };
    });

    // Side-effect updater fonksiyonu (setState func içi) dışında çağrılmalı:
    // (JavaScript'in asenkron closuresundan ötürü state'in en son hesaplanan isNowApproved değerine bakarız)
    setTimeout(() => {
      if (isNowApproved) toast.success("Sözleşme onaylandı.");
    }, 0);
  };

  const readContract = (id: string) => {
    let wasRead = false;
    
    setContractsStatus((prev: any) => {
      const current = prev[id];
      wasRead = current.read;
      return { ...prev, [id]: { ...current, read: true } };
    });

    // Side-effect
    setTimeout(() => {
      if (!wasRead) toast.success("Sözleşme okundu olarak işaretlendi, lütfen onaylayınız.");
    }, 0);
  };

  const getInputClass = (val: string, isRequired: boolean = true) => {
    if (isRequired && (!val || val.trim() === "")) {
      return "w-full h-12 px-4 text-[14px] font-semibold rounded-xl border-2 outline-none transition-all placeholder:font-medium text-[#172b4d] border-red-300 bg-red-50 placeholder:text-red-300/70 focus:border-[#0052cc] focus:bg-white focus:ring-4 focus:ring-[#0052cc]/10 focus:placeholder-gray-300";
    }
    return "w-full h-12 px-4 text-[14px] font-semibold rounded-xl border-2 border-gray-100 outline-none focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/10 transition-all placeholder:font-medium placeholder:text-gray-300 text-[#172b4d]";
  };

  const isFormComplete = () => {
    const isFieldsOk = Object.values(formData).every(val => val.trim() !== "");
    const isFilesOk = Object.values(files).every(file => file !== null);
    const isContractsOk = Object.values(contractsStatus).every(val => val.approved === true);
    return isFieldsOk && isFilesOk && isContractsOk;
  };

  const approvedContractsCount = Object.values(contractsStatus).filter(c => c.approved).length;

  const handleSave = () => {
    if (!isFormComplete()) {
      toast.error("Lütfen zorunlu alanları, belgeleri ve sözleşmeleri eksiksiz doldurun.");
      return;
    }
    
    // Commit local form changes to context
    setAnaKullaniciData((prev: any) => ({ ...prev, formData: localFormData }));
    
    toast.success("Ana Kullanıcı bilgileri kaydedildi!");
    if (setupStep === 1) {
      completeAnaKullaniciSetup();
      toast.success("Tebrikler! Kurulum başarıyla tamamlandı, tüm özellikler aktif.", {
        icon: <ShieldCheck className="w-5 h-5 text-green-500" />
      });
      router.push("/panel");
    }
  };


  // --- COMPONENT HELPERS ---
  const DosyaYuklemeKarti = ({ keyName, label }: { keyName: keyof typeof files, label: string }) => {
    const fileState = files[keyName];
    const isRequired = true;
    const emptyBorderClass = isRequired && !fileState ? "border-red-300 bg-red-50 hover:bg-red-100" : "border-blue-200 bg-white hover:bg-blue-50/30";

    return (
      <div className="flex flex-col gap-2 relative">
        <label className={`text-[12.5px] font-extrabold ${isRequired && !fileState ? 'text-red-500' : 'text-[#172b4d]'}`}>
          {label}
        </label>
        
        {fileState ? (
          // YÜKLENMİŞ HALİ (Yeşil Başarılı Kart)
          <div className="border border-green-500 bg-[#effcf3] rounded-3xl p-6 flex flex-col items-center justify-center min-h-[180px] animate-fade-in relative group border-dashed">
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
          // BOŞ HALİ (Mavi Çizgili Yükleme Alanı)
          <div className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center min-h-[180px] transition-colors cursor-pointer relative ${emptyBorderClass}`}>
            <input 
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFileUpload(keyName, e)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${isRequired && !fileState ? 'bg-red-100 text-red-500' : 'text-gray-300'}`}>
              <UploadCloud className="w-10 h-10" />
            </div>
            <span className={`text-[12px] font-bold mb-4 ${isRequired && !fileState ? 'text-red-400' : 'text-gray-400'}`}>Dosya seçiniz</span>
            
            <div className="w-full flex flex-col gap-2">
              <div className={`w-full h-9 rounded-lg flex items-center justify-center gap-2 text-[12.5px] font-extrabold shadow-sm pointer-events-none ${isRequired && !fileState ? 'bg-red-500 text-white' : 'bg-[#0052cc] text-white'}`}>
                <UploadCloud className="w-4 h-4" /> Seç
              </div>
              <div className={`w-full h-9 rounded-lg flex items-center justify-center gap-2 text-[12.5px] font-extrabold shadow-sm pointer-events-none ${isRequired && !fileState ? 'bg-red-100 text-red-500' : 'bg-gray-400 text-white'}`}>
                <UploadCloud className="w-4 h-4" /> Dosya Seç
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-slide-up pb-20 w-full max-w-[1200px] mx-auto pt-4">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
      `}} />

      {/* Uyarı Banner'ı (Step 1 ise çıkar) */}
      {setupStep === 1 && (
        <div className="w-full bg-[#fffbeb] border border-[#fcd34d] rounded-2xl p-6 lg:p-8 flex items-start gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#f59e0b]"></div>
          <div className="w-14 h-14 rounded-2xl bg-[#fef3c7] border border-[#fcd34d] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-7 h-7 text-[#d97706]" />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-black text-[#92400e]">Ana Kullanıcı Bilgilerinizi Tamamlayınız</h2>
              <span className="text-[13px] font-extrabold text-[#d97706] bg-[#fef3c7] px-3 py-1 rounded-lg">2 adım:</span>
            </div>
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mt-1">
              <p className="text-[13.5px] font-medium text-[#b45309] leading-relaxed max-w-2xl">
                Diğer panele erişebilmeniz için önce <strong>iletişim bilgilerinizi kaydedin</strong>, ardından <strong>tüm zorunlu sözleşmeleri okuyup onaylayın.</strong>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                 <div className="bg-[#fef3c7] text-[#d97706] text-[12px] font-bold px-4 py-2 rounded-xl flex items-start gap-2 max-w-[180px]">
                   <span className="mt-0.5">1.</span> <span>İletişim bilgilerini kaydet</span>
                 </div>
                 <div className="bg-[#fef3c7] text-[#d97706] text-[12px] font-bold px-4 py-2 rounded-xl flex items-start gap-2 max-w-[180px]">
                   <span className="mt-0.5">2.</span> <span>Sözleşmeleri onayla</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[24px] shadow-sm border border-gray-200/60 p-6 lg:p-10 w-full relative">
        {/* Section 1 - Kimlik */}
        <div className="flex items-start gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-[#172b4d] text-white flex items-center justify-center shrink-0 shadow-md">
            <User className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[20px] font-black text-[#172b4d]">Ana Kullanıcı Bilgileri</h2>
            <p className="text-[13px] font-medium text-[#6b778c] mt-1">T.C. Kimlik No ve Ad Soyad güvenlik nedeniyle değiştirilemez. Telefon ve e-posta değişikliklerinde doğrulama kodu göndereceğiz.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 mb-6">
          <div className="flex flex-col gap-2 relative">
             <div className="flex items-center gap-2">
               <label className="text-[12.5px] font-extrabold text-[#172b4d]">Ad Soyad</label>
               {contextFormData.adSoyad ? (
                 <span className="text-[10px] font-bold text-[#e67e22] flex items-center gap-1.5"><Lock className="w-3 h-3"/> Değiştirilemez</span>
               ) : (
                 <span className="text-[10px] font-bold text-red-500">* Zorunlu Alan</span>
               )}
             </div>
             <div className="relative">
               <input 
                  name="adSoyad" value={formData.adSoyad} disabled={Boolean(contextFormData.adSoyad)}
                  onChange={handleChange}
                  type="text" placeholder="Ad Soyad"
                  className={contextFormData.adSoyad 
                    ? "w-full h-12 px-4 pr-10 text-[14px] font-semibold rounded-xl border border-gray-100 outline-none transition-all text-[#172b4d] bg-[#f8f9fa] cursor-not-allowed" 
                    : getInputClass(formData.adSoyad)}
                />
                {contextFormData.adSoyad && <Lock className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />}
             </div>
             {contextFormData.adSoyad && (
               <div className="flex items-center gap-1.5 mt-0.5">
                  <AlertTriangle className="w-3 h-3 text-[#e67e22]" />
                  <span className="text-[10.5px] font-bold text-[#e67e22]">Değişiklik için destek talebi oluşturun.</span>
               </div>
             )}
          </div>

          <div className="flex flex-col gap-2 relative">
             <div className="flex items-center gap-2">
               <label className="text-[12.5px] font-extrabold text-[#172b4d]">T.C. Kimlik No</label>
               {contextFormData.tckn ? (
                 <span className="text-[10px] font-bold text-[#e67e22] flex items-center gap-1.5"><Lock className="w-3 h-3"/> Değiştirilemez</span>
               ) : (
                 <span className="text-[10px] font-bold text-red-500">* Zorunlu Alan</span>
               )}
             </div>
             <div className="relative">
               <input 
                  name="tckn" value={formData.tckn} disabled={Boolean(contextFormData.tckn)}
                  onChange={(e) => {
                    // Sadece rakamlara izin ver
                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setLocalFormData(prev => ({ ...prev, tckn: val }));
                  }}
                  type="text" placeholder="11 Haneli TCKN" maxLength={11}
                  className={contextFormData.tckn 
                    ? "w-full h-12 px-4 pr-10 text-[14px] font-semibold rounded-xl border border-gray-100 outline-none transition-all text-[#172b4d] bg-[#f8f9fa] cursor-not-allowed"
                    : getInputClass(formData.tckn)}
                />
                {contextFormData.tckn && <Lock className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />}
             </div>
             {contextFormData.tckn && (
               <div className="flex items-center gap-1.5 mt-0.5">
                  <AlertTriangle className="w-3 h-3 text-[#e67e22]" />
                  <span className="text-[10.5px] font-bold text-[#e67e22]">Hukuki gereklilik nedeniyle değiştirilemez.</span>
               </div>
             )}
          </div>

          <div className="flex flex-col gap-2">
             <label className={`text-[12.5px] font-extrabold h-[22px] flex items-center ${!formData.unvan?.trim() ? 'text-red-500' : 'text-[#172b4d]'}`}>Ünvanı</label>
             <input 
                name="unvan" value={formData.unvan} onChange={handleChange}
                type="text" placeholder="Yönetim Kurulu Başkanı vb."
                className={getInputClass(formData.unvan)}
              />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2">
               <Smartphone className={`w-3.5 h-3.5 ${!formData.telefon?.trim() ? 'text-red-500' : 'text-[#172b4d]'}`}/>
               <label className={`text-[12.5px] font-extrabold ${!formData.telefon?.trim() ? 'text-red-500' : 'text-[#172b4d]'}`}>Telefon</label>
               <span className="text-[9px] font-bold text-[#0052cc] bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1 border border-blue-100">Kaydetmek için SMS doğrulaması gerekir</span>
             </div>
             <input 
                name="telefon" value={formData.telefon} onChange={handlePhoneChange}
                type="text" placeholder="05XX XXX XX XX"
                className={getInputClass(formData.telefon)}
              />
          </div>
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2">
               <Info className={`w-3.5 h-3.5 ${!formData.email?.trim() ? 'text-red-500' : 'text-[#172b4d]'}`}/>
               <label className={`text-[12.5px] font-extrabold ${!formData.email?.trim() ? 'text-red-500' : 'text-[#172b4d]'}`}>E-Posta</label>
               <span className="text-[9px] font-bold text-[#0052cc] bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1 border border-blue-100">Kaydetmek için SMS doğrulaması gerekir</span>
             </div>
             <input 
                name="email" value={formData.email} onChange={handleChange}
                type="email" placeholder="yetkili@firma.com"
                className={getInputClass(formData.email)}
              />
          </div>
        </div>

        <div className="w-full bg-[#f0f4ff] border border-blue-100 rounded-xl p-3 flex items-center gap-3 mb-10">
          <Info className="w-4 h-4 text-[#0052cc] shrink-0" />
          <p className="text-[12px] font-bold text-[#0052cc]">Telefon veya e-posta değişikliklerini kaydetmek için numarasına 6 haneli bir doğrulama kodu gönderilecektir.</p>
        </div>


        {/* Section 2 - Kimlik Belgeleri */}
        <div className="flex items-start gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-[#172b4d] text-white flex items-center justify-center shrink-0 shadow-md">
            <Folder className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[20px] font-black text-[#172b4d]">Kimlik Belgeleri</h2>
            <p className="text-[13px] font-medium text-[#6b778c] mt-1">PDF, JPG, PNG — maks. 20MB</p>
          </div>
        </div>

        <div className="bg-[#fffbeb] border border-[#fcd34d] text-[#b45309] px-6 py-4 rounded-xl text-[12.5px] font-black flex items-center gap-3 mb-8 shadow-sm">
           <ShieldCheck className="w-5 h-5 shrink-0" />
           <p>Onaylanmış kimlik belgeleri doğrudan değiştirilemez. Güncelleme için <strong>Güncelleme Talebi Oluştur</strong> butonunu kullanın. Admin onayından sonra yeni belge geçerli sayılacaktır.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
           <DosyaYuklemeKarti keyName="kimlikOn" label="T.C. Kimlik Kartı (Ön Yüz)" />
           <DosyaYuklemeKarti keyName="kimlikArka" label="T.C. Kimlik Kartı (Arka Yüz)" />
           <DosyaYuklemeKarti keyName="vekaletname" label="Vekâletname Belgesi (PDF)" />
        </div>

        {/* Section 3 - Zorunlu Sözleşmeler */}
        <div className="flex items-start gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-[#172b4d] text-white flex items-center justify-center shrink-0 shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[20px] font-black text-[#172b4d]">Zorunlu Sözleşmeler</h2>
            <p className="text-[13px] font-medium text-[#6b778c] mt-1">Sistem kullanımı için aşağıdaki tüm sözleşmelerin okunması ve onaylanması zorunludur. Onay tarih-saat bilgisi kayıt altına alınmaktadır.</p>
          </div>
        </div>
        
        <div className="text-[11px] font-bold text-gray-400 mb-6 border-b border-gray-100 pb-2">
          {approvedContractsCount} / 4 sözleşme onaylandı
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {CONTRACTS.map((contract) => {
            const status = contractsStatus[contract.id];
            const isRead = status?.read || false;
            const isApproved = status?.approved || false;

            return (
              <div key={contract.id} className={`border-2 rounded-2xl p-6 relative flex flex-col items-center text-center transition-all ${isApproved ? "border-green-400 bg-[#f4fbf7]" : "border-gray-100 bg-white"}`}>
                
                {/* Badge */}
                <div className={`absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded ${isApproved ? "bg-green-100 text-green-700" : "bg-red-50 text-red-500"}`}>
                  {isApproved ? "✓ Onaylandı" : "* Zorunlu"}
                </div>
                
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${isApproved ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  {isApproved ? <ShieldCheck className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                </div>
                <h4 className="text-[14.5px] font-black text-[#172b4d] mb-2">{contract.title}</h4>
                <p className="text-[12.5px] font-medium text-[#6b778c] mb-6 h-10 overflow-hidden px-4">{contract.desc}</p>
                
                <div className="w-full flex flex-col gap-2 mt-auto">
                  <button 
                    onClick={() => toggleContract(contract.id)}
                    disabled={!isRead}
                    className={`w-full font-black text-[13px] py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                      isApproved 
                      ? "bg-green-500 text-white shadow-md shadow-green-500/20" 
                      : isRead 
                        ? "bg-red-500 text-white shadow-md shadow-red-500/20 animate-pulse hover:bg-red-600" 
                        : "bg-[#f4f5f8] text-[#a0a3ab] cursor-not-allowed"
                    }`}
                  >
                    {isApproved ? <><CheckCircle2 className="w-4 h-4" /> ONAYLANDI</> : isRead ? <><CheckCircle2 className="w-4 h-4" /> ONAYLAMAK İÇİN TIKLAYIN</> : <><CheckCircle2 className="w-4 h-4 opacity-50" /> Önce Okuyun</>}
                  </button>
                  <div className="flex w-full gap-2">
                    <button onClick={() => readContract(contract.id)} className="flex-1 border-2 border-gray-100 bg-white hover:bg-gray-50 text-gray-600 font-bold text-[12px] py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <Eye className="w-3.5 h-3.5" /> Oku / İncele
                    </button>
                    <button className="flex-1 border-2 border-gray-100 bg-white hover:bg-gray-50 text-gray-600 font-bold text-[12px] py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <Download className="w-3.5 h-3.5" /> PDF İndir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Son onayı veren Info */}
        {!isFormComplete() && (
          <div className="bg-[#fffbeb] border border-[#fcd34d] text-[#b45309] px-6 py-4 rounded-xl text-[13px] font-black flex items-center gap-3 mb-6 shadow-sm">
             <AlertTriangle className="w-5 h-5 shrink-0" />
             <p>Devam edebilmek için tüm form alanlarını doldurup, gerekli belgeleri yükleyin ve sözleşmeleri onaylayınız.</p>
          </div>
        )}

        <button 
          disabled={!isFormComplete()}
          className={`w-full font-black text-[14px] py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mb-4
            ${isFormComplete() ? "bg-gray-200 text-gray-400 hidden" : "bg-[#f4f5f8] text-gray-400 cursor-not-allowed border border-gray-200"}`
          }
        >
          <FileText className="w-4 h-4" /> Sözleşmeleri Onaylayıp Kaydet
        </button>

        <button 
          onClick={handleSave}
          disabled={!isFormComplete()}
          className={`w-full font-black text-[15px] py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg
            ${isFormComplete() ? "bg-[#8385e0] hover:bg-[#6c6fc9] text-white hover:shadow-xl hover:-translate-y-0.5" : "bg-[#a6a8e8] text-white/70 cursor-not-allowed"}`
          }
        >
          Değişiklikleri Doğrula ve Kaydet
        </button>
      </div>
    </div>
  );
}
