"use client";
import React, { useState, useEffect } from "react";
import { Settings, User, Activity, Shield, Scale, MapPin, GraduationCap, Award, CreditCard, Building2, Wallet, Clock, Folder, Wifi, Package, FileText, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export type SgkAyarlari = {
  zorunluAlanlar: string[];
  zorunluEvraklar: string[];
};

const DEFAULT_AYARLAR: SgkAyarlari = {
  zorunluAlanlar: [],
  zorunluEvraklar: [],
};

export function loadAyarlar(): SgkAyarlari {
  return DEFAULT_AYARLAR;
}

function saveAyarlar(a: SgkAyarlari) {
  void a;
}

type CheckItemProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (id: string, checked: boolean) => void;
};

function CheckItem({ id, label, checked, onChange }: CheckItemProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        onClick={() => onChange(id, !checked)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          checked
            ? "bg-[#ef5a28] border-[#ef5a28]"
            : "border-gray-300 bg-white group-hover:border-[#ef5a28]/50"
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span
        onClick={() => onChange(id, !checked)}
        className={`text-[13px] font-semibold transition-colors ${checked ? "text-[#ef5a28]" : "text-[#172b4d] group-hover:text-[#ef5a28]"}`}
      >
        {label}
      </span>
    </label>
  );
}

type SectionProps = {
  icon: React.ReactNode;
  title: string;
  fields: { id: string; label: string }[];
  checked: string[];
  onChange: (id: string, val: boolean) => void;
};

function Section({ icon, title, fields, checked, onChange }: SectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-[#172b4d]">
        <span className="text-[#ef5a28]">{icon}</span>
        <h4 className="text-[13.5px] font-black">{title}</h4>
      </div>
      <div className="flex flex-col gap-2 pl-6">
        {fields.map((f) => (
          <CheckItem key={f.id} id={f.id} label={f.label} checked={checked.includes(f.id)} onChange={onChange} />
        ))}
      </div>
    </div>
  );
}

// ─── Alan Tanımları ───────────────────────────────────────────────────
const KIMLIK_BILGILERI = [
  { id: "uyrugu", label: "Uyruğu" },
  { id: "tckn", label: "T.C. Kimlik Numarası" },
  { id: "ad", label: "Adı" },
  { id: "soyad", label: "Soyadı" },
  { id: "dogumTarihi", label: "Doğum Tarihi" },
  { id: "dogumYeri", label: "Doğum Yeri" },
  { id: "cinsiyet", label: "Cinsiyeti" },
  { id: "medeniHal", label: "Medeni Hali" },
  { id: "anaAdi", label: "Ana Adı" },
  { id: "babaAdi", label: "Baba Adı" },
  { id: "personelFoto", label: "Personel Fotoğrafı" },
];

const SAGLIK_BILGILERI = [
  { id: "kanGrubu", label: "Kan Grubu" },
  { id: "surekliIlacKullanimi", label: "Raporlu Sürekli İlaç Kullanımı Var mı?" },
  { id: "kullanilanIlacTuru", label: "Kullanılan İlaç Türünü Seçiniz" },
  { id: "engellilikDurumu", label: "Engellilik Durumu Var mı? (Var/Yok)" },
  { id: "engellilikTuru", label: "Engellilik Türü Nedir?" },
  { id: "engellilikOrani", label: "Engellilik Oranı (%)" },
  { id: "protezOrtez", label: "Protez / Ortez Kullanımı Var mı?" },
  { id: "protezOrtezTuru", label: "Kullanılan Protez / Ortez Türünü Açıklayınız" },
];

const ASKERLIK_BILGILERI = [
  { id: "askerlikDurumu", label: "Askerlik Durumu (Yapıldı / Tecilli / Muaf)" },
  { id: "tecilBitisTarihi", label: "Terhis / Tecil Bitiş Tarihi" },
];

const YASAL_ADLI = [
  { id: "adliSicilKaydi", label: "Adli Sicil Kaydı" },
  { id: "sabikaTuruAciklama", label: "Sabıka Türü / Açıklama" },
  { id: "eskiHukumlu", label: "Eski Hükümlü Durumu" },
  { id: "cezaNedeni", label: "Ceza Nedeni / Suç Türü" },
  { id: "cezaeviGirisTarihi", label: "Cezaevi Giriş Tarihi" },
  { id: "cezaeviCikisTarihi", label: "Cezaevi Çıkış Tarihi" },
  { id: "denetimliSerbestlik", label: "Denetimli Serbestlik Durumu" },
  { id: "icraDurumu", label: "Devam Eden İcra Durumu" },
  { id: "aktifIcraDosyasiSayisi", label: "Aktif İcra Dosyası Sayısı" },
  { id: "nafakaDurumu", label: "Devam Eden Nafaka Durumu" },
];

