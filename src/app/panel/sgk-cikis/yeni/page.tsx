"use client";

import React, { useEffect, useState } from "react";
import { UserMinus, Calendar, AlertCircle, CheckCircle2, ChevronDown, ArrowLeft, User, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const CIKIS_NEDENLERI = [
  "03 - İstifa",
  "04 - İşveren Feshi (Geçerli Sebep)",
  "01 - Deneme Süreli Fesih",
  "02 - Deneme Süreli Fesih (İşveren)",
  "05 - İşveren Feshi (Geçersiz Sebep)",
  "11 - İşçi Feshi (Haklı Sebep)",
  "17 - İstifa (Zorlayıcı Sebep)",
  "22 - Diğer Nedenler",
  "29 - Emeklilik",
  "43 - Vefat",
];

export default function SgkCikisYeniTalepPage() {
  const router = useRouter();
  const [personeller, setPersoneller] = useState<any[]>([]);

  const [personelId, setPersonelId] = useState("");
  const [cikisTarihi, setCikisTarihi] = useState("");
  const [cikisNedeni, setCikisNedeni] = useState(CIKIS_NEDENLERI[0]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [evraklar, setEvraklar] = useState<{ id: string; isim: string; durum: "bekliyor" | "yukleniyor" | "yuklendi"; url: string | null }[]>([]);

  const handleEvrakYukle = async (id: string, file: File) => {
    if (!file) return;
    setEvraklar(prev => prev.map(e => e.id === id ? { ...e, durum: "yukleniyor" } : e));
    try {
      const body = new FormData();
      body.set("file", file, file.name);

      const res = await fetch("/api/v1/documents/upload", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success || !json?.data?.path) {
        throw new Error(json?.error?.message || "Dosya yüklenemedi.");
      }
      setEvraklar(prev => prev.map(e => e.id === id ? { ...e, durum: "yuklendi", url: String(json.data.path) } : e));
      toast.success(`${file.name} başarıyla yüklendi!`);
    } catch (e) {
      setEvraklar(prev => prev.map(e => e.id === id ? { ...e, durum: "bekliyor" } : e));
      toast.error(e instanceof Error ? e.message : "Dosya yüklenemedi. Sistemsel bir hata oluştu veya bağlantınız koptu.");
    }
  };

  const eksikEvraklar = evraklar.filter(e => e.durum !== "yuklendi");

  useEffect(() => {
    void (async () => {
      try {
        const [personelRes, ayarlarRes] = await Promise.all([
          fetch("/api/v1/personel?page=1&pageSize=500", { credentials: "include" }),
          fetch("/api/v1/ayarlar/sgk-cikis", { credentials: "include" }),
        ]);

        if (personelRes.ok) {
          const json = (await personelRes.json()) as { success?: boolean; data?: any[] };
          if (json.success && Array.isArray(json.data)) {
            setPersoneller(
              json.data.map((item) => {
                const j =
                  item.personelJson && typeof item.personelJson === "object" && !Array.isArray(item.personelJson)
                    ? (item.personelJson as Record<string, unknown>)
                    : {};
                return {
                  ...item,
                  ...j,
                  adSoyad: String(item.adSoyad ?? j.adSoyad ?? "").trim(),
                  tckn: String(item.tckn ?? j.tckn ?? "").trim(),
                  unvan: item.unvan != null && String(item.unvan).trim() ? item.unvan : j.unvan ?? item.unvan,
                  org: item.org != null && String(item.org).trim() ? item.org : j.org ?? item.org,
                };
              }),
            );
          }
        }

        // Ayarlardan zorunlu evrakları çek
        if (ayarlarRes.ok) {
          const ayarlarJson = (await ayarlarRes.json()) as { success?: boolean; data?: { seciliAlanlar?: string[]; zorunluEvraklar?: string[] } };
          const zorunluEvraklar = ayarlarJson?.data?.zorunluEvraklar;
          if (Array.isArray(zorunluEvraklar) && zorunluEvraklar.length > 0) {
            setEvraklar(
              zorunluEvraklar.map(isim => ({
                id: isim.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
                isim,
                durum: "bekliyor" as const,
                url: null,
              }))
            );
          } else {
            // Ayarlarda evrak tanımlanmamışsa varsayılan 3 evrakı kullan
            setEvraklar([
              { id: "istifa", isim: "İstifa Dilekçesi", durum: "bekliyor", url: null },
              { id: "fesih", isim: "Fesih Bildirimi", durum: "bekliyor", url: null },
              { id: "ibraname", isim: "İbraname / Çıkış Mutabakatı", durum: "bekliyor", url: null },
            ]);
          }
        }
      } catch {
        // Hata durumunda varsayılan evraklar
        setEvraklar([
          { id: "istifa", isim: "İstifa Dilekçesi", durum: "bekliyor", url: null },
          { id: "fesih", isim: "Fesih Bildirimi", durum: "bekliyor", url: null },
          { id: "ibraname", isim: "İbraname / Çıkış Mutabakatı", durum: "bekliyor", url: null },
        ]);
      }
    })();
  }, []);

  const personelListesi = personeller;
  const seciliPersonel = personelListesi.find((p: any) => String(p.id) === personelId) || null;

  const handleSubmit = () => {
    if (personelListesi.length === 0) { toast.error("Şu anda sistemde kayıtlı aktif bir personel bulunmuyor."); return; }
    if (!personelId) { toast.error("Lütfen çıkışı yapılacak personeli seçiniz."); return; }
    if (!cikisTarihi) { toast.error("Lütfen çıkış tarihini giriniz."); return; }
    if (eksikEvraklar.length > 0) {
      toast.error(`Eksik evrak var: Lütfen ${eksikEvraklar.map(e => e.isim).join(", ")} belgelerini eksiksiz yükleyiniz.`);
      return;
    }

    setSubmitting(true);
    const now = new Date();
    const tarihStr = `${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}.${now.getFullYear()}`;

    const yeniTalep = {
      id: `SGK-CKS-${now.getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      sgkNo: seciliPersonel?.tckn || "",
      tckn: seciliPersonel?.tckn || "",
      adSoyad: seciliPersonel?.adSoyad || "",
      sirket: seciliPersonel?.org || "",
      sube: seciliPersonel?.sube || "-",
      departman: seciliPersonel?.org || "-",
      unvan: seciliPersonel?.unvan || "-",
      durum: "BEKLEYEN",
      tarih: tarihStr,
      type: "sgk-cikis",
      cikisNedeni,
      cikisTarihi,
      personelId: seciliPersonel?.id,
      evrakUrl: evraklar[0].url,
      evraklar: evraklar.map(e => ({ isim: e.isim, dosyaUrl: e.url, durum: e.durum })),
    };

    void (async () => {
      try {
        const response = await fetch("/api/v1/talepler", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...yeniTalep, type: "sgk-cikis" }),
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error((err as any)?.error?.message ?? "Talep olusturulamadi");
        }
        setSubmitting(false);
        setSubmitted(true);
        toast.success("SGK Çıkış talebi başarıyla oluşturuldu!");
        setTimeout(() => router.push("/panel/sgk-cikis/liste"), 1500);
      } catch (e) {
        setSubmitting(false);
        toast.error(e instanceof Error ? e.message : "Talep kaydı başarısız oldu.");
      }
    })();
  };

  if (submitted) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-5">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <div className="text-center">
          <h2 className="text-[20px] font-black text-[#172b4d]">Talep Oluşturuldu</h2>
          <p className="text-[13px] font-medium text-gray-500 mt-1">SGK Çıkış talebi onay sürecine alındı. Yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* Üst bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[12.5px] font-bold text-gray-500 hover:text-[#172b4d] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Geri
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-[12.5px] font-bold text-[#ef5a28]">SGK İşten Çıkış Talebi</span>
      </div>

      {/* 2 sütunlu layout */}
      <div className="grid grid-cols-5 gap-6">
        {/* Sol: Form */}
        <div className="col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-7 flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
              <UserMinus className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-[16px] font-black text-[#172b4d]">SGK İşten Çıkış Talebi</h1>
              <p className="text-[12px] font-medium text-gray-400">Personel seçin, çıkış tarihi ve nedenini girerek talep oluşturun.</p>
            </div>
          </div>

          {/* Personel */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-extrabold text-[#172b4d] flex items-center gap-1">
              Personel <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={personelId}
                onChange={(e) => setPersonelId(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10 outline-none text-[13px] font-medium text-[#172b4d] transition-all bg-white"
              >
                {personelListesi.length === 0 ? (
                  <option value="">Sistemde kayıtlı personel bulunamadı</option>
                ) : (
                  <option value="">Personel seçiniz</option>
                )}
                {personelListesi.map((p: any) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.adSoyad} — {p.tckn}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Çıkış Tarihi ve Neden — yan yana */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-extrabold text-[#172b4d] flex items-center gap-1">
                Çıkış Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={cikisTarihi}
                onChange={(e) => setCikisTarihi(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10 outline-none text-[13px] font-medium text-[#172b4d] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-extrabold text-[#172b4d] flex items-center gap-1">
                Çıkış Nedeni <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={cikisNedeni}
                  onChange={(e) => setCikisNedeni(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 rounded-xl border-2 border-[#ef5a28]/30 hover:border-[#ef5a28]/60 focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10 outline-none text-[13px] font-medium text-[#172b4d] transition-all bg-white"
                >
                  {CIKIS_NEDENLERI.map((neden: string) => (
                    <option key={neden} value={neden}>{neden}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Evrak Yükleme */}
          <div className="flex flex-col gap-3 pt-2">
            <label className="text-[12px] font-extrabold text-[#172b4d] flex items-center gap-1">
              Zorunlu Çıkış Evrakları <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {evraklar.map((evrak) => (
                <div key={evrak.id} className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50 text-center transition-colors hover:border-gray-300">
                  <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 w-full flex flex-col gap-1 items-center justify-center mt-1">
                    <span className="text-[11px] font-extrabold text-[#172b4d]">{evrak.isim}</span>
                    {evrak.durum === "yuklendi" ? (
                      <div className="flex flex-col items-center justify-center gap-1.5 mt-1.5">
                        <p className="text-[10.5px] font-black text-green-600 flex items-center gap-1 justify-center"><CheckCircle2 className="w-3.5 h-3.5" /> Yüklendi</p>
                        <button onClick={() => setEvraklar(prev => prev.map(e => e.id === evrak.id ? { ...e, durum: "bekliyor", url: null } : e))} className="text-[10px] font-extrabold text-red-500 hover:underline tracking-wide bg-red-50 px-2.5 py-1 rounded border border-red-100">KALDIR</button>
                      </div>
                    ) : evrak.durum === "yukleniyor" ? (
                      <div className="text-[11px] font-bold text-[#ef5a28] flex items-center gap-1.5 mt-2 justify-center"><span className="block w-3 h-3 border-2 border-[#ef5a28]/40 border-t-[#ef5a28] rounded-full animate-spin" /> Yükleniyor...</div>
                    ) : (
                      <div className="flex flex-col items-center mt-1.5">
                        <label className="text-[10.5px] font-extrabold text-[#0052cc] hover:underline cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-1.5 rounded-lg border border-blue-200 uppercase tracking-wide">
                          Dosya Seç
                          <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => {
                            if (e.target.files && e.target.files[0]) handleEvrakYukle(evrak.id, e.target.files[0]);
                          }} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Uyarı */}
          <div className="flex items-start gap-2.5 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] font-semibold text-orange-600 leading-relaxed">
              Bu talep onaylandığında personel sistemden çıkarılacak ve SGK çıkış bildirimi oluşturulacaktır.
            </p>
          </div>

          {/* Butonlar */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => router.back()}
              className="py-3 rounded-xl border-2 border-gray-200 text-[13px] font-extrabold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-[13px] font-extrabold transition-all shadow-md shadow-red-100 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Oluşturuluyor...</>
              ) : "Talep Oluştur"}
            </button>
          </div>
        </div>

        {/* Sağ: Personel Önizleme + Bilgi */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Seçili Personel Kartı */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-[12px] font-black text-gray-400 tracking-widest mb-4">SEÇİLİ PERSONEL</h3>
            {seciliPersonel ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#172b4d]/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-[#172b4d]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-[#172b4d]">{seciliPersonel.adSoyad}</p>
                    <p className="text-[11.5px] font-bold text-[#ef5a28]">{seciliPersonel.unvan || "—"}</p>
                  </div>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "TC Kimlik", value: seciliPersonel.tckn },
                    { label: "Departman", value: seciliPersonel.org || "—" },
                    { label: "Sicil No", value: seciliPersonel.sicil || "—" },
                    { label: "Statü", value: seciliPersonel.statu || "Aktif" },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-0.5">
                      <span className="text-[10.5px] font-black text-gray-400 uppercase tracking-wide">{item.label}</span>
                      <span className="text-[12.5px] font-bold text-[#172b4d]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-[12px] font-semibold text-gray-400">Personel seçilmedi</p>
              </div>
            )}
          </div>

          {/* Çıkış Kodları Bilgi */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-[12px] font-black text-gray-400 tracking-widest mb-3">ÇIKIŞ KOD AÇIKLAMALARI</h3>
            <div className="flex flex-col gap-2">
              {[
                { kod: "03", aciklama: "İstifa" },
                { kod: "04", aciklama: "İşveren Feshi (Geçerli)" },
                { kod: "01", aciklama: "Deneme Süreli Fesih" },
                { kod: "22", aciklama: "Diğer Nedenler" },
                { kod: "29", aciklama: "Emeklilik" },
              ].map((item) => (
                <div key={item.kod} className="flex items-center gap-2">
                  <span className="w-8 h-5 rounded-md bg-[#ef5a28]/10 text-[10px] font-black text-[#ef5a28] flex items-center justify-center flex-shrink-0">{item.kod}</span>
                  <span className="text-[12px] font-semibold text-gray-500">{item.aciklama}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}