"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Building2, MapPin, Users, ArrowLeft, Send, ChevronDown } from "lucide-react";
import { fetchJsonWithError } from "@/lib/fetchJsonWithError";

type ScopeType = "firma" | "sube" | "departman";

const SCOPE_OPTIONS: { id: ScopeType; label: string; sub: string; Icon: any }[] = [
  { id: "firma", label: "Firma Geneli", sub: "Tüm şube ve departmanlara erişim", Icon: Building2 },
  { id: "sube", label: "Şube Geneli", sub: "Sadece seçilen şubeye erişim", Icon: Users },
  { id: "departman", label: "Departman Geneli", sub: "Sadece seçilen departmana erişim", Icon: MapPin },
];

const inputCls =
  "w-full h-12 px-4 rounded-2xl border border-gray-200 text-[14px] font-semibold text-[#172b4d] outline-none focus:border-[#6c63d5] focus:ring-4 focus:ring-[#6c63d5]/10 transition-all placeholder:text-gray-300 placeholder:font-normal bg-white";

const selectCls =
  "w-full h-12 pl-4 pr-10 rounded-2xl border border-gray-200 text-[14px] font-semibold text-[#172b4d] outline-none focus:border-[#6c63d5] focus:ring-4 focus:ring-[#6c63d5]/10 transition-all bg-white appearance-none cursor-pointer";