const IKAMET_ILETISIM = [
  { id: "adres", label: "Adres (ikamet/gah adresi)" },
  { id: "il", label: "İl" },
  { id: "ilce", label: "İlçe" },
  { id: "cepTelefonu", label: "Cep Telefonu" },
  { id: "eposta", label: "E-Posta" },
  { id: "acilDurumKisisi", label: "Acil Durumda Ulaşılacak Kişi Adı" },
  { id: "yakinlik", label: "Acil Durum Kişisi Yakınlık Derecesi" },
  { id: "acilDurumTelefon", label: "Acil Durum Telefon Numarası" },
];

const EGITIM_BILGILERI = [
  { id: "egitimDurumu", label: "Eğitim Durumu" },
  { id: "mezunOkulAdi", label: "Mezun Olunan Okul" },
  { id: "mezunBolum", label: "Mezun Olunan Bölüm" },
  { id: "mezuniyetYili", label: "Mezuniyet Yılı" },
];

const MYK_BILGILERI = [
  { id: "mykBelgesi", label: "MYK Belgesi Var mı?" },
  { id: "meslekAdi", label: "Ulusal Yeterlilik / Meslek Adı" },
  { id: "mykSeviye", label: "Seviye" },
  { id: "mykBelgeNo", label: "Belge No" },
  { id: "mykBaslangicTarihi", label: "Düzenleme Tarihi" },
  { id: "mykBitisTarihi", label: "Geçerlilik Tarihi" },
];

const ODEME_BANKA = [
  { id: "ibanNo", label: "IBAN" },
  { id: "bankaAdi", label: "Banka Adı" },
  { id: "bankaSube", label: "Şube Adı" },
];

// Sütun 2
const KURUM_KADRO = [
  { id: "firmaAdi", label: "Firma Adı" },
  { id: "subeAdi", label: "Şube Adı" },
  { id: "departman", label: "Departman" },
  { id: "birim", label: "Birim" },
  { id: "gorevi", label: "Görevi / Mesleği" },
  { id: "takimi", label: "Takımı / Sınıfı" },
  { id: "ekipSorumlusu", label: "Ekip Sorumlusu" },
  { id: "kadroStatusu", label: "Kadro Statüsü (Mavi / Beyaz / Yönetici)" },
  { id: "isyeriLokasyonu", label: "İşyeri Lokasyonu" },
  { id: "masrafMerkezi", label: "Masraf Merkezi" },
];

const UCRET_YAN_HAK = [
  { id: "netMaasi", label: "Net Maaş" },
  { id: "brutMaasi", label: "Brüt Maaş" },
  { id: "yemekUcreti", label: "Yemek Ücreti Ödemesi (Var / Yok)" },
  { id: "yolUcreti", label: "Yol Ücreti Ödemesi (Var / Yok)" },
  { id: "servisKullanimi", label: "Servis Kullanım Durumu (Var / Yok)" },
  { id: "sabitEkOdeme", label: "Sabit Ek Ödemesi Var mı? (Evet / Hayır)" },
];

const ISE_GIRIS_ISTIHDAM = [
  { id: "iseBaslamaTarihi", label: "İşe Başlama Tarihi" },
  { id: "mesaiBaslangic", label: "Mesai Başlangıç Saati" },
  { id: "mesaiBitis", label: "Mesai Bitiş Saati" },
  { id: "calismaTuru", label: "Çalışma Türü (Tam / Yarı / Proje / Hibrit)" },
  { id: "istihdamTuru", label: "İstihdam Türü (Normal / Emekli / Stajyer)" },
  { id: "iseAlimDurumu", label: "İşe Alım Durumu (İlk Giriş / Eski Çalışan)" },
];

const ERISIM_YETKI = [
  { id: "epostaAcilacakMi", label: "E-posta Hesabı Açılacak mı?" },
  { id: "telefonHattiAcilacakMi", label: "Telefon Hattı Açılacak mı?" },
  { id: "erpAcilacakMi", label: "ERP Programları Açılacak mı?" },
  { id: "manyetikKart", label: "Manyetik Giriş Kartı Tanımlanacak mı?" },
  { id: "yuzTanima", label: "Yüz Tanıma Yetkisi Tanımlanacak mı?" },
  { id: "parmakIzi", label: "Parmak İzi Tanımlanacak mı?" },
  { id: "otopark", label: "Otopark Kullanım Yetkisi Verilecek mi?" },
  { id: "ziyaretci", label: "Ziyaretçi Giriş Yetkisi Verilecek mi?" },
  { id: "kartvizit", label: "Kartvizit Basılacak mı?" },
];

