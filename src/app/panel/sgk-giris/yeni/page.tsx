"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  Activity,
  Shield,
  Scale,
  MapPin,
  GraduationCap,
  Award,
  CreditCard,
  CheckCircle2,
  Upload,
  Search,
  Plus,
  Trash2,
  CloudUpload,
  Eye,
  Loader2,
  Folder
} from "lucide-react";
import { SgkGirisFormState, SgkEgitim } from "@/types";
import SgkEgitimModal from "../components/Modals/SgkEgitimModal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { loadAyarlar, type SgkAyarlari } from "../ayarlar/page";
import { useOnboarding } from "@/context/OnboardingContext";
import { fetchJsonWithError, getApiErrorMessage } from "@/lib/fetchJsonWithError";

const TURKIYE_ILLERI = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
  "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
  "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta",
  "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla",
  "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
  "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak",
  "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan",
  "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
].sort();


const ZORUNLU_EVRAKLAR = [
  "T.C. Kimlik Fotokopisi",
  "Vesikalık Fotoğraf",
  "İkametgah Belgesi",
  "Adli Sicil Kaydı (E-Devlet)",
  "Pasaport Fotokopisi",
  "İşaret Dili Belgesi",
  "Vukuatlı Nüfus Kayıt Örneği",
  "Diploma / Mezuniyet Belgesi",
  "Özlük Dosyası Kapak",
  "Nüfus Cüzdanı Sureti",
  "Sağlık Raporu",
  "İş Sözleşmesi",
  "İş Başvuru Formu",
  "KVKK Aydınlatma Metni",
  "Zimmet Teslim Tutanağı",
  "SGK İşe Giriş Bildirgesi",
  "AGİ Formu (Varsa)",
  "İş Sağlığı Güvenliği Eğitimi",
  "Fazla Mesai Onay Formu",
  "Yıllık İzin Formu",
  "Gizlilik Sözleşmesi"
];