export default function YeniYetkiliEklePage() {
  const router = useRouter();
  const [scope, setScope] = useState<ScopeType>("firma");
  const [selectedSube, setSelectedSube] = useState("");
  const [selectedDepartman, setSelectedDepartman] = useState("");
  const [departmanListesi, setDepartmanListesi] = useState<string[]>([]);
  const [subeListesi, setSubeListesi] = useState<string[]>([]);

  const [form, setForm] = useState({
    adSoyad: "",
    tckn: "",
    unvan: "",
    telefon: "",
    eposta: "",
    epostaRepeat: "",
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [sent, setSent] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [deps, subs] = await Promise.all([
          fetchJsonWithError<any[]>("/api/v1/departmanlar?page=1&pageSize=200"),
          fetchJsonWithError<any[]>("/api/v1/subeler?page=1&pageSize=200"),
        ]);
        const dnames = (Array.isArray(deps) ? deps : [])
          .map((d: any) => d.departmanAdi || d.name)
          .filter(Boolean);
        setDepartmanListesi(dnames);
        const snames = (Array.isArray(subs) ? subs : []).map((s: any) => s.name).filter(Boolean);
        setSubeListesi(snames);
      } catch {
        setDepartmanListesi([]);
        setSubeListesi([]);
      }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    let value = e.target.value;

    if (name === "telefon") {
      // Strip non-digits, limit to 11 digits (05xx xxx xx xx)
      const digits = value.replace(/\D/g, "").substring(0, 11);
      // Format: 0555 555 55 55
      let formatted = digits;
      if (digits.length > 4) formatted = digits.substring(0, 4) + " " + digits.substring(4);
      if (digits.length > 7) formatted = digits.substring(0, 4) + " " + digits.substring(4, 7) + " " + digits.substring(7);
      if (digits.length > 9) formatted = digits.substring(0, 4) + " " + digits.substring(4, 7) + " " + digits.substring(7, 9) + " " + digits.substring(9);
      value = formatted;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: false }));
  };


  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    if (!form.adSoyad.trim()) newErrors.adSoyad = true;
    if (!form.tckn.trim()) newErrors.tckn = true;
    if (!form.unvan.trim()) newErrors.unvan = true;
    if (!form.telefon.trim()) newErrors.telefon = true;
    if (!form.eposta.trim()) newErrors.eposta = true;
    if (!form.epostaRepeat.trim()) newErrors.epostaRepeat = true;
    if (form.eposta.trim() && form.epostaRepeat.trim() && form.eposta !== form.epostaRepeat) {
      newErrors.epostaRepeat = true;
    }
    if (scope !== "firma" && !selectedSube) newErrors.sube = true;
    if (scope === "departman" && !selectedDepartman) newErrors.departman = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    void (async () => {
      try {
        await fetch("/api/v1/yetkililer/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            adSoyad: form.adSoyad,
            tckn: form.tckn,
            unvan: form.unvan,
            telefon: form.telefon,
            eposta: form.eposta,
            scope,
            sube: selectedSube || undefined,
            departman: selectedDepartman || undefined,
          }),
        });
      } catch {}
      setSent(true);
    })();
  };

  const errCls = (k: string) =>
    errors[k]
      ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100"
      : "";

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (sent) {
    const scopeLabel = scope === "firma" ? "Firma Geneli" : scope === "sube" ? "Şube Geneli" : "Departman Geneli";
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in font-sans">
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl shadow-gray-200/80 p-12 flex flex-col items-center max-w-lg w-full text-center">
          {/* Animated checkmark */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6c63d5] to-[#8b85e0] flex items-center justify-center mb-6 shadow-xl shadow-[#6c63d5]/30">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="w-16 h-1 bg-gradient-to-r from-[#6c63d5] to-[#ff5630] rounded-full mb-6" />

          <h1 className="text-[26px] font-black text-[#172b4d] mb-2">Davet Gönderildi!</h1>
          <p className="text-[14px] text-[#6b778c] font-medium mb-6">
            <span className="font-black text-[#172b4d]">{form.adSoyad}</span> adlı kişiye yetki davet bağlantısı
            başarıyla SMS ile gönderildi.
          </p>

          <div className="w-full bg-[#f8f7ff] rounded-2xl p-4 flex flex-col gap-2 mb-8 border border-[#e8e6ff]">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6b778c] font-semibold">Yetki Kapsamı</span>
              <span className="font-black text-[#6c63d5]">{scopeLabel}</span>
            </div>
            {selectedSube && (
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6b778c] font-semibold">Şube</span>
                <span className="font-bold text-[#172b4d]">{selectedSube}</span>
              </div>
            )}
            {selectedDepartman && (
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6b778c] font-semibold">Departman</span>
                <span className="font-bold text-[#172b4d]">{selectedDepartman}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6b778c] font-semibold">E-posta</span>
              <span className="font-bold text-[#172b4d]">{form.eposta}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6b778c] font-semibold">Telefon</span>
              <span className="font-bold text-[#172b4d]">{form.telefon}</span>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => { setSent(false); setForm({ adSoyad: "", tckn: "", unvan: "", telefon: "", eposta: "", epostaRepeat: "" }); setScope("firma"); setSelectedSube(""); setSelectedDepartman(""); setErrors({}); }}
              className="flex-1 h-12 bg-[#f4f5f8] hover:bg-gray-200 text-[#172b4d] font-bold text-[14px] rounded-xl transition-colors"
            >
              Yeni Ekle
            </button>
            <button
              onClick={() => router.push("/panel/yetkililer/liste")}
              className="flex-1 h-12 bg-[#6c63d5] hover:bg-[#5a52c0] text-white font-bold text-[14px] rounded-xl transition-colors shadow-lg shadow-[#6c63d5]/25"
            >
              Listeye Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-fade-in font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[14px]">
          <span className="text-[#6b778c] font-semibold">İşveren &amp; Yetkili İşlemleri /</span>
          <span className="text-[#6b778c] font-semibold cursor-pointer hover:text-[#ef5a28] transition-colors" onClick={() => router.push("/panel/yetkililer/liste")}>
            Yetkili Listesi /
          </span>
          <span className="text-[#ef5a28] font-bold">Yeni Yetkili Ekle</span>
        </div>
        <button
          onClick={() => router.push("/panel/yetkililer/liste")}
          className="flex items-center gap-2 text-[13px] font-bold text-[#6b778c] hover:text-[#172b4d] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </button>
      </div>

      {/* ── Scope Selector ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-8">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#172b4d] flex items-center justify-center shrink-0 shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-[18px] font-black text-[#172b4d]">Yetki Kapsamını Seçiniz</h2>
            <p className="text-[13px] text-[#6b778c] font-medium mt-1">
              Yetkili kullanıcının sistemdeki erişim seviyesini belirleyin. Firma geneli, belirli bir şube veya
              belirli bir departman için yetki tanımlayabilirsiniz.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {SCOPE_OPTIONS.map(({ id, label, sub, Icon }) => {
            const active = scope === id;
            return (
              <button
                key={id}
                onClick={() => { setScope(id); setSelectedSube(""); setSelectedDepartman(""); }}
                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                  active
                    ? "border-[#6c63d5] bg-[#f0eeff] shadow-lg shadow-[#6c63d5]/10"
                    : "border-gray-100 bg-white hover:border-[#6c63d5]/40 hover:bg-[#f8f7ff]"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    active ? "bg-[#6c63d5]" : "bg-gray-100"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${active ? "text-white" : "text-gray-500"}`} />
                </div>
                <div className="text-center">
                  <p className={`text-[14px] font-black ${active ? "text-[#6c63d5]" : "text-[#172b4d]"}`}>{label}</p>
                  <p className="text-[11px] text-[#6b778c] font-medium mt-0.5">{sub}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Conditional dropdowns */}
        {scope !== "firma" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-[#f8f9fc] rounded-2xl p-5 border border-gray-100">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-extrabold text-[#172b4d] uppercase tracking-wide">
                Şube Seçimi
              </label>
              <div className="relative">
                <select
                  value={selectedSube}
                  onChange={(e) => setSelectedSube(e.target.value)}
                  className={selectCls}
                >
                  <option value="">Şube Seçiniz</option>
                  {(subeListesi.length ? subeListesi : ["—"]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {scope === "departman" && (
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-extrabold text-[#172b4d] uppercase tracking-wide">
                  Departman Seçimi
                </label>
                <div className="relative">
                  <select
                    value={selectedDepartman}
                    onChange={(e) => setSelectedDepartman(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Departman Seçiniz</option>
                    {departmanListesi.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── User Info Form ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-8">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#172b4d] flex items-center justify-center shrink-0 shadow-md">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-[18px] font-black text-[#172b4d]">Şube Yetkilisi Bilgileri</h2>
            <p className="text-[13px] text-[#6b778c] font-medium mt-1">
              Firmanız adına sisteme tanımlı yetkili kişiye ait ad, soyad, iletişim ve görev bilgileri bu modül
              üzerinden tek noktadan yönetilebilir. Bilgilerin güncel tutulması, tüm resmi işlemlerin ve sistem
              bildirimlerinin doğru muhataba zamanında ve eksiksiz ulaşmasını sağlar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-extrabold text-[#172b4d] uppercase tracking-wide">Ad Soyad</label>
            <input name="adSoyad" value={form.adSoyad} onChange={handleChange} placeholder="Ali Atalan" className={`${inputCls} ${errCls('adSoyad')}`} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-extrabold text-[#172b4d] uppercase tracking-wide">T.C. Kimlik No</label>
            <input name="tckn" value={form.tckn} onChange={handleChange} placeholder="12345678901" maxLength={11} className={`${inputCls} ${errCls('tckn')}`} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-extrabold text-[#172b4d] uppercase tracking-wide">Ünvanı</label>
            <input name="unvan" value={form.unvan} onChange={handleChange} placeholder="Yönetim Kurulu Başkanı" className={`${inputCls} ${errCls('unvan')}`} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-extrabold text-[#172b4d] uppercase tracking-wide">Telefon</label>
            <input name="telefon" value={form.telefon} onChange={handleChange} placeholder="0312 789 6543" className={`${inputCls} ${errCls('telefon')}`} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-extrabold text-[#172b4d] uppercase tracking-wide">E-Posta</label>
            <input name="eposta" type="email" value={form.eposta} onChange={handleChange} placeholder="şubeyetkilisi@mailadresi.com" className={`${inputCls} ${errCls('eposta')}`} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-extrabold text-[#172b4d] uppercase tracking-wide">E-Posta (Tekrar) {errors.epostaRepeat && form.epostaRepeat && <span className="text-red-500 text-[10px] normal-case font-bold">E-postalar eşleşmiyor</span>}</label>
            <input name="epostaRepeat" type="email" value={form.epostaRepeat} onChange={handleChange} placeholder="şubeyetkilisi@mailadresi.com" className={`${inputCls} ${errCls('epostaRepeat')}`} />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full h-14 bg-[#6c63d5] hover:bg-[#5a52c0] text-white font-black text-[15px] rounded-2xl transition-all shadow-lg shadow-[#6c63d5]/25 hover:shadow-[#6c63d5]/40 active:scale-[0.99] flex items-center justify-center gap-3"
        >
          <Send className="w-5 h-5" />
          Yetki Davet Linkini SMS Adresine Gönder
        </button>
      </div>
    </div>
  );
}