const ZIMMET = [
  { id: "isgEkipman", label: "İSG Ekipmanları Teslim Edildi mi?" },
  { id: "demirbas", label: "Demirbaş ve Ekipman Teslim Edildi mi?" },
];

// Sütun 3 – Evraklar
const ZORUNLU_EVRAKLAR_LIST = [
  "İkametgah Belgesi",
  "Adli Sicil Kaydı",
  "İmza Beyannamesi",
  "İç Yönerge Onayı",
  "Zimmet Teslim Tutanağı",
  "Kimlik Fotokopisi",
  "Sertifikalar",
  "Vesikalık Fotoğraf",
  "Taahhütname",
  "İbraname",
  "Diploma",
  "Sağlık Raporu",
  "İş Sözleşmesi",
  "KVKK Veri Silme Onayı",
  "SGK Giriş Bildirgesi",
  "Askerlik Belgesi",
  "KVKK Açık Rıza Formu",
  "İSG Eğitimi Katılım Formu",
  "İşyeri İlişki Kesme Formu",
  "İşten Ayrılış Formu",
];

export default function GirisTalepAyarlariPage() {
  const [ayarlar, setAyarlar] = useState<SgkAyarlari>(DEFAULT_AYARLAR);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAyarlar(loadAyarlar());
    void (async () => {
      try {
        const response = await fetch("/api/v1/ayarlar/sgk-giris", { credentials: "include" });
        const json = (await response.json()) as { success?: boolean; data?: SgkAyarlari };
        if (response.ok && json.success && json.data) {
          setAyarlar({
            ...DEFAULT_AYARLAR,
            ...json.data,
            zorunluAlanlar: Array.isArray(json.data.zorunluAlanlar) ? json.data.zorunluAlanlar : [],
            zorunluEvraklar: Array.isArray(json.data.zorunluEvraklar) ? json.data.zorunluEvraklar : [],
          });
        }
      } catch {}
    })();
  }, []);

  const toggleAlan = (id: string, checked: boolean) => {
    setAyarlar((prev) => ({
      ...prev,
      zorunluAlanlar: checked
        ? [...prev.zorunluAlanlar, id]
        : prev.zorunluAlanlar.filter((x) => x !== id),
    }));
    setSaved(false);
  };

  const toggleEvrak = (evrak: string, checked: boolean) => {
    setAyarlar((prev) => ({
      ...prev,
      zorunluEvraklar: checked
        ? [...prev.zorunluEvraklar, evrak]
        : prev.zorunluEvraklar.filter((x) => x !== evrak),
    }));
    setSaved(false);
  };

  const handleSave = () => {
    void (async () => {
      saveAyarlar(ayarlar);
      try {
        await fetch("/api/v1/ayarlar/sgk-giris", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(ayarlar),
        });
      } catch {}
      setSaved(true);
      toast.success("Ayarlar başarıyla kaydedildi!");
      setTimeout(() => setSaved(false), 3000);
    })();
  };

  const checked = Array.isArray(ayarlar.zorunluAlanlar) ? ayarlar.zorunluAlanlar : [];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#172b4d] flex items-center justify-center flex-shrink-0">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-[22px] font-black text-[#172b4d]">Giriş Talep Ayarları</h1>
              <p className="text-[13.5px] font-medium text-gray-500 mt-1 max-w-2xl leading-relaxed">
                Bu ekrandan, işe giriş süreçlerinde zorunlu olacak bilgi ve belge alanlarını seçebilir, tüm firmalarınızda standart bir veri toplama yapısı tanımlayabilirsiniz. Belirlenen zorunlu alanlar doldurulmadan şubeler personel işe giriş talebinde bulunamaz.
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-[13px] transition-all shadow-sm ${
              saved
                ? "bg-green-500 text-white"
                : "bg-[#ef5a28] hover:bg-[#d94a1c] text-white"
            }`}
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Kaydedildi!" : "Kaydet"}
          </button>
        </div>
      </div>

      {/* 3 Sütunlu Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Sütun 1: Personel Kimlik Özlük ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 flex flex-col gap-7">
          <div>
            <h2 className="text-[17px] font-black text-[#172b4d]">1. Personel Kimlik Özlük Bilgileri</h2>
            <p className="text-[12px] font-medium text-gray-400 mt-1">Zorunlu alanları listeden seçerek belirleyebilirsiniz.</p>
          </div>

          <Section icon={<User className="w-4 h-4" />} title="Kimlik ve Temel Bilgiler" fields={KIMLIK_BILGILERI} checked={checked} onChange={toggleAlan} />
          <div className="h-px bg-gray-100" />
          <Section icon={<Activity className="w-4 h-4" />} title="Sağlık Durumu Bilgileri" fields={SAGLIK_BILGILERI} checked={checked} onChange={toggleAlan} />
          <div className="h-px bg-gray-100" />
          <Section icon={<Shield className="w-4 h-4" />} title="Askerlik Durumu Bilgisi" fields={ASKERLIK_BILGILERI} checked={checked} onChange={toggleAlan} />
          <div className="h-px bg-gray-100" />
          <Section icon={<Scale className="w-4 h-4" />} title="Yasal Durum ve Adli Sicil Bilgileri" fields={YASAL_ADLI} checked={checked} onChange={toggleAlan} />
          <div className="h-px bg-gray-100" />
          <Section icon={<MapPin className="w-4 h-4" />} title="İkamet ve İletişim Bilgileri" fields={IKAMET_ILETISIM} checked={checked} onChange={toggleAlan} />
          <div className="h-px bg-gray-100" />
          <Section icon={<GraduationCap className="w-4 h-4" />} title="Eğitim Bilgileri" fields={EGITIM_BILGILERI} checked={checked} onChange={toggleAlan} />
          <div className="h-px bg-gray-100" />
          <Section icon={<Award className="w-4 h-4" />} title="MYK Mesleki Yeterlilik Belgesi Bilgileri" fields={MYK_BILGILERI} checked={checked} onChange={toggleAlan} />
          <div className="h-px bg-gray-100" />
          <Section icon={<CreditCard className="w-4 h-4" />} title="Ödeme - Banka Bilgileri" fields={ODEME_BANKA} checked={checked} onChange={toggleAlan} />
        </div>

        {/* ─── Sütun 2: Kadro ve Kurum ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 flex flex-col gap-7">
          <div>
            <h2 className="text-[17px] font-black text-[#172b4d]">2. Kadro ve Kurum Bilgileri</h2>
            <p className="text-[12px] font-medium text-gray-400 mt-1">Zorunlu alanları listeden seçerek belirleyebilirsiniz.</p>
          </div>

          <Section icon={<Building2 className="w-4 h-4" />} title="Kurum ve Kadro Bilgileri" fields={KURUM_KADRO} checked={checked} onChange={toggleAlan} />
          <div className="h-px bg-gray-100" />
          <Section icon={<Wallet className="w-4 h-4" />} title="Ücret ve Yan Hak Bilgileri" fields={UCRET_YAN_HAK} checked={checked} onChange={toggleAlan} />
          <div className="h-px bg-gray-100" />
          <Section icon={<Clock className="w-4 h-4" />} title="İşe Giriş ve İstihdam Bilgileri" fields={ISE_GIRIS_ISTIHDAM} checked={checked} onChange={toggleAlan} />
          <div className="h-px bg-gray-100" />
          <Section icon={<Wifi className="w-4 h-4" />} title="Erişim ve Yetki Tanımlamaları" fields={ERISIM_YETKI} checked={checked} onChange={toggleAlan} />
          <div className="h-px bg-gray-100" />
          <Section icon={<Package className="w-4 h-4" />} title="Zimmet ve Demirbaş Kayıtları" fields={ZIMMET} checked={checked} onChange={toggleAlan} />
        </div>

        {/* ─── Sütun 3: Zorunlu Evraklar ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 flex flex-col gap-7">
          <div>
            <h2 className="text-[17px] font-black text-[#172b4d]">4. Alınması Gerekli Zorunlu Evraklar</h2>
            <p className="text-[12px] font-medium text-gray-400 mt-1">Zorunlu alanları listeden seçerek belirleyebilirsiniz.</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#172b4d]">
              <span className="text-[#ef5a28]"><Folder className="w-4 h-4" /></span>
              <h4 className="text-[13.5px] font-black">Yüklenmesi Gerekli Zorunlu Evraklar</h4>
            </div>
            <div className="flex flex-col gap-2 pl-6">
              {ZORUNLU_EVRAKLAR_LIST.map((evrak) => (
                <CheckItem
                  key={evrak}
                  id={evrak}
                  label={evrak}
                  checked={(Array.isArray(ayarlar.zorunluEvraklar) ? ayarlar.zorunluEvraklar : []).includes(evrak)}
                  onChange={(id, val) => toggleEvrak(id, val)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alt kaydet */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-extrabold text-[14px] transition-all shadow-md ${
            saved ? "bg-green-500 text-white" : "bg-[#ef5a28] hover:bg-[#d94a1c] text-white"
          }`}
        >
          {saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? "Kaydedildi!" : "Değişiklikleri Kaydet"}
        </button>
      </div>
    </div>
  );
}