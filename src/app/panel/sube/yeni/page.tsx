"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Building2, Store, MapPin, CheckCircle2, ChevronDown } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { toast } from "sonner";
import vergiDaireleriJson from "@/utils/vergidaireleri.json";

type VergiDairesiKayit = { id: number; il: string; ilce: string; isim: string };

const SEKTORLER = [
  "Yapı İnşaat Sektörü", "Tekstil", "Gıda", "Lojistik", "Yazılım & BT", "Sağlık", "Eğitim", "Diğer"
];

const SUBE_TURLERI = [
  "Merkez", "Depo", "Şantiye", "Ofis"
];

export default function SubeEklePage() {
  const { firmaData, anaKullaniciData } = useOnboarding();
  
  const firmaUnvani = firmaData?.formData?.firmaUnvani || "";
  const adSoyad = anaKullaniciData?.formData?.adSoyad || "";

  const [formData, setFormData] = useState({
    anaSube: firmaUnvani,
    subeTuru: "",
    hizmetSektoru: "",
    subeAdi: "",
    acilisTarihi: "",
    subeYetkilisi: adSoyad, // Default value assigned to main user
    masrafKodu: "",
    vergiKno: "",
    vergiDairesi: "",
    sgkNo: "",
    calisanSayisi: "",
    il: "",
    ilce: "",
    mahalle: "",
    adres: "",
    postaKodu: "",
    telefon: "",
    ePosta: "",
    webSitesi: ""
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);

  const taxOffices = useMemo(() => {
    const list = vergiDaireleriJson as VergiDairesiKayit[];
    return [...list].sort(
      (a, b) =>
        a.il.localeCompare(b.il, "tr") ||
        a.ilce.localeCompare(b.ilce, "tr") ||
        a.isim.localeCompare(b.isim, "tr")
    );
  }, []);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  // Modal ve Listeler için State'ler
  const [isYetkiliModalOpen, setIsYetkiliModalOpen] = useState(false);
  const [yetkiliListesi, setYetkiliListesi] = useState<string[]>([
    "Daha Sonra Belirlenecek",
    adSoyad
  ]);
  const [yetkiliSaving, setYetkiliSaving] = useState(false);
  const [newYetkili, setNewYetkili] = useState({ adSoyad: "", tckn: "", telefon: "", ePosta: "", sifre: "" });

  // API Fetches
  useEffect(() => {
    setLoadingProvinces(true);
    fetch("https://turkiyeapi.dev/api/v1/provinces")
      .then(res => res.json())
      .then(data => {
        if (data.status === "OK") {
          setProvinces(data.data.sort((a: any, b: any) => a.name.localeCompare(b.name, 'tr-TR')));
        }
      })
      .finally(() => setLoadingProvinces(false));
  }, []);

  useEffect(() => {
    if (!formData.il) {
      setDistricts([]);
      setNeighborhoods([]);
      return;
    }
    const selectedProvince = provinces.find(p => p.name === formData.il);
    if (selectedProvince) {
      setLoadingDistricts(true);
      fetch(`https://turkiyeapi.dev/api/v1/provinces/${selectedProvince.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "OK") {
            setDistricts(data.data.districts.sort((a: any, b: any) => a.name.localeCompare(b.name, 'tr-TR')));
          }
        })
        .finally(() => setLoadingDistricts(false));
    }
  }, [formData.il, provinces]);

  useEffect(() => {
    if (!formData.ilce) {
      setNeighborhoods([]);
      return;
    }
    const selectedDistrict = districts.find(d => d.name === formData.ilce);
    if (selectedDistrict) {
      setLoadingNeighborhoods(true);
      fetch(`https://turkiyeapi.dev/api/v1/districts/${selectedDistrict.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "OK") {
            setNeighborhoods(data.data.neighborhoods.sort((a: any, b: any) => a.name.localeCompare(b.name, 'tr-TR')));
          }
        })
        .finally(() => setLoadingNeighborhoods(false));
    }
  }, [formData.ilce, districts]);


  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "subeYetkilisi" && value === "YENI_EKLE") {
      setIsYetkiliModalOpen(true);
      return; // form verisini güncelleme, modalı aç
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "il" && { ilce: "", mahalle: "" }),
      ...(name === "ilce" && { mahalle: "" })
    }));
  };

  const handleModalPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    let formatted = val;
    if (val.length > 3) formatted = val.slice(0, 4) + " " + val.slice(4);
    if (val.length > 6) formatted = formatted.slice(0, 8) + " " + formatted.slice(8);
    if (val.length > 8) formatted = formatted.slice(0, 11) + " " + formatted.slice(11);
    setNewYetkili(prev => ({ ...prev, telefon: formatted }));
  };

  const handleAddYetkili = () => {
    if (!newYetkili.adSoyad.trim()) {
      toast.error("Lütfen Yetkili Adı Soyadı giriniz.");
      return;
    }
    if (!newYetkili.tckn || newYetkili.tckn.length !== 11) {
      toast.error("Geçerli bir 11 haneli TCKN giriniz.");
      return;
    }
    if (!newYetkili.ePosta.trim()) {
      toast.error("E-Posta adresi zorunludur.");
      return;
    }
    if (!newYetkili.sifre || newYetkili.sifre.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setYetkiliSaving(true);
    void (async () => {
      try {
        const res = await fetch("/api/v1/yetkililer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            adSoyad: newYetkili.adSoyad,
            tckn: newYetkili.tckn,
            telefon: newYetkili.telefon,
            eposta: newYetkili.ePosta,
            sifre: newYetkili.sifre,
            unvan: "Şube Yetkilisi",
            scope: "sube",
          }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          const msg = json?.error?.message || json?.message || `Sunucu hatası: ${res.status}`;
          toast.error(`Yetkili eklenemedi: ${msg}`);
          return;
        }
        setYetkiliListesi(prev => [...prev, newYetkili.adSoyad]);
        setFormData(prev => ({ ...prev, subeYetkilisi: newYetkili.adSoyad }));
        setIsYetkiliModalOpen(false);
        setNewYetkili({ adSoyad: "", tckn: "", telefon: "", ePosta: "", sifre: "" });
        toast.success("Yeni yetkili başarıyla eklendi ve şube profiline atandı!");
      } catch (err: any) {
        toast.error(err?.message || "Bağlantı hatası. Lütfen tekrar deneyin.");
      } finally {
        setYetkiliSaving(false);
      }
    })();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    let formatted = val;
    if (val.length > 3) formatted = val.slice(0, 4) + " " + val.slice(4);
    if (val.length > 6) formatted = formatted.slice(0, 8) + " " + formatted.slice(8);
    if (val.length > 8) formatted = formatted.slice(0, 11) + " " + formatted.slice(11);
    setFormData(prev => ({ ...prev, telefon: formatted }));
  };

  const handleSave = () => {
    if (!formData.subeAdi.trim()) {
      toast.error("Lütfen bir Şube Adı giriniz!");
      return;
    }
    
    const newSube = {
      ...formData,
      id: "sube_" + Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    void (async () => {
      try {
        const response = await fetch("/api/v1/subeler", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(newSube),
        });
        const json = await response.json().catch(() => null);
        if (!response.ok) {
          const msg = json?.error?.message || json?.message || `Sunucu hatası: ${response.status}`;
          toast.error(`Şube kaydedilemedi: ${msg}`);
          return;
        }
      } catch (err: any) {
        toast.error(err?.message || "Bağlantı hatası. Lütfen tekrar deneyin.");
        return;
      }

      toast.success("Şube bilgileri başarıyla kaydedildi!");
      setFormData({
        anaSube: firmaUnvani,
        subeTuru: "",
        hizmetSektoru: "",
        subeAdi: "",
        acilisTarihi: "",
        subeYetkilisi: adSoyad,
        masrafKodu: "",
        vergiKno: "",
        vergiDairesi: "",
        sgkNo: "",
        calisanSayisi: "",
        il: "",
        ilce: "",
        mahalle: "",
        adres: "",
        postaKodu: "",
        telefon: "",
        ePosta: "",
        webSitesi: "",
      });
    })();
  };

  const getInputClass = () => {
    return "w-full h-12 px-4 text-[14px] font-semibold rounded-xl border-2 border-gray-200 outline-none focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10 transition-all placeholder:font-medium placeholder:text-gray-400 text-[#172b4d]";
  };
  
  const getSelectClass = () => {
    return "w-full h-12 pl-4 pr-10 text-[14px] font-semibold rounded-xl border-2 border-gray-200 outline-none focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10 transition-all text-[#172b4d] appearance-none cursor-pointer";
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full pb-10 max-w-5xl mx-auto font-sans">
      
      {/* Top Breadcrumb */}
      <h1 className="text-[14px] mb-2">
        <span className="text-[#6b778c] font-semibold">Şube İşlemleri / </span>
        <span className="text-[#ef5a28] font-bold">Yeni Şube Ekle</span>
      </h1>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-50 p-8 lg:p-10 mb-8 w-full">
        
        {/* Section 1: Ana Firma Bilgileri */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-start gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#0b1b42] text-white flex items-center justify-center shrink-0 shadow-md border border-[#1e2f58]">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="flex flex-col space-y-1">
              <h2 className="text-[19px] font-black tracking-tight text-[#0b1b42]">Ana Firma Bilgileri</h2>
              <p className="text-[12.5px] font-semibold text-[#8a94a6] leading-relaxed max-w-3xl">
                Firmanız adına sisteme tanımlı yetkili kişiye ait ad, soyad, iletişim ve görev bilgileri bu modül üzerinden tek noktadan yönetilebilir. Bilgilerin güncel tutulması, tüm resmi işlemlerin ve sistem bildirimlerinin doğru muhataba zamanında ve eksiksiz ulaşmasını sağlar.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 max-w-4xl text-left">
            <label className="text-[13px] font-extrabold text-[#0b1b42]">Ana Şube</label>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-full relative flex-1">
                <select
                  name="anaSube" value={formData.anaSube} onChange={handleChange}
                  className={getSelectClass()}
                >
                  <option value={firmaUnvani}>{firmaUnvani}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                   <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <button className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold text-[14px] px-10 h-12 rounded-xl transition-all shadow-md active:scale-95 shrink-0 border-b-4 border-[#16a34a] w-full md:w-auto">
                Şube Ekle
              </button>
            </div>
            <span className="text-[11px] font-semibold text-gray-400">Alt Şube Eklemek İstediğiniz Ana Firmayı / Şubeyi Seçin</span>
          </div>
        </div>

        <div className="w-full h-px bg-gray-100 my-12" />

        {/* Section 2: Şube Bilgilerini Giriniz */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-start gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#0b1b42] text-white flex items-center justify-center shrink-0 shadow-md border border-[#1e2f58]">
              <Store className="w-7 h-7" />
            </div>
            <div className="flex flex-col space-y-1">
              <h2 className="text-[19px] font-black tracking-tight text-[#0b1b42]">Şube Bilgilerini Giriniz</h2>
              <p className="text-[12.5px] font-semibold text-[#8a94a6] leading-relaxed max-w-3xl">
                Firmanız adına sisteme tanımlı yetkili kişiye ait ad, soyad, iletişim ve görev bilgileri bu modül üzerinden tek noktadan yönetilebilir. Bilgilerin güncel tutulması, tüm resmi işlemlerin ve sistem bildirimlerinin doğru muhataba zamanında ve eksiksiz ulaşmasını sağlar.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            {/* Row 1 */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">Şube Türü</label>
              <div className="relative">
                <select name="subeTuru" value={formData.subeTuru} onChange={handleChange} className={getSelectClass()}>
                  <option value="">(Merkez / Depo / Şantiye / Ofis)</option>
                  {SUBE_TURLERI.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span className="text-[11px] font-semibold text-gray-400">En fazla 20 karakter, harf ve rakam içerebilir.</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">Şube Hizmet Sektörü</label>
              <div className="relative">
                <select name="hizmetSektoru" value={formData.hizmetSektoru} onChange={handleChange} className={getSelectClass()}>
                  <option value="">Seçiniz</option>
                  {SEKTORLER.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span className="text-[11px] font-semibold text-gray-400">En fazla 20 karakter, harf ve rakam içerebilir.</span>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">Şube Adınız</label>
              <input 
                type="text" name="subeAdi" value={formData.subeAdi} onChange={handleChange} 
                placeholder="Örn: ANKARA ŞUBE" className={getInputClass()} 
              />
              <span className="text-[11px] font-semibold text-gray-400">En fazla 20 karakter, harf ve rakam içerebilir.</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">Şube Açılış Tarihi</label>
              <input 
                type="date" name="acilisTarihi" value={formData.acilisTarihi} onChange={handleChange} 
                className={`${getInputClass()} text-gray-600`} 
              />
            </div>

            {/* Row 3 */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">Şube Yetkilisi</label>
              <div className="relative">
                <select name="subeYetkilisi" value={formData.subeYetkilisi} onChange={handleChange} className={`${getSelectClass()} text-blue-600 font-extrabold`}>
                  {yetkiliListesi.map(y => (
                    <option key={y} value={y} className="text-gray-800 font-semibold">{y}</option>
                  ))}
                  <option value="YENI_EKLE" className="text-white bg-[#0052cc] font-extrabold px-2 py-4 shadow-sm">+ Yeni Yetkili Ekle</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span className="text-[11px] font-semibold text-gray-400">En fazla 20 karakter, harf ve rakam içerebilir.</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">Şube Masraf Merkezi Kodu</label>
              <input 
                type="text" name="masrafKodu" value={formData.masrafKodu} onChange={handleChange} 
                placeholder="Örn: HM-0012" className={getInputClass()} 
              />
            </div>

            {/* Row 4 */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">Şube Vergi Kimlik Numarası</label>
              <input 
                type="text" name="vergiKno" value={formData.vergiKno} onChange={handleChange} 
                placeholder="123456789" className={getInputClass()} 
              />
              <span className="text-[11px] font-semibold text-gray-400">En fazla 20 karakter, harf ve rakam içerebilir.</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">Şube Vergi Kimlik Dairesi</label>
              <div className="relative">
                <select name="vergiDairesi" value={formData.vergiDairesi} onChange={handleChange} className={getSelectClass()}>
                  <option value="">Vergi dairesi seçiniz</option>
                  {taxOffices.map((t) => (
                    <option key={t.id} value={t.isim}>
                      {t.il} — {t.ilce} — {t.isim}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span className="text-[11px] font-semibold text-gray-400">Türkiye genelindeki vergi daireleri listesinden seçiniz.</span>
            </div>

            {/* Row 5 */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">SGK Sicil No</label>
              <input 
                type="text" name="sgkNo" value={formData.sgkNo} onChange={handleChange} 
                placeholder="01234567890123456789" className={getInputClass()} 
              />
              <span className="text-[11px] font-semibold text-gray-400">En fazla 26 karakter, harf ve rakam içerebilir.</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">Çalışan Sayısı</label>
              <input 
                type="number" name="calisanSayisi" value={formData.calisanSayisi} onChange={handleChange} 
                placeholder="1.450" className={getInputClass()} 
              />
            </div>
            
          </div>
        </div>

        <div className="w-full h-px bg-gray-100 my-12" />

        {/* Section 3: Adres ve İletişim Bilgileri */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-start gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#0b1b42] text-white flex items-center justify-center shrink-0 shadow-md border border-[#1e2f58]">
              <MapPin className="w-7 h-7" />
            </div>
            <div className="flex flex-col space-y-1">
              <h2 className="text-[19px] font-black tracking-tight text-[#0b1b42]">Adres ve İletişim Bilgileri</h2>
              <p className="text-[12.5px] font-semibold text-[#8a94a6] leading-relaxed max-w-3xl">
                Firmanız adına sisteme tanımlı yetkili kişiye ait ad, soyad, iletişim ve görev bilgileri bu modül üzerinden tek noktadan yönetilebilir. Bilgilerin güncel tutulması, tüm resmi işlemlerin ve sistem bildirimlerinin doğru muhataba zamanında ve eksiksiz ulaşmasını sağlar.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 mb-8">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">İl</label>
              <div className="relative">
                <select name="il" value={formData.il} onChange={handleChange} disabled={loadingProvinces} className={getSelectClass()}>
                  <option value="">Seçiniz</option>
                  {provinces.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">İlçe</label>
              <div className="relative">
                <select name="ilce" value={formData.ilce} onChange={handleChange} disabled={!formData.il || loadingDistricts} className={getSelectClass()}>
                  <option value="">Seçiniz</option>
                  {districts.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">Mahalle</label>
              <div className="relative">
                <select name="mahalle" value={formData.mahalle} onChange={handleChange} disabled={!formData.ilce || loadingNeighborhoods} className={getSelectClass()}>
                  <option value="">Seçiniz</option>
                  {neighborhoods.map((n: any) => <option key={n.id} value={n.name}>{n.name}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-6 gap-y-8 mb-8">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">Adres</label>
              <input 
                type="text" name="adres" value={formData.adres} onChange={handleChange} 
                placeholder="HEDA TEKNOLOJİ BİLİŞİM ANONİM ŞİRKETİ" className={getInputClass()} 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">Posta Kodu</label>
              <input 
                type="text" name="postaKodu" value={formData.postaKodu} onChange={handleChange} 
                placeholder="06920" className={getInputClass()} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">Telefon</label>
              <input 
                type="text" name="telefon" value={formData.telefon} onChange={handlePhoneChange} 
                placeholder="0312 789 6543" className={getInputClass()} 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">E-Posta</label>
              <input 
                type="email" name="ePosta" value={formData.ePosta} onChange={handleChange} 
                placeholder="firmaepostaadresi@gmail.com" className={getInputClass()} 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-[#0b1b42]">WEB Sitesi</label>
              <input 
                type="text" name="webSitesi" value={formData.webSitesi} onChange={handleChange} 
                placeholder="www.heda.tr" className={getInputClass()} 
              />
            </div>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="w-full mt-10">
          <button 
            onClick={handleSave}
            className="w-full bg-[#7584ec] hover:bg-[#6876d6] text-white font-extrabold text-[15px] py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <CheckCircle2 className="w-[18px] h-[18px]" />
            Bilgileri Kaydet
          </button>
        </div>

      </div>

      {/* Yeni Yetkili Ekle Modal */}
      {isYetkiliModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            {/* Header - sabit */}
            <div className="px-8 pt-7 pb-5 border-b border-gray-100 flex flex-col gap-1.5 shrink-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-[#0052cc] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <h3 className="text-[20px] font-black tracking-tight text-[#0b1b42]">Yeni Şube Yetkilisi Ekle</h3>
              </div>
              <p className="text-[12.5px] font-semibold text-[#6b778c] pl-12">Bu kullanıcı eğer sistemde kayıtlı değilse yeni hesap daveti oluşturulacaktır.</p>
            </div>
            
            {/* Kaydırılabilir içerik */}
            <div className="overflow-y-auto flex-1 px-8 py-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-extrabold text-[#0b1b42]">Ad Soyad <span className="text-red-500">*</span></label>
                <input
                  type="text" value={newYetkili.adSoyad} onChange={(e) => setNewYetkili(prev => ({...prev, adSoyad: e.target.value}))}
                  placeholder="Örn: Ali Yılmaz" className={getInputClass()}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-extrabold text-[#0b1b42]">TCKN <span className="text-red-500">*</span></label>
                <input
                  type="text" value={newYetkili.tckn} onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                    setNewYetkili(prev => ({...prev, tckn: val}));
                  }}
                  placeholder="11 Haneli TCKN" className={getInputClass()}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-extrabold text-[#0b1b42]">Telefon</label>
                <input
                  type="text" value={newYetkili.telefon} onChange={handleModalPhoneChange}
                  placeholder="05XX XXX XX XX" className={getInputClass()}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-extrabold text-[#0b1b42]">E-Posta <span className="text-red-500">*</span></label>
                <input
                  type="email" value={newYetkili.ePosta} onChange={(e) => setNewYetkili(prev => ({...prev, ePosta: e.target.value}))}
                  placeholder="E-Posta Adresi" className={getInputClass()}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-extrabold text-[#0b1b42]">Şifre <span className="text-red-500">*</span></label>
                <input
                  type="password" value={newYetkili.sifre} onChange={(e) => setNewYetkili(prev => ({...prev, sifre: e.target.value}))}
                  placeholder="En az 6 karakter" className={getInputClass()}
                />
                <span className="text-[11px] font-semibold text-gray-400">Yetkili bu şifre ile sisteme giriş yapacaktır.</span>
              </div>
            </div>

            {/* Footer - sabit */}
            <div className="px-8 py-5 flex items-center justify-end gap-3 border-t border-gray-100 shrink-0">
              <button
                onClick={() => { setIsYetkiliModalOpen(false); setNewYetkili({ adSoyad: "", tckn: "", telefon: "", ePosta: "", sifre: "" }); }}
                disabled={yetkiliSaving}
                className="text-[#6b778c] hover:bg-gray-100 font-bold text-[14px] px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleAddYetkili}
                disabled={yetkiliSaving}
                className="bg-[#ef5a28] hover:bg-[#d94f20] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold text-[14px] px-8 py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                {yetkiliSaving ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Kaydediliyor...</>
                ) : "Onayla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