// Yardımcı Form Bileşenleri
const TextField = ({ label, value, onChange, placeholder = "", type = "text", required = false, disabled = false }: any) => (
  <div className={`flex flex-col gap-1.5 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
    <label className="text-[12px] font-extrabold text-[#172b4d] flex items-center gap-1">
      {label} {required && !disabled && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 outline-none text-[13.5px] font-medium text-[#172b4d] transition-all placeholder:text-gray-400 ${disabled ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'hover:border-gray-200 focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10'}`}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required = false, disabled = false, freeText = false }: any) => {
  const isOptionsEmpty = !Array.isArray(options) || options.length === 0;
  if (freeText && isOptionsEmpty) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className={`text-[12px] font-extrabold uppercase tracking-wide ${required ? 'text-[#ef5a28]' : 'text-[#6b778c]'}`}>
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-11 px-4 rounded-xl border border-gray-200 text-[13.5px] font-semibold text-[#172b4d] outline-none focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/10 transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400"
          placeholder={label}
        />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-[12px] font-extrabold uppercase tracking-wide ${required ? 'text-[#ef5a28]' : 'text-[#6b778c]'}`}>
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-11 px-4 rounded-xl border border-gray-200 text-[13.5px] font-semibold text-[#172b4d] outline-none focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/10 transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400 appearance-none cursor-pointer"
      >
        <option value="">{label} Seçiniz</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
};



const DateField = ({ label, value, onChange, required = false, disabled = false }: any) => (
  <div className={`flex flex-col gap-1.5 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
    <label className="text-[12px] font-extrabold text-[#172b4d] flex items-center gap-1">
      {label} {required && !disabled && <span className="text-red-500">*</span>}
    </label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 outline-none text-[13.5px] font-medium text-[#172b4d] transition-all ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:border-gray-200 focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10'}`}
    />
  </div>
);

const AutocompleteField = ({ label, value, onChange, placeholder = "", required = false, disabled = false }: any) => {
  const [options, setOptions] = useState<{kod: string; ad: string}[]>([]);
  const [search, setSearch] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    fetchJsonWithError<any[]>("/api/v1/referans/meslek-kodlari")
      .then(res => setOptions(res))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSearch(value || "");
  }, [value]);

  const filtered = search && isOpen 
    ? options.filter(o => o.ad.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR')) || o.kod.includes(search)).slice(0, 50)
    : [];

  return (
    <div className={`flex flex-col gap-1.5 relative ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <label className="text-[12px] font-extrabold text-[#172b4d] flex items-center gap-1">
        {label} {required && !disabled && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 outline-none text-[13.5px] font-medium text-[#172b4d] transition-all placeholder:text-gray-400 ${disabled ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'hover:border-gray-200 focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10'}`}
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
          {filtered.map(opt => (
            <div 
              key={opt.kod}
              onClick={() => {
                const val = `${opt.kod} - ${opt.ad}`;
                setSearch(val);
                onChange(val);
                setIsOpen(false);
              }}
              className="px-4 py-2 text-[13px] text-[#172b4d] hover:bg-gray-50 cursor-pointer font-medium border-b border-gray-50 last:border-0"
            >
              <span className="text-[#ef5a28] font-bold mr-2">{opt.kod}</span>
              {opt.ad}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function SgkGirisYeniTalepPage() {
  const router = useRouter();
  const { firmaData } = useOnboarding();
  const firmaAdi = firmaData?.formData?.firmaUnvani || "";
  const [ayarlar, setAyarlar] = useState<SgkAyarlari>({ zorunluAlanlar: [], zorunluEvraklar: [] });
  const [subeListesi, setSubeListesi] = useState<string[]>([]);
  const [departmanListesi, setDepartmanListesi] = useState<string[]>([]);
  const [birimKayitlari, setBirimKayitlari] = useState<{ name: string; subeAdi: string; departmanAdi: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kısıtlı personel kontrolü
  type KisitliDurum = 'idle' | 'checking' | 'temiz' | 'kisitli';
  const [tcknDurum, setTcknDurum] = useState<KisitliDurum>('idle');
  const [kisitliBilgi, setKisitliBilgi] = useState<{ sebep?: string; tarih?: string } | null>(null);

  const tcknKontrolEt = async (tckn: string) => {
    if (tckn.length !== 11) { setTcknDurum('idle'); setKisitliBilgi(null); return; }
    setTcknDurum('checking');
    setKisitliBilgi(null);
    try {
      const res = await fetchJsonWithError<{ kisitli: boolean; sebep?: string; tarih?: string }>(
        `/api/v1/personel/kisitli-kontrol?tckn=${tckn}`
      ).catch(() => ({ kisitli: false as const, sebep: undefined, tarih: undefined }));
      if (res.kisitli) {
        setTcknDurum('kisitli');
        setKisitliBilgi({ sebep: res.sebep, tarih: res.tarih });
      } else {
        setTcknDurum('temiz');
        setKisitliBilgi(null);
      }
    } catch {
      setTcknDurum('temiz');
    }
  };

  const isKisitli = tcknDurum === 'kisitli';

  useEffect(() => {
    // Ayarlar + şube/departman/birim paralel çek
    void (async () => {
      try {
        const [subeler, departmanlar, birimler, ayarlarRes] = await Promise.all([
          fetchJsonWithError<any[]>("/api/v1/subeler?page=1&pageSize=200"),
          fetchJsonWithError<any[]>("/api/v1/departmanlar?page=1&pageSize=200"),
          fetchJsonWithError<any[]>("/api/v1/birimler?page=1&pageSize=500"),
          fetch("/api/v1/ayarlar/sgk-giris", { credentials: "include" })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),
        ]);
        const sNames = (Array.isArray(subeler) ? subeler : []).map((s: any) => s.name).filter(Boolean);
        const dNames = (Array.isArray(departmanlar) ? departmanlar : []).map((d: any) => d.departmanAdi || d.name).filter(Boolean);
        setSubeListesi(sNames);
        setDepartmanListesi(dNames);
        setBirimKayitlari(
          (Array.isArray(birimler) ? birimler : []).map((u: any) => ({
            name: String(u.name ?? u.birimAdi ?? "").trim(),
            subeAdi: String(u.department?.branch?.name ?? "").trim(),
            departmanAdi: String(u.department?.name ?? "").trim(),
          })).filter((b) => b.name),
        );
        // Ayarlar
        if (ayarlarRes?.success && ayarlarRes?.data) {
          setAyarlar({
            zorunluAlanlar: Array.isArray(ayarlarRes.data.zorunluAlanlar) ? ayarlarRes.data.zorunluAlanlar : [],
            zorunluEvraklar: Array.isArray(ayarlarRes.data.zorunluEvraklar) ? ayarlarRes.data.zorunluEvraklar : [],
          });
        }
      } catch {
        // API'den gelemezsek boş liste — kullanıcı manuel girer
      }
    })();
  }, []);

  const handleFormSubmit = async () => {
    if (isSubmitting) return;

    // Zorunlu alan kontrolü
    const missingFields = ayarlar.zorunluAlanlar.filter((f) => {
      if (f === "personelFoto") return !photoUrl;
      if (f === "mezunOkulAdi" || f === "mezunBolum" || f === "mezuniyetYili" || f === "egitimDurumu") {
        if (formData.egitimler.length === 0) return true;
        const indexToProp = { mezunOkulAdi: "okulAdi", mezunBolum: "bolum", mezuniyetYili: "mezuniyetYili", egitimDurumu: "egitimDurumu" } as const;
        return !formData.egitimler[0]?.[indexToProp[f as keyof typeof indexToProp]]?.trim();
      }
      return !formData[f as keyof SgkGirisFormState]?.toString().trim();
    });
    
    if (missingFields.length > 0) {
      toast.error("Lütfen tüm zorunlu alanları (*) eksiksiz doldurunuz.");
      return;
    }

    setIsSubmitting(true);
    try {
      const adSoyad = `${formData.ad} ${formData.soyad}`.trim();
      const payload = {
        type: "sgk-giris" as const,
        adSoyad,
        tckn: formData.tckn,
        firmaAdi: formData.firmaAdi || firmaAdi,
        subeAdi: formData.subeAdi,
        departman: formData.departman,
        gorevi: formData.gorevi,
        iseBaslamaTarihi: formData.iseBaslamaTarihi,
        netMaasi: formData.netMaasi,
        brutMaasi: formData.brutMaasi,
        formBilgileri: { ...formData, profilFotografi: photoUrl || undefined },
      };
      await fetchJsonWithError("/api/v1/talepler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast.success("SGK Giriş talebi başarıyla oluşturuldu!");
      router.push("/panel/sgk-giris/liste");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Talep gönderilemedi. Lütfen tekrar deneyin."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dinamik zorunlu alan kontrolü
  const isRequired = (fieldId: string): boolean => {
    if (ayarlar.zorunluAlanlar.length === 0) return false;
    return ayarlar.zorunluAlanlar.includes(fieldId);
  };

  // Ayarlardan gelen zorunlu evraklar değiştiğinde formData.evraklar'ı güncelle
  useEffect(() => {
    if (ayarlar.zorunluEvraklar.length === 0) return;
    setFormData(prev => {
      const mevcutIds = new Set(prev.evraklar.map(e => e.id));
      const yeniEvraklar = ayarlar.zorunluEvraklar
        .map(isim => ({
          id: isim.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
          isim,
          durum: 'bekliyor' as const,
          dosyaUrl: undefined,
        }))
        .filter(e => !mevcutIds.has(e.id)); // Zaten yüklenenler silinmesin
      
      // Ayarlarda olmayan evrakları kaldır (yüklenmemişleri)
      const filtrelenmisPrev = prev.evraklar.filter(e =>
        ayarlar.zorunluEvraklar.some(isim =>
          isim.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '') === e.id
        )
      );
      
      return { ...prev, evraklar: [...filtrelenmisPrev, ...yeniEvraklar] };
    });
  }, [ayarlar.zorunluEvraklar]);

  const [formData, setFormData] = useState<SgkGirisFormState>({
    uyrugu: 'Türkiye Cumhuriyeti',
    tckn: '',
    ad: '',
    soyad: '',
    dogumTarihi: '',
    dogumYeri: '',
    cinsiyet: '',
    medeniHal: '',
    anaAdi: '',
    babaAdi: '',
    kanGrubu: '',
    surekliIlacKullanimi: 'Yok',
    kullanilanIlacTuru: '',
    engellilikDurumu: 'Yok',
    engellilikTuru: '',
    engellilikOrani: '',
    protezOrtez: 'Yok',
    protezOrtezTuru: '',
    askerlikDurumu: '',
    tecilBitisTarihi: '',
    kalanSure: '',
    adliSicilKaydi: 'YOKTUR',
    sabikaTuruAciklama: '',
    eskiHukumlu: 'YOK',
    cezaNedeni: '',
    cezaeviGirisTarihi: '',
    cezaeviCikisTarihi: '',
    denetimliSerbestlik: 'Yok',
    icraDurumu: 'Yok',
    aktifIcraDosyasiSayisi: '',
    nafakaDurumu: 'Yok',
    il: '',
    ilce: '',
    adres: '',
    cepTelefonu: '',
    eposta: '',
    acilDurumKisisi: '',
    yakinlik: '',
    acilDurumTelefon: '',
    egitimler: [],
    mykBelgesi: 'Hayır',
    meslekAdi: '',
    mykSeviye: '',
    mykBelgeNo: '',
    mykBaslangicTarihi: '',
    mykBitisTarihi: '',
    ibanNo: '',
    bankaAdi: '',
    bankaSube: '',

    // Kadro ve Kurum Bilgileri
    firmaAdi: '',
    subeAdi: '',
    departman: '',
    birim: '',
    gorevi: '',
    takimi: '',
    ekipSorumlusu: '',
    kadroStatusu: 'Mavi Yaka',
    isyeriLokasyonu: 'Merkez Ofis',
    masrafMerkezi: '',
    netMaasi: '',
    brutMaasi: '',
    yemekUcreti: 'Yok',
    yolUcreti: 'Yok',
    servisKullanimi: 'Yok',
    sabitEkOdeme: '',
    iseBaslamaTarihi: '',
    mesaiBaslangic: '08:30',
    mesaiBitis: '18:30',
    calismaTuru: 'Tam Zamanlı',
    istihdamTuru: 'Normal',
    iseAlimDurumu: 'İlk Giriş',
    epostaAcilacakMi: 'Hayır',
    telefonHattiAcilacakMi: 'Hayır',
    erpAcilacakMi: 'Hayır',
    manyetikKart: 'Hayır',
    yuzTanima: 'Hayır',
    parmakIzi: 'Hayır',
    otopark: 'Hayır',
    ziyaretci: 'Hayır',
    kartvizit: 'Hayır',
    isgEkipman: 'Hayır',
    demirbas: 'Hayır',

    // Evraklar Listesi
    evraklar: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [progress3, setProgress3] = useState(0);
  const [isEgitimModalOpen, setIsEgitimModalOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Zorunlu alanlar listesi - Progress hesaplaması için
  const requiredFields1 = [
    'uyrugu', 'tckn', 'ad', 'soyad', 'dogumTarihi', 'dogumYeri', 'cinsiyet', 'medeniHal', 'anaAdi', 'babaAdi',
    'kanGrubu', 'surekliIlacKullanimi', 'engellilikDurumu', 'protezOrtez',
    'askerlikDurumu',
    'adliSicilKaydi', 'eskiHukumlu', 'denetimliSerbestlik', 'icraDurumu', 'nafakaDurumu',
    'il', 'ilce', 'adres', 'cepTelefonu', 'eposta', 'acilDurumKisisi', 'yakinlik', 'acilDurumTelefon',
    'mykBelgesi',
    'ibanNo', 'bankaAdi', 'bankaSube'
  ] as Array<keyof SgkGirisFormState>;

  const requiredFields2 = [
    'firmaAdi', 'subeAdi', 'departman', 'birim', 'gorevi', 'takimi',
    'kadroStatusu', 'isyeriLokasyonu', 'netMaasi', 'brutMaasi',
    'yemekUcreti', 'yolUcreti', 'servisKullanimi', 'sabitEkOdeme',
    'iseBaslamaTarihi', 'mesaiBaslangic', 'mesaiBitis', 'calismaTuru',
    'istihdamTuru', 'iseAlimDurumu'
  ] as Array<keyof SgkGirisFormState>;

  useEffect(() => {
    // Tüm ayarlar.zorunluAlanlar içinden Step 1'e ait olanları bul
    const req1 = ayarlar.zorunluAlanlar.filter(f => 
      ['uyrugu', 'tckn', 'ad', 'soyad', 'dogumTarihi', 'dogumYeri', 'cinsiyet', 'medeniHal', 'anaAdi', 'babaAdi', 'kanGrubu', 'surekliIlacKullanimi', 'kullanilanIlacTuru', 'engellilikDurumu', 'engellilikTuru', 'engellilikOrani', 'protezOrtez', 'protezOrtezTuru', 'askerlikDurumu', 'tecilBitisTarihi', 'adliSicilKaydi', 'sabikaTuruAciklama', 'eskiHukumlu', 'cezaNedeni', 'cezaeviGirisTarihi', 'cezaeviCikisTarihi', 'denetimliSerbestlik', 'icraDurumu', 'aktifIcraDosyasiSayisi', 'nafakaDurumu', 'adres', 'il', 'ilce', 'cepTelefonu', 'eposta', 'acilDurumKisisi', 'yakinlik', 'acilDurumTelefon', 'egitimDurumu', 'mezunOkulAdi', 'mezunBolum', 'mezuniyetYili', 'mykBelgesi', 'meslekAdi', 'mykSeviye', 'mykBelgeNo', 'mykBaslangicTarihi', 'mykBitisTarihi', 'ibanNo', 'bankaAdi', 'bankaSube', 'personelFoto'].includes(f)
    );
    let filled1 = 0;
    let totalReq1 = req1.length;
    req1.forEach(f => {
      if (f === "personelFoto") {
        if (photoUrl) filled1++;
      } else if (f === "mezunOkulAdi" || f === "mezunBolum" || f === "mezuniyetYili" || f === "egitimDurumu") {
        const indexToProp = { mezunOkulAdi: "okulAdi", mezunBolum: "bolum", mezuniyetYili: "mezuniyetYili", egitimDurumu: "egitimDurumu" } as const;
        if (formData.egitimler.length > 0 && formData.egitimler[0]?.[indexToProp[f as keyof typeof indexToProp]]?.trim()) {
          filled1++;
        }
      } else {
        if (formData[f as keyof SgkGirisFormState] && formData[f as keyof SgkGirisFormState]?.toString().trim() !== '') {
          filled1++;
        }
      }
    });

    // Herhangi bir zorunlu alan yoksa veya hepsi doldurulmuşsa bile, UI için "temel" doluluk hesapla (eğer req1 boşsa)
    if (totalReq1 === 0) {
      let f1 = 0;
      requiredFields1.forEach(field => {
        if (formData[field] && formData[field].toString().trim() !== '') f1++;
      });
      setProgress1(Math.round((f1 / requiredFields1.length) * 100));
    } else {
      setProgress1(Math.round((filled1 / totalReq1) * 100));
    }

    const req2 = ayarlar.zorunluAlanlar.filter(f => 
      ['firmaAdi', 'subeAdi', 'departman', 'birim', 'gorevi', 'takimi', 'kadroStatusu', 'isyeriLokasyonu', 'netMaasi', 'brutMaasi', 'yemekUcreti', 'yolUcreti', 'servisKullanimi', 'sabitEkOdeme', 'iseBaslamaTarihi', 'mesaiBaslangic', 'mesaiBitis', 'calismaTuru', 'istihdamTuru', 'iseAlimDurumu'].includes(f)
    );
    let filled2 = 0;
    let totalReq2 = req2.length;
    req2.forEach(field => {
      if (formData[field as keyof SgkGirisFormState] && formData[field as keyof SgkGirisFormState]?.toString().trim() !== '') filled2++;
    });

    if (totalReq2 === 0) {
      let f2 = 0;
      requiredFields2.forEach(field => {
        if (formData[field] && formData[field].toString().trim() !== '') f2++;
      });
      setProgress2(Math.round((f2 / requiredFields2.length) * 100));
    } else {
      setProgress2(Math.round((filled2 / totalReq2) * 100));
    }

    let filled3 = 0;
    if (formData.evraklar && formData.evraklar.length > 0) {
      filled3 = formData.evraklar.filter(e => e.durum === 'yuklendi').length;
      setProgress3(Math.round((filled3 / formData.evraklar.length) * 100));
    } else if (ayarlar.zorunluEvraklar.length === 0) {
      setProgress3(100);
    }
  }, [formData, photoUrl, ayarlar]);

  const updateField = (field: keyof SgkGirisFormState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredBirimNames = useMemo(() => {
    const sube = formData.subeAdi?.trim() ?? "";
    const dep = formData.departman?.trim() ?? "";
    if (!sube || !dep) return [];
    const names = birimKayitlari
      .filter((b) => b.subeAdi === sube && b.departmanAdi === dep)
      .map((b) => b.name);
    return [...new Set(names)];
  }, [birimKayitlari, formData.subeAdi, formData.departman]);

  useEffect(() => {
    if (filteredBirimNames.length === 0) return;
    setFormData((prev) => {
      const b = prev.birim?.trim() ?? "";
      if (!b || filteredBirimNames.includes(b)) return prev;
      return { ...prev, birim: "" };
    });
  }, [filteredBirimNames, formData.subeAdi, formData.departman]);

  const handleEvrakYukle = async (id: string, file: File) => {
    if (!file) return;
    const newEvraklar = formData.evraklar.map(e =>
      e.id === id ? { ...e, durum: 'yukleniyor' as const } : e
    );
    updateField('evraklar', newEvraklar);

    try {
      const body = new FormData();
      body.set("file", file, file.name);

      const res = await fetch("/api/v1/documents/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok || !json?.success || !json?.data?.path) {
        throw new Error(json?.error?.message || "Dosya yuklenemedi.");
      }

      const cdnUrl = String(json.data.path);
      setFormData(prev => ({
        ...prev,
        evraklar: prev.evraklar.map(e =>
          e.id === id ? { ...e, durum: 'yuklendi' as const, dosyaUrl: cdnUrl } : e
        )
      }));
      toast.success(`${file.name} başarıyla yüklendi!`);
    } catch (e) {
      setFormData(prev => ({
        ...prev,
        evraklar: prev.evraklar.map(ev =>
          ev.id === id ? { ...ev, durum: 'bekliyor' as const, dosyaUrl: undefined } : ev
        )
      }));
      toast.error(getApiErrorMessage(e, "Dosya yüklenemedi. Lütfen tekrar deneyin."));
    }
  };

  const handleEvrakSil = (id: string) => {
    const evrak = formData.evraklar.find(e => e.id === id);
    if (evrak?.dosyaUrl && evrak.dosyaUrl.startsWith("blob:")) URL.revokeObjectURL(evrak.dosyaUrl);

    const newEvraklar = formData.evraklar.map(e =>
      e.id === id ? { ...e, durum: 'bekliyor' as const, dosyaUrl: undefined } : e
    );
    updateField('evraklar', newEvraklar);
    toast.success("Dosya silindi.");
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="text-[#172b4d] font-bold">E-İK /</span>
        <span className="text-[#ef5a28] font-bold">Personel SGK Giriş Talebi</span>
      </div>

      {/* Şube Özet Tablosu - Adım Takipçisi */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-[18px] font-black text-[#172b4d]">Şube Özet Tablosu</h2>
            <p className="text-[13px] font-medium text-gray-500 mt-1">Değerler otomatik güncellenir.</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Step 1 */}
            <div
              onClick={() => setCurrentStep(1)}
              className={currentStep === 1
                ? "bg-[#ef5a28] rounded-xl p-5 relative overflow-hidden h-[120px] flex flex-col justify-between cursor-pointer shadow-md transition-all scale-[1.02]"
                : "bg-[#00b894] rounded-xl p-5 relative overflow-hidden h-[120px] flex flex-col justify-between cursor-pointer transition-all opacity-95 hover:opacity-100"}
            >
              <div className="flex items-center justify-between z-10">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20">
                  <User className="w-4 h-4 text-white" />
                </div>
                {currentStep > 1 && <CheckCircle2 className="w-6 h-6 text-white" />}
              </div>
              <div className="z-10">
                <h3 className="text-[14px] font-bold mb-3 text-white">1. Personel Kimlik Özlük Bilgileri</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/30">
                    <div className="h-full rounded-full transition-all duration-500 bg-white" style={{ width: `${progress1}%` }} />
                  </div>
                  <span className="font-bold text-xs text-white">%{' '}{progress1}</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setCurrentStep(2)}
              className={currentStep === 2
                ? "bg-[#ef5a28] rounded-xl p-5 relative overflow-hidden h-[120px] flex flex-col justify-between cursor-pointer shadow-md transition-all scale-[1.02]"
                : currentStep > 2
                  ? "bg-[#00b894] rounded-xl p-5 relative overflow-hidden h-[120px] flex flex-col justify-between cursor-pointer transition-all opacity-95 hover:opacity-100"
                  : "bg-white border-2 border-gray-100 rounded-xl p-5 flex flex-col justify-between h-[120px] cursor-pointer transition-all hover:border-[#ef5a28]/30"}
            >
              <div className="flex items-center justify-between z-10">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentStep >= 2 ? 'bg-white/20' : 'bg-gray-50'}`}>
                  <Activity className={`w-4 h-4 ${currentStep >= 2 ? 'text-white' : 'text-[#ef5a28]'}`} />
                </div>
                {currentStep > 2 && <CheckCircle2 className="w-6 h-6 text-white" />}
              </div>
              <div className="z-10">
                <h3 className={`text-[14px] font-bold mb-3 ${currentStep >= 2 ? 'text-white' : 'text-[#ef5a28]'}`}>2. Kadro ve Kurum Bilgileri</h3>
                <div className="flex items-center gap-4">
                  <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${currentStep >= 2 ? 'bg-white/30' : 'bg-gray-100'}`}>
                    <div className={`h-full rounded-full transition-all duration-500 ${currentStep >= 2 ? 'bg-white' : 'bg-[#ef5a28]'}`} style={{ width: `${progress2}%` }} />
                  </div>
                  <span className={`font-bold text-xs ${currentStep >= 2 ? 'text-white' : 'text-[#172b4d]'}`}>%{' '}{progress2}</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setCurrentStep(3)}
              className={currentStep === 3
                ? "bg-[#ef5a28] rounded-xl p-5 relative overflow-hidden h-[120px] flex flex-col justify-between cursor-pointer shadow-md transition-all scale-[1.02]"
                : "bg-white border-2 border-gray-100 rounded-xl p-5 flex flex-col justify-between h-[120px] cursor-pointer transition-all hover:border-[#ef5a28]/30"}
            >
              <div className="flex items-center justify-between z-10">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentStep === 3 ? 'bg-white/20' : 'bg-gray-50'}`}>
                  <Upload className={`w-4 h-4 ${currentStep === 3 ? 'text-white' : 'text-[#ef5a28]'}`} />
                </div>
              </div>
              <div className="z-10">
                <h3 className={`text-[14px] font-bold mb-3 ${currentStep === 3 ? 'text-white' : 'text-[#ef5a28]'}`}>3. Alınması Gerekli Zorunlu Evraklar</h3>
                <div className="flex items-center gap-4">
                  <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${currentStep === 3 ? 'bg-white/30' : 'bg-gray-100'}`}>
                    <div className={`h-full rounded-full transition-all duration-500 ${currentStep === 3 ? 'bg-white' : 'bg-[#172b4d]'}`} style={{ width: `${progress3}%` }} />
                  </div>
                  <span className={`font-bold text-xs ${currentStep === 3 ? 'text-white' : 'text-[#172b4d]'}`}>%{' '}{progress3}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Content - Step 1 */}
      <div className={`${currentStep === 1 ? 'flex' : 'hidden'} bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex-col gap-10`}>

        {/* Kimlik Bilgileri */}
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0052cc] flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#172b4d]">Kimlik Bilgileri</h3>
              <p className="text-[12.5px] font-medium text-gray-500 mt-1 leading-relaxed">
                Firma ve personel işe alım süreçlerinde, kimlik, adres, sağlık, eğitim ve diğer özlük bilgileri eksiksiz şekilde girilmelidir. Bilgilerin doğru doldurulması resmi bildirimlerin doğruluğu, hata oranının azalması ve eksiksiz ilerlenmesi açısından önemlidir.
              </p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 relative">
            <label className="text-[12px] font-extrabold text-[#172b4d] absolute -top-2.5 left-4 bg-white px-2">Personel Fotoğrafı</label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center overflow-hidden">
                {photoUrl ? (
                  <img src={photoUrl} alt="Personel Fotoğrafı" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-[14px] font-bold text-[#172b4d]">Kimlik fotoğrafı (ayrı alan)</h4>
                <p className="text-[12.5px] text-gray-500 font-medium">Bu alan, Evraklar bölümündeki Vesikalık Fotoğraf alanından bağımsızdır.</p>
                <label className={`${photoUrl ? 'bg-green-500 hover:bg-green-600' : 'bg-[#172b4d] hover:bg-black'} text-white px-6 py-2.5 rounded-lg text-sm font-bold w-max transition-colors flex items-center gap-2 cursor-pointer shadow-sm`}>
                  {photoUrl ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  {photoUrl ? 'Yüklendi' : 'Fotoğraf Yükle'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      void (async () => {
                        try {
                          const body = new FormData();
                          body.set("file", file, file.name);
                          const res = await fetch("/api/v1/documents/upload", { method: "POST", body });
                          const json = await res.json();
                          if (!res.ok || !json?.success || !json?.data?.path) {
                            throw new Error(json?.error?.message || "Dosya yuklenemedi.");
                          }
                          setPhotoUrl(String(json.data.path));
                          toast.success(`${file.name} başarıyla yüklendi!`);
                        } catch (err: any) {
                          toast.error(getApiErrorMessage(err, "Fotoğraf yüklenemedi. Lütfen tekrar deneyin."));
                        }
                      })();
                    }
                  }} />
                </label>
              </div>
            </div>
          </div>

          {/* — İlk aşama: Uyruk + TCKN — */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <SelectField
              label="Uyruğu"
              value={formData.uyrugu}
              onChange={(v: string) => updateField('uyrugu', v)}
              options={['Türkiye Cumhuriyeti', 'Yabancı Uyruklu']}
              required={isRequired('uyrugu')}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-extrabold text-[#172b4d] flex items-center gap-1">
                T.C. Kimlik Numarası {isRequired('tckn') && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={11}
                  value={formData.tckn}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                    updateField('tckn', val);
                    void tcknKontrolEt(val);
                  }}
                  className={`w-full px-4 py-2.5 pr-10 rounded-xl border-2 outline-none text-[13.5px] font-medium text-[#172b4d] transition-all
                    ${isKisitli
                      ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : tcknDurum === 'temiz'
                        ? 'border-green-400 bg-green-50/30 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                        : 'border-gray-200 hover:border-gray-300 focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10'
                    }`}
                  placeholder="11 haneli TC kimlik numaranızı giriniz"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {tcknDurum === 'checking' && (
                    <div className="w-4 h-4 border-2 border-[#ef5a28]/30 border-t-[#ef5a28] rounded-full animate-spin" />
                  )}
                  {tcknDurum === 'kisitli' && (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  )}
                  {tcknDurum === 'temiz' && (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Kısıtlı Uyarı Kutusu */}
          {isKisitli && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-5 py-4 mt-1">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              <div className="flex flex-col gap-1">
                <span className="text-[13.5px] font-extrabold text-amber-800">Bu kişi kısıtlı personel listesinde.</span>
                <span className="text-[12.5px] font-semibold text-amber-700">İşe alım işlerini başlatamazsınız.</span>
                {kisitliBilgi?.sebep && (
                  <span className="text-[12px] font-medium text-amber-700">Sebep: {kisitliBilgi.sebep}</span>
                )}
                {kisitliBilgi?.tarih && (
                  <span className="text-[12px] font-medium text-amber-700">Tarih: {kisitliBilgi.tarih}</span>
                )}
              </div>
            </div>
          )}

          {/* Diğer Kimlik Alanları — sadece temiz ise görünür */}
          {(tcknDurum === 'temiz' || tcknDurum === 'idle') && !isKisitli && (
            <div className={`grid grid-cols-2 gap-x-8 gap-y-6 transition-opacity duration-300 ${tcknDurum === 'temiz' ? 'opacity-100' : 'opacity-40 pointer-events-none'
              }`}>
              <TextField label="Adı" value={formData.ad} onChange={(v: string) => updateField('ad', v)} required={isRequired('ad')} />
              <div className="grid grid-cols-[1fr_200px_100px] gap-4">
                <TextField label="Soyadı" value={formData.soyad} onChange={(v: string) => updateField('soyad', v)} required={isRequired('soyad')} />
                <DateField label="Doğum Tarihi" value={formData.dogumTarihi} onChange={(v: string) => updateField('dogumTarihi', v)} required={isRequired('dogumTarihi')} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-extrabold text-[#172b4d]">Yaş</label>
                  <div className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 bg-gray-50 flex items-center justify-center text-[13.5px] font-bold text-gray-500">
                    {formData.dogumTarihi ? (new Date().getFullYear() - new Date(formData.dogumTarihi).getFullYear()) : '-'}
                  </div>
                </div>
              </div>
              <TextField label="Doğum Yeri" value={formData.dogumYeri} onChange={(v: string) => updateField('dogumYeri', v)} required={isRequired('dogumYeri')} />
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Cinsiyet" value={formData.cinsiyet} onChange={(v: string) => updateField('cinsiyet', v)} options={['Erkek', 'Kadın']} required={isRequired('cinsiyet')} />
                <SelectField label="Medeni Hali" value={formData.medeniHal} onChange={(v: string) => updateField('medeniHal', v)} options={['Bekar', 'Evli']} required={isRequired('medeniHal')} />
              </div>
              <TextField label="Anne Adı" value={formData.anaAdi} onChange={(v: string) => updateField('anaAdi', v)} required={isRequired('anaAdi')} />
              <TextField label="Baba Adı" value={formData.babaAdi} onChange={(v: string) => updateField('babaAdi', v)} required={isRequired('babaAdi')} />
            </div>
          )}
        </div>

        {/* Sağlık Durumu Bilgileri */}
        <div className="flex flex-col gap-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0052cc] flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#172b4d]">Sağlık Durumu Bilgileri</h3>
              <p className="text-[12.5px] font-medium text-gray-500 mt-1">Bu alanda personelin sağlık durumu, sürekli ilaç kullanımı, engellilik bilgisi ve varsa protez/ortez kullanımı girilmelidir.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <SelectField label="Kan Grubu" value={formData.kanGrubu} onChange={(v: string) => updateField('kanGrubu', v)} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-']} required={isRequired('kanGrubu')} />
            <SelectField label="Raporlu Sürekli İlaç Kullanımı Var mı?" value={formData.surekliIlacKullanimi} onChange={(v: string) => updateField('surekliIlacKullanimi', v)} options={['Yok', 'Var']} required={isRequired('surekliIlacKullanimi')} />
            <TextField label="Kullanılan İlaç Türünü Seçiniz" value={formData.kullanilanIlacTuru} onChange={(v: string) => updateField('kullanilanIlacTuru', v)} disabled={formData.surekliIlacKullanimi !== 'Var'} />
          </div>
          <div className="grid grid-cols-3 gap-6">
            <SelectField label="Engellilik Durumu Var mı? (Var / Yok)" value={formData.engellilikDurumu} onChange={(v: string) => updateField('engellilikDurumu', v)} options={['Yok', 'Var']} required={isRequired('engellilikDurumu')} />
            <SelectField label="Engellilik Türü Nedir?" value={formData.engellilikTuru} onChange={(v: string) => updateField('engellilikTuru', v)} options={['Fiziksel', 'Görme', 'İşitme', 'Bilişsel']} disabled={formData.engellilikDurumu !== 'Var'} />
            <TextField label="Engellilik Oranı (%)" value={formData.engellilikOrani} onChange={(v: string) => updateField('engellilikOrani', v)} disabled={formData.engellilikDurumu !== 'Var'} />
          </div>
          <div className="grid grid-cols-3 gap-6">
            <SelectField label="Protez / Ortez Kullanımı Var mı?" value={formData.protezOrtez} onChange={(v: string) => updateField('protezOrtez', v)} options={['Yok', 'Var']} required={isRequired('protezOrtez')} />
            <TextField label="Kullanılan Protez / Ortez Türü" value={formData.protezOrtezTuru} onChange={(v: string) => updateField('protezOrtezTuru', v)} disabled={formData.protezOrtez !== 'Var'} />
          </div>
        </div>

        {/* Askerlik Durumu Bilgileri */}
        <div className="flex flex-col gap-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0052cc] flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#172b4d]">Askerlik Durumu Bilgileri</h3>
              <p className="text-[12.5px] font-medium text-gray-500 mt-1">Askerlik durumu, tecil/terhis tarihleri ve gerekli ise muafiyet bilgileri bu alanda girilmelidir.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <SelectField label="Askerlik Durumu" value={formData.askerlikDurumu} onChange={(v: string) => updateField('askerlikDurumu', v)} options={['Tecilli', 'Yaptı', 'Muaf', 'Yapmadı']} required={isRequired('askerlikDurumu')} />
            <DateField label="Tecil Bitiş Tarihi" value={formData.tecilBitisTarihi} onChange={(v: string) => {
              updateField('tecilBitisTarihi', v);
              if (v) {
                const bitis = new Date(v);
                const bugun = new Date();
                bugun.setHours(0, 0, 0, 0);
                const fark = bitis.getTime() - bugun.getTime();
                if (fark <= 0) {
                  updateField('kalanSure', 'Tecil süresi dolmuş');
                } else {
                  const toplamGun = Math.ceil(fark / (1000 * 60 * 60 * 24));
                  const yil = Math.floor(toplamGun / 365);
                  const ay = Math.floor((toplamGun % 365) / 30);
                  const gun = toplamGun % 30;
                  const parcalar: string[] = [];
                  if (yil > 0) parcalar.push(`${yil} yıl`);
                  if (ay > 0) parcalar.push(`${ay} ay`);
                  if (gun > 0) parcalar.push(`${gun} gün`);
                  updateField('kalanSure', parcalar.join(' ') + ` (${toplamGun} gün)`);
                }
              } else {
                updateField('kalanSure', '');
              }
            }} disabled={formData.askerlikDurumu !== 'Tecilli'} />
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-extrabold text-[#172b4d]">Tecilin Bitmesine Kalan Süre</label>
              <div className={`w-full px-4 py-2.5 rounded-xl border-2 text-[13.5px] font-bold transition-all ${
                formData.askerlikDurumu !== 'Tecilli'
                  ? 'border-gray-100 bg-gray-50 text-gray-300'
                  : formData.kalanSure === 'Tecil süresi dolmuş'
                  ? 'border-red-200 bg-red-50 text-red-500'
                  : formData.kalanSure
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-gray-50 text-gray-400'
              }`}>
                {formData.askerlikDurumu !== 'Tecilli'
                  ? <span className="text-gray-300">—</span>
                  : formData.kalanSure
                  ? <span>⏱ {formData.kalanSure}</span>
                  : <span className="text-gray-400 font-medium">Tarih seçince otomatik hesaplanır</span>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Yasal Durum ve Adli Sicil Bilgileri */}
        <div className="flex flex-col gap-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0052cc] flex items-center justify-center flex-shrink-0">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#172b4d]">Yasal Durum ve Adli Sicil Bilgileri</h3>
              <p className="text-[12.5px] font-medium text-gray-500 mt-1">Adli sicil, sabıka türü, eski hükümlü durumu, ceza bilgileri ve icra/nafaka bilgileri burada belirtilmelidir.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <SelectField label="Adli Sicil Kaydı" value={formData.adliSicilKaydi} onChange={(v: string) => updateField('adliSicilKaydi', v)} options={['YOKTUR', 'VARDIR']} required={isRequired('adliSicilKaydi')} />
            <TextField label="Sabıka Türü / Açıklama" value={formData.sabikaTuruAciklama} onChange={(v: string) => updateField('sabikaTuruAciklama', v)} disabled={formData.adliSicilKaydi !== 'VARDIR'} />
            <SelectField label="Eski Hükümlü Durumu" value={formData.eskiHukumlu} onChange={(v: string) => updateField('eskiHukumlu', v)} options={['YOK', 'VAR']} required={isRequired('eskiHukumlu')} />

            <TextField label="Ceza Nedeni / Suç Türü" value={formData.cezaNedeni} onChange={(v: string) => updateField('cezaNedeni', v)} disabled={formData.eskiHukumlu !== 'VAR'} />
            <DateField label="Cezaevi Giriş Tarihi" value={formData.cezaeviGirisTarihi} onChange={(v: string) => updateField('cezaeviGirisTarihi', v)} disabled={formData.eskiHukumlu !== 'VAR'} />
            <DateField label="Cezaevi Çıkış Tarihi" value={formData.cezaeviCikisTarihi} onChange={(v: string) => updateField('cezaeviCikisTarihi', v)} disabled={formData.eskiHukumlu !== 'VAR'} />

            <SelectField label="Denetimli Serbestlik Durumu" value={formData.denetimliSerbestlik} onChange={(v: string) => updateField('denetimliSerbestlik', v)} options={['Yok', 'Var']} required={isRequired('denetimliSerbestlik')} />
            <SelectField label="Devam Eden İcra Durumu" value={formData.icraDurumu} onChange={(v: string) => updateField('icraDurumu', v)} options={['Yok', 'Var']} required={isRequired('icraDurumu')} />
            <TextField label="Aktif İcra Dosyası Sayısı" value={formData.aktifIcraDosyasiSayisi} onChange={(v: string) => updateField('aktifIcraDosyasiSayisi', v)} type="number" disabled={formData.icraDurumu !== 'Var'} />

            <SelectField label="Devam Eden Nafaka Durumu" value={formData.nafakaDurumu} onChange={(v: string) => updateField('nafakaDurumu', v)} options={['Yok', 'Var']} required={isRequired('nafakaDurumu')} />
          </div>
        </div>

        {/* Adres ve İletişim Bilgileri */}
        <div className="flex flex-col gap-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0052cc] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#172b4d]">Adres ve İletişim Bilgileri</h3>
              <p className="text-[12.5px] font-medium text-gray-500 mt-1">Personelin güncel yerleşim bilgileri ile iletişim bilgileri ve acil durumda aranacak kişi alanları bu bölümden doldurulmalıdır.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <SelectField label="İl" value={formData.il} onChange={(v: string) => updateField('il', v)} options={TURKIYE_ILLERI} required={isRequired('il')} />
            <SelectField label="İlçe" value={formData.ilce} onChange={(v: string) => updateField('ilce', v)} options={[]} required={isRequired('ilce')} freeText />
          </div>
          <TextField label="Adres" value={formData.adres} onChange={(v: string) => updateField('adres', v)} required={isRequired('adres')} />
          <div className="grid grid-cols-2 gap-6">
            <TextField label="Telefon" value={formData.cepTelefonu} onChange={(v: string) => updateField('cepTelefonu', v)} required />
            <TextField label="E-Posta" value={formData.eposta} onChange={(v: string) => updateField('eposta', v)} required />
          </div>
          <div className="grid grid-cols-3 gap-6">
            <TextField label="Acil Durumda Ulaşılacak Kişi Adı" value={formData.acilDurumKisisi} onChange={(v: string) => updateField('acilDurumKisisi', v)} required />
            <SelectField label="Acil Durum Kişisi Yakınlık Derecesi" value={formData.yakinlik} onChange={(v: string) => updateField('yakinlik', v)} options={['Anne', 'Baba', 'Eş', 'Kardeş', 'Arkadaş']} required />
            <TextField label="Acil Durum Telefon Numarası" value={formData.acilDurumTelefon} onChange={(v: string) => updateField('acilDurumTelefon', v)} required />
          </div>
        </div>

        {/* Eğitim Bilgileri */}
        <div className="flex flex-col gap-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0052cc] flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#172b4d]">Eğitim Bilgileri</h3>
              <p className="text-[12.5px] font-medium text-gray-500 mt-1">Personelin eğitim durumu, mezun olduğu okul, bölüm ve mezuniyet yılı bu alanda girilir.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {formData.egitimler.map((egitim, idx) => (
              <div key={egitim.id} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-6 w-full">
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-gray-500 mb-0.5">Eğitim Durumu</p>
                    <p className="text-[13px] font-bold text-[#172b4d]">{egitim.egitimDurumu}</p>
                  </div>
                  <div className="flex-[2]">
                    <p className="text-[11px] font-bold text-gray-500 mb-0.5">Okul</p>
                    <p className="text-[13px] font-bold text-[#172b4d]">{egitim.okulAdi}</p>
                  </div>
                  <div className="flex-[2]">
                    <p className="text-[11px] font-bold text-gray-500 mb-0.5">Bölüm</p>
                    <p className="text-[13px] font-bold text-[#172b4d]">{egitim.bolum}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-gray-500 mb-0.5">Mezuniyet Yılı</p>
                    <p className="text-[13px] font-bold text-[#172b4d]">{egitim.mezuniyetYili}</p>
                  </div>
                  <button
                    onClick={() => updateField('egitimler', formData.egitimler.filter(e => e.id !== egitim.id))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setIsEgitimModalOpen(true)}
            className="bg-[#ef5a28] hover:bg-[#d9491a] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-colors w-max flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Eğitim Kaydı Ekle
          </button>
        </div>

        {/* MYK Mesleki Yeterlilik Belgesi Bilgileri */}
        <div className="flex flex-col gap-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0052cc] flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#172b4d]">MYK Mesleki Yeterlilik Belgesi Bilgileri</h3>
              <p className="text-[12.5px] font-medium text-gray-500 mt-1">Personelin MYK belgesi mevcutsa belge numarası, düzenlenme tarihi ve geçerlilik tarihi girilmelidir.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <SelectField label="MYK Belgesi Var mı?" value={formData.mykBelgesi} onChange={(v: string) => updateField('mykBelgesi', v)} options={['Hayır', 'Evet']} required />
            <TextField label="Ulusal Yeterlilik / Meslek Adı" value={formData.meslekAdi} onChange={(v: string) => updateField('meslekAdi', v)} disabled={formData.mykBelgesi !== 'Evet'} />
            <SelectField label="Seviye" value={formData.mykSeviye} onChange={(v: string) => updateField('mykSeviye', v)} options={['Seviye 1', 'Seviye 2', 'Seviye 3']} disabled={formData.mykBelgesi !== 'Evet'} />
            <TextField label="MYK Belge No" value={formData.mykBelgeNo} onChange={(v: string) => updateField('mykBelgeNo', v)} disabled={formData.mykBelgesi !== 'Evet'} />
            <DateField label="Düzenlenme Başlangıç Tarihi" value={formData.mykBaslangicTarihi} onChange={(v: string) => updateField('mykBaslangicTarihi', v)} disabled={formData.mykBelgesi !== 'Evet'} />
            <DateField label="Geçerlilik Bitiş Tarihi" value={formData.mykBitisTarihi} onChange={(v: string) => updateField('mykBitisTarihi', v)} disabled={formData.mykBelgesi !== 'Evet'} />
          </div>
        </div>

        {/* Ödeme - Banka Bilgileri */}
        <div className="flex flex-col gap-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0052cc] flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#172b4d]">Ödeme - Banka Bilgileri</h3>
              <p className="text-[12.5px] font-medium text-gray-500 mt-1">Maaş ve diğer ödemelerin sorunsuz yapılabilmesi için aktif banka bilgileri bu bölümde doğru şekilde girilmelidir.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <TextField label="IBAN No" value={formData.ibanNo} onChange={(v: string) => updateField('ibanNo', v)} required />
            <SelectField label="Banka Adı" value={formData.bankaAdi} onChange={(v: string) => updateField('bankaAdi', v)} options={['Ziraat Bankası', 'Garanti BBVA', 'İş Bankası', 'Akbank']} required />
          </div>
          <TextField label="Şube Adı" value={formData.bankaSube} onChange={(v: string) => updateField('bankaSube', v)} required />
        </div>

      </div>

      {currentStep === 1 && (
        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              if (isKisitli) {
                toast.error("Bu personel kısıtlı listesinde olduğundan işlem yapılamaz.");
                return;
              }
              if (tcknDurum === 'checking') {
                toast.error("T.C. Kimlik Numarası kontrol ediliyor, lütfen bekleyin.");
                return;
              }
              if (formData.tckn.length !== 11) {
                toast.error("Geçerli bir T.C. Kimlik Numarası giriniz.");
                return;
              }
              if (progress1 < 100) {
                toast.error(`Zorunlu alanların henüz %${progress1} kısmını tamamladınız. Lütfen eksik alanları doldurunuz.`);
                setCurrentStep(2);
              } else {
                toast.success("Bilgiler başarıyla kaydedildi, 2. Adıma geçiliyor!");
                setCurrentStep(2);
              }
            }}
            disabled={isKisitli}
            className="bg-[#5c6e91] hover:bg-[#172b4d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl text-[14px] font-bold transition-colors shadow-sm"
          >
            Kaydet ve İlerle
          </button>
        </div>
      )}

      {/* Main Form Content - Step 2 */}
      <div className={`${currentStep === 2 ? 'flex' : 'hidden'} bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex-col gap-10`}>

        {/* Kurum ve Kadro Bilgileri */}
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0052cc] flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#172b4d]">Kurum ve Kadro Bilgileri</h3>
              <p className="text-[12.5px] font-medium text-gray-500 mt-1 leading-relaxed">
                Bu alanda, kullanıcıya ait pozisyon, kurum, departman, lokasyon ve bağlı olduğu kadro bilgileri yer alır.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-x-8 gap-y-6">
            <SelectField label="Firma Adı" value={formData.firmaAdi || firmaAdi} onChange={(v: string) => updateField('firmaAdi', v)} options={firmaAdi ? [firmaAdi] : []} freeText />
            <SelectField label="Şube Adı" value={formData.subeAdi} onChange={(v: string) => updateField('subeAdi', v)} options={subeListesi} freeText />
            <SelectField label="Departman" value={formData.departman} onChange={(v: string) => updateField('departman', v)} options={departmanListesi} freeText />

            <SelectField
              label="Birim"
              value={formData.birim}
              onChange={(v: string) => updateField('birim', v)}
              options={filteredBirimNames}
              freeText
              required={isRequired('birim')}
            />
            <AutocompleteField label="Görevi - Mesleği" value={formData.gorevi} onChange={(v: string) => updateField('gorevi', v)} placeholder="Meslek kodu veya adı ile arayın..." required={isRequired('gorevi')} />
            <SelectField label="Takımı - Sınıfı" value={formData.takimi} onChange={(v: string) => updateField('takimi', v)} options={['A Takımı', 'B Takımı']} />

            <TextField label="Ekip Sorumlusu" value={formData.ekipSorumlusu} onChange={(v: string) => updateField('ekipSorumlusu', v)} />
            <SelectField label="Kadro Statüsü (Mavi / Beyaz / Yönetici)" value={formData.kadroStatusu} onChange={(v: string) => updateField('kadroStatusu', v)} options={['Mavi Yaka', 'Beyaz Yaka', 'Yönetici']} />
            <SelectField label="İşyeri Lokasyonu / Çalışma Alanı" value={formData.isyeriLokasyonu} onChange={(v: string) => updateField('isyeriLokasyonu', v)} options={['Merkez Ofis', 'Saha']} />

            <TextField label="Masraf Merkezi" value={formData.masrafMerkezi} onChange={(v: string) => updateField('masrafMerkezi', v)} />
          </div>
        </div>

        {/* Ücret ve Yan Hak Bilgileri */}
        <div className="flex flex-col gap-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0052cc] flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#172b4d]">Ücret ve Yan Hak Bilgileri</h3>
              <p className="text-[12.5px] font-medium text-gray-500 mt-1">Bu bölümde maaş, yol/yemek desteği, servis ve sabit ek ödeme bilgileri yönetilir.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <TextField label="Net Maaşı" value={formData.netMaasi} onChange={(v: string) => updateField('netMaasi', v)} />
            <TextField label="Brüt Maaşı" value={formData.brutMaasi} onChange={(v: string) => updateField('brutMaasi', v)} />

            <SelectField label="Yemek Ücreti Ödemesi (Var / Yok)" value={formData.yemekUcreti} onChange={(v: string) => updateField('yemekUcreti', v)} options={['Yok', 'Var']} />
            <SelectField label="Yol Ücreti Ödemesi (Var / Yok)" value={formData.yolUcreti} onChange={(v: string) => updateField('yolUcreti', v)} options={['Yok', 'Var']} />

            <SelectField label="Servis Kullanımı Durumu (Var / Yok)" value={formData.servisKullanimi} onChange={(v: string) => updateField('servisKullanimi', v)} options={['Yok', 'Var']} />
            <SelectField label="Sabit Ek Ödemesi Var mı? (Evet / Hayır)" value={formData.sabitEkOdeme} onChange={(v: string) => updateField('sabitEkOdeme', v)} options={['Hayır', 'Evet']} />
          </div>
        </div>

        {/* İşe Giriş ve İstihdam Bilgileri */}
        <div className="flex flex-col gap-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0052cc] flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#172b4d]">İşe Giriş ve İstihdam Bilgileri</h3>
              <p className="text-[12.5px] font-medium text-gray-500 mt-1">İşe başlama tarihi, vardiya saatleri, çalışma modeli ve istihdam türü bu bölümden tanımlanır.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <DateField label="İşe Başlama Tarihi" value={formData.iseBaslamaTarihi} onChange={(v: string) => updateField('iseBaslamaTarihi', v)} />
            <SelectField label="Mesai Başlangıç Saati" value={formData.mesaiBaslangic} onChange={(v: string) => updateField('mesaiBaslangic', v)} options={['08:00', '08:30', '09:00']} />
            <SelectField label="Mesai Bitiş Saati" value={formData.mesaiBitis} onChange={(v: string) => updateField('mesaiBitis', v)} options={['17:00', '17:30', '18:00', '18:30']} />

            <SelectField label="Çalışma Türü (Tam / Yarı / Proje / Hibrit)" value={formData.calismaTuru} onChange={(v: string) => updateField('calismaTuru', v)} options={['Tam Zamanlı', 'Yarı Zamanlı', 'Proje Bazlı', 'Hibrit']} />
            <SelectField label="İstihdam Türü (Normal / Emekli / Stajyer)" value={formData.istihdamTuru} onChange={(v: string) => updateField('istihdamTuru', v)} options={['Normal', 'Emekli', 'Stajyer']} />
            <SelectField label="İşe Alım Durumu (İlk Giriş / Eski Çalışan)" value={formData.iseAlimDurumu} onChange={(v: string) => updateField('iseAlimDurumu', v)} options={['İlk Giriş', 'Eski Çalışan']} />
          </div>
        </div>

        {/* Erişim ve Yetki Tanımlamaları */}
        <div className="flex flex-col gap-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0052cc] flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#172b4d]">Erişim ve Yetki Tanımlamaları</h3>
              <p className="text-[12.5px] font-medium text-gray-500 mt-1">Kullanıcının kurum içi erişim ve yetki ihtiyaçları bu başlık altında belirlenir.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <SelectField label="E-posta Hesabı Açılacak mı?" value={formData.epostaAcilacakMi} onChange={(v: string) => updateField('epostaAcilacakMi', v)} options={['Hayır', 'Evet']} />
            <SelectField label="Telefon Hattı Açılacak mı?" value={formData.telefonHattiAcilacakMi} onChange={(v: string) => updateField('telefonHattiAcilacakMi', v)} options={['Hayır', 'Evet']} />
            <SelectField label="ERP Programları Açılacak mı?" value={formData.erpAcilacakMi} onChange={(v: string) => updateField('erpAcilacakMi', v)} options={['Hayır', 'Evet']} />

            <SelectField label="Manyetik Giriş Kartı Tanımlanacak mı?" value={formData.manyetikKart} onChange={(v: string) => updateField('manyetikKart', v)} options={['Hayır', 'Evet']} />
            <SelectField label="Yüz Tanıma Yetkisi Tanımlanacak mı?" value={formData.yuzTanima} onChange={(v: string) => updateField('yuzTanima', v)} options={['Hayır', 'Evet']} />
            <SelectField label="Parmak İzi Tanımlanacak mı?" value={formData.parmakIzi} onChange={(v: string) => updateField('parmakIzi', v)} options={['Hayır', 'Evet']} />

            <SelectField label="Otopark Kullanım Yetkisi Verilecek mi?" value={formData.otopark} onChange={(v: string) => updateField('otopark', v)} options={['Hayır', 'Evet']} />
            <SelectField label="Ziyaretçi Giriş Yetkisi Verilecek mi?" value={formData.ziyaretci} onChange={(v: string) => updateField('ziyaretci', v)} options={['Hayır', 'Evet']} />
            <SelectField label="Kartvizit Basılacak mı?" value={formData.kartvizit} onChange={(v: string) => updateField('kartvizit', v)} options={['Hayır', 'Evet']} />
          </div>
        </div>

        {/* Zimmet ve Ekipman Teslimi */}
        <div className="flex flex-col gap-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0052cc] flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#172b4d]">Zimmet ve Ekipman Teslimi</h3>
              <p className="text-[12.5px] font-medium text-gray-500 mt-1">Personelin teslim aldığı ekipman ve demirbaş kayıtları bu alanda tutulur.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <SelectField label="İSG Ekipmanları Teslim Edildi mi?" value={formData.isgEkipman} onChange={(v: string) => updateField('isgEkipman', v)} options={['Hayır', 'Evet']} />
            <SelectField label="Demirbaş ve Ekipman Teslim Edildi mi?" value={formData.demirbas} onChange={(v: string) => updateField('demirbas', v)} options={['Hayır', 'Evet']} />
          </div>
        </div>
      </div>

      {currentStep === 2 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="bg-gray-100 hover:bg-gray-200 text-[#172b4d] px-8 py-3 rounded-xl text-[14px] font-bold transition-colors shadow-sm"
          >
            Geri Dön
          </button>
          <button
            onClick={() => {
              if (progress2 < 100) {
                toast.error(`Zorunlu alanların henüz %${progress2} kısmını tamamladınız. Lütfen eksik alanları doldurunuz.`);
                setCurrentStep(3);
              } else {
                toast.success("Bilgiler başarıyla kaydedildi, 3. Adıma geçiliyor!");
                setCurrentStep(3);
              }
            }}
            className="bg-[#5c6e91] hover:bg-[#172b4d] text-white px-8 py-3 rounded-xl text-[14px] font-bold transition-colors shadow-sm"
          >
            Kaydet ve İlerle
          </button>
        </div>
      )}

      {/* Main Form Content - Step 3: Evraklar */}
      <div className={`${currentStep === 3 ? 'flex' : 'hidden'} bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex-col gap-10`}>
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0052cc] flex items-center justify-center flex-shrink-0">
              <Folder className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#172b4d]">Alınması Gerekli Zorunlu Evraklar</h3>
              <p className="text-[12.5px] font-medium text-gray-500 mt-1 leading-relaxed">
                Personelin işe giriş/çıkış işlemlerinin tamamlanabilmesi için gerekli evrakları bu alana yükleyiniz.
              </p>
            </div>
          </div>

          {formData.evraklar.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Folder className="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-500">Zorunlu Evrak Tanımlanmamış</p>
                <p className="text-[13px] text-gray-400 mt-1 max-w-sm">
                  SGK Giriş Ayarları sayfasından zorunlu evrakları seçerek bu listeyi doldurabilirsiniz.
                </p>
              </div>
              <a href="/panel/sgk-giris/ayarlar" className="px-5 py-2.5 bg-[#ef5a28] text-white text-[13px] font-bold rounded-xl hover:bg-[#d94a1c] transition-colors">
                Ayarlara Git
              </a>
            </div>
          ) : (
          <div className="grid grid-cols-3 gap-6">
            {formData.evraklar.map((evrak: any) => (
              <div
                key={evrak.id}
                className={`border rounded-xl p-5 flex flex-col justify-between text-center gap-4 transition-all ${evrak.durum === 'yuklendi'
                    ? 'border-green-200 bg-[#f0fdf4]'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                  }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${evrak.durum === 'yuklendi' ? 'bg-green-100/50' : 'bg-[#f0f4ff]'
                    }`}>
                    {evrak.durum === 'yuklendi' ? (
                      <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
                    ) : evrak.durum === 'yukleniyor' ? (
                      <Loader2 className="w-6 h-6 text-[#0052cc] animate-spin" />
                    ) : (
                      <CloudUpload className="w-6 h-6 text-[#0052cc]" />
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-1 w-full px-2">
                    <h4 className="text-[13px] font-bold text-[#172b4d] leading-snug h-10 flex items-center justify-center text-center">
                      {evrak.isim}
                    </h4>
                    <p className={`text-[10.5px] font-semibold ${evrak.durum === 'yuklendi' ? 'text-green-600' : 'text-gray-400'
                      }`}>
                      {evrak.durum === 'yuklendi'
                        ? 'Dosya yüklendi'
                        : evrak.durum === 'yukleniyor'
                          ? 'Yükleniyor...'
                          : 'Henüz yüklenmedi'}
                    </p>
                  </div>
                </div>

                <div className="mt-2 w-full">
                  {evrak.durum === 'yuklendi' ? (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => window.open(evrak.dosyaUrl, '_blank')}
                        className="flex-1 bg-[#10b981] hover:bg-[#0ea5e9] text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-[12px] font-bold transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        İncele
                      </button>
                      <button
                        onClick={() => handleEvrakSil(evrak.id)}
                        className="w-10 bg-red-50 hover:bg-red-100 text-red-500 py-2.5 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id={`file-upload-${evrak.id}`}
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleEvrakYukle(evrak.id, e.target.files[0]);
                          }
                        }}
                      />
                      <button
                        onClick={() => document.getElementById(`file-upload-${evrak.id}`)?.click()}
                        disabled={evrak.durum === 'yukleniyor'}
                        className="w-full bg-[#172b4d] hover:bg-[#0052cc] disabled:bg-[#172b4d]/70 disabled:cursor-not-allowed text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-[12px] font-bold transition-all"
                      >
                        {evrak.durum === 'yukleniyor' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        Dosya Seç
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {currentStep === 3 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentStep(2)}
            className="bg-gray-100 hover:bg-gray-200 text-[#172b4d] px-8 py-3 rounded-xl text-[14px] font-bold transition-colors shadow-sm"
          >
            Geri Dön
          </button>
          <button
            onClick={() => {
              if (progress3 < 100) {
                toast.error(`Zorunlu evrakların henüz %${progress3} kısmını yüklediniz. Lütfen eksik evrakları tamamlayınız.`);
              } else {
                void handleFormSubmit();
              }
            }}
            disabled={isSubmitting}
            className="bg-[#5c6e91] hover:bg-[#172b4d] text-white px-8 py-3 rounded-xl text-[14px] font-bold transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Gönderiliyor..." : "Bilgileri Kaydet"}
          </button>
        </div>
      )}

      <SgkEgitimModal
        isOpen={isEgitimModalOpen}
        onClose={() => setIsEgitimModalOpen(false)}
        onSave={(egitim: SgkEgitim) => {
          updateField('egitimler', [...formData.egitimler, egitim]);
          setIsEgitimModalOpen(false);
        }}
      />
    </div>
  );
}
