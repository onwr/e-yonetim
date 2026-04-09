"use client";
import React, { useState, useEffect } from "react";
import { LogOut, Wifi, Package, Save, CheckCircle2, Lock, ShieldOff } from "lucide-react";
import { toast } from "sonner";

type CikisAyarlari = {
  seciliAlanlar: string[];
  zorunluEvraklar: string[];
};

const DEFAULT_AYARLAR: CikisAyarlari = { seciliAlanlar: [], zorunluEvraklar: [] };

function loadAyarlar(): CikisAyarlari {
  return DEFAULT_AYARLAR;
}

function saveAyarlar(a: CikisAyarlari) {
  void a;
}

const CIKIS_ZORUNLU_EVRAKLAR_LIST = [
  "İstifa Dilekçesi",
  "Fesih Bildirimi",
  "İbraname / Çıkış Mutabakatı",
  "Kıdem Tazminatı Bordrosu",
  "İhbar Tazminatı Bordrosu",
  "SGK Çıkış Bildirgesi",
  "Zimmet İade Tutanağı",
  "Gizlilik Sözleşmesi",
  "İlişik Kesme Formu",
  "Çıkış Mülakatı Formu",
  "Devir Teslim Tutanağı",
  "Manyetik Kart İade Tutanağı",
];

function CheckItem({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (id: string, v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
      <div
        onClick={() => onChange(id, !checked)}
        className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          checked ? "bg-[#ef5a28] border-[#ef5a28]" : "border-gray-300 bg-white group-hover:border-[#ef5a28]/50"
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-[13px] font-semibold transition-colors ${checked ? "text-[#ef5a28] font-bold" : "text-gray-600 group-hover:text-[#172b4d]"}`}>
        {label}
      </span>
    </label>
  );
}

const CIKIS_BILGILERI = [
  { id: "istenAyrilısTarihi", label: "İşten Ayrılış Tarihi" },
  { id: "ayrilisNedeni", label: "Ayrılış Nedeni (İstifa / İşten Çıkarma / Emk.)" },
  { id: "ihbarSuresiBaslangic", label: "İhbar Süresi Başlangıç Tarihi" },
  { id: "bildirimSuresi", label: "Bildirim Süresi (Kullanıldı / Kullanılmadı)" },
  { id: "kidemTazminati", label: "Kıdem Tazminatı Ödenecek mi?" },
  { id: "cikisAyrimaAltPuantajFormu", label: "Çıkış Ayrıma Alt Puantaj Formu" },
];

const ERISIM_YETKI = [
  { id: "epostaKapatilacak", label: "E-posta Hesabı Kapatılacak mı?" },
  { id: "telefonKapatilacak", label: "Telefon Hattı Kapatılacak mı?" },
  { id: "erpKapatilacak", label: "ERP Programları Kapatılacak mı?" },
  { id: "manyetikKartTeslim", label: "Manyetik Giriş Kartı Teslim Alındı mı?" },
  { id: "yuzTanımaKapatildi", label: "Yüz Tanıma Erişimi Kapatıldı mı?" },
  { id: "parmaklziKapatildi", label: "Parmak İzi Erişimi Kapatıldı mı?" },
  { id: "otoparkKapatildi", label: "Otopark Kullanım Yetkisi Kapatıldı mı?" },
];

const ZIMMET_DEMIRBAŞ = [
  { id: "isgEkipmanlariTeslim", label: "İSG Ekipmanları Teslim Edildi mi?" },
  { id: "demirbasTeslim", label: "Demirbaş ve Ekipman Teslim Alındı mı?" },
];

const GRUPLAR = [
  {
    baslik: "Çıkış Bilgileri",
    icon: LogOut,
    iconColor: "text-[#ef5a28]",
    alanlar: CIKIS_BILGILERI,
  },
  {
    baslik: "Erişim ve Yetki Tanımlamaları",
    icon: Wifi,
    iconColor: "text-[#ef5a28]",
    alanlar: ERISIM_YETKI,
  },
  {
    baslik: "Zimmet ve Demirbaş Kayıtları",
    icon: Package,
    iconColor: "text-[#ef5a28]",
    alanlar: ZIMMET_DEMIRBAŞ,
  },
];

export default function CikisTalepAyarlariPage() {
  const [ayarlar, setAyarlar] = useState<CikisAyarlari>(DEFAULT_AYARLAR);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAyarlar(loadAyarlar());
    void (async () => {
      try {
        const response = await fetch("/api/v1/ayarlar/sgk-cikis", { credentials: "include" });
        const json = (await response.json()) as { success?: boolean; data?: CikisAyarlari };
        if (response.ok && json.success && json.data) {
          setAyarlar({
            ...DEFAULT_AYARLAR,
            ...json.data,
            seciliAlanlar: Array.isArray(json.data.seciliAlanlar) ? json.data.seciliAlanlar : [],
            zorunluEvraklar: Array.isArray(json.data.zorunluEvraklar) ? json.data.zorunluEvraklar : [],
          });
        }
      } catch {}
    })();
  }, []);

  const toggle = (id: string, checked: boolean) => {
    setAyarlar(prev => ({
      ...prev,
      seciliAlanlar: checked
        ? [...prev.seciliAlanlar, id]
        : prev.seciliAlanlar.filter(a => a !== id),
    }));
  };

  const isChecked = (id: string) => (Array.isArray(ayarlar.seciliAlanlar) ? ayarlar.seciliAlanlar : []).includes(id);

  const handleSave = () => {
    void (async () => {
      saveAyarlar(ayarlar);
      try {
        await fetch("/api/v1/ayarlar/sgk-cikis", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(ayarlar),
        });
      } catch {}
      setSaved(true);
      toast.success("Çıkış talep ayarları kaydedildi!");
      setTimeout(() => setSaved(false), 2500);
    })();
  };

  const handleSelectAll = (alanlar: typeof CIKIS_BILGILERI) => {
    const ids = alanlar.map(a => a.id);
    const allChecked = ids.every(id => isChecked(id));
    setAyarlar(prev => ({
      ...prev,
      seciliAlanlar: allChecked
        ? prev.seciliAlanlar.filter(s => !ids.includes(s))
        : [...new Set([...prev.seciliAlanlar, ...ids])],
    }));
  };

  const toggleEvrak = (evrak: string, checked: boolean) => {
    setAyarlar(prev => ({
      ...prev,
      zorunluEvraklar: checked
        ? [...(prev.zorunluEvraklar || []), evrak]
        : (prev.zorunluEvraklar || []).filter(x => x !== evrak),
    }));
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Üst bar */}
      <div className="flex items-center justify-between">
        <div className="text-[12.5px] font-semibold text-gray-400">
          Personel İşlemleri / <span className="text-[#ef5a28] font-bold">Çıkış Talep Ayarları</span>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#ef5a28] hover:bg-[#d94720] text-white px-6 py-2.5 rounded-xl font-extrabold text-[13.5px] shadow-md shadow-[#ef5a28]/25 transition-all active:scale-95"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Kaydedildi!" : "Kaydet"}
        </button>
      </div>

      {/* Kart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Başlık */}
        <div className="mb-6 pb-5 border-b border-gray-100">
          <h1 className="text-[20px] font-black text-[#172b4d]">Çıkış Talep Ayarları</h1>
          <p className="text-[13px] font-medium text-gray-400 mt-1 leading-relaxed max-w-3xl">
            Bu ekrandan, işten çıkış süreçlerinde zorunlu olacak bilgi ve belge alanlarını seçebilir, tüm firmalarınızda standart bir veri toplama yapısı tanımlayabilirsiniz.
            Belirlenen zorunlu alanlar doldurulmadan şubeler personel çıkış talebinde bulunamaz.
          </p>
        </div>

        <h2 className="text-[17px] font-black text-[#ef5a28] mb-1">3. Çıkış Süreci ve İlişik Kesme Bilgileri</h2>
        <p className="text-[12px] font-medium text-gray-400 mb-7">Zorunlu alanları aşağıdan seçerek ilgili taleplere yansıtabilirsiniz.</p>

        <div className="flex flex-col gap-8">
          {GRUPLAR.map(grup => {
            const allChecked = grup.alanlar.every(a => isChecked(a.id));
            return (
              <div key={grup.baslik} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <grup.icon className={`w-5 h-5 ${grup.iconColor}`} />
                    <h3 className="text-[14px] font-black text-[#172b4d]">{grup.baslik}</h3>
                  </div>
                  <button
                    onClick={() => handleSelectAll(grup.alanlar)}
                    className="text-[11.5px] font-bold text-[#ef5a28] hover:underline"
                  >
                    {allChecked ? "Tümünü Kaldır" : "Tümünü Seç"}
                  </button>
                </div>
                <div className="pl-7 flex flex-col gap-2.5">
                  {grup.alanlar.map(alan => (
                    <CheckItem
                      key={alan.id}
                      id={alan.id}
                      label={alan.label}
                      checked={isChecked(alan.id)}
                      onChange={toggle}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Zorunlu Evraklar */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[17px] font-black text-[#ef5a28]">Zorunlu Çıkış Evrakları</h2>
              <p className="text-[12px] font-medium text-gray-400 mt-0.5">Çıkış talebinde yüklenmesi zorunlu olacak evrakları seçin.</p>
            </div>
            <button
              onClick={() => {
                const allChecked = CIKIS_ZORUNLU_EVRAKLAR_LIST.every(e => (ayarlar.zorunluEvraklar || []).includes(e));
                setAyarlar(prev => ({
                  ...prev,
                  zorunluEvraklar: allChecked ? [] : [...CIKIS_ZORUNLU_EVRAKLAR_LIST],
                }));
              }}
              className="text-[11.5px] font-bold text-[#ef5a28] hover:underline"
            >
              {CIKIS_ZORUNLU_EVRAKLAR_LIST.every(e => (ayarlar.zorunluEvraklar || []).includes(e)) ? "Tümünü Kaldır" : "Tümünü Seç"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {CIKIS_ZORUNLU_EVRAKLAR_LIST.map(evrak => (
              <CheckItem
                key={evrak}
                id={evrak}
                label={evrak}
                checked={(ayarlar.zorunluEvraklar || []).includes(evrak)}
                onChange={(id, val) => toggleEvrak(id, val)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}