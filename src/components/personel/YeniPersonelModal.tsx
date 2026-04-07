import { useState, useEffect } from "react";
import { Plus, X, Building2, Clock, ChevronDown } from "lucide-react";
export interface YeniPersonelData {
  adSoyad: string;
  tckn: string;
  sicil: string;
  sube: string;
  departman: string;
  unvan: string;
  takim: string;
  yonetici: string;
  lokasyon: string;
  isBasTarihi: string;
  calismaTuru: string;
  kilit: boolean;
}
interface YeniPersonelForm {
  ad: string; soyad: string; tckn: string;
  sube: string; departman: string; unvan: string;
  takim: string; yonetici: string; lokasyon: string;
  isBasTarihi: string; calismaTuru: string;
}
const FORM_EMPTY: YeniPersonelForm = { 
  ad:"", soyad:"", tckn:"", sube:"", departman:"", 
  unvan:"", takim:"", yonetici:"", lokasyon:"", 
  isBasTarihi:"", calismaTuru:"Tam Zamanlı" 
};
export function YeniPersonelModal({ onAdd, onClose, submitText = "Kaydet" }: { onAdd: (data: YeniPersonelData) => void; onClose: () => void; submitText?: string }) {
  const [form, setForm] = useState<YeniPersonelForm>(FORM_EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof YeniPersonelForm, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  
  const [subeListesi, setSubeListesi] = useState<any[]>([]);
  const [departmanListesi, setDepartmanListesi] = useState<any[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const subeRes = await fetch("/api/v1/subeler?page=1&pageSize=200", { credentials: "include" });
        if (subeRes.ok) {
          const sJson = await subeRes.json();
          if (sJson.success && Array.isArray(sJson.data)) setSubeListesi(sJson.data);
        }
        
        const depRes = await fetch("/api/v1/departmanlar?page=1&pageSize=200", { credentials: "include" });
        if (depRes.ok) {
          const dJson = await depRes.json();
          if (dJson.success && Array.isArray(dJson.data)) setDepartmanListesi(dJson.data);
        }
      } catch (e) {
        console.error("Şube/Departman verileri çekilemedi", e);
      }
    })();
  }, []);

  const set = (key: keyof YeniPersonelForm, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };
  const validate = () => {
    const e: Partial<Record<keyof YeniPersonelForm, string>> = {};
    if (!form.ad.trim()) e.ad = "Zorunlu Alan";
    if (!form.soyad.trim()) e.soyad = "Zorunlu Alan";
    if (!form.tckn.trim() || form.tckn.length !== 11 || !/^\d{11}$/.test(form.tckn)) e.tckn = "Zorunlu Alan (11 hane)";
    return e;
  };
  const handleSubmit = () => {
    setSubmitted(true);
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const sicil = `PER-${String(Date.now()).slice(-4)}`;
    onAdd({ 
      adSoyad: `${form.ad.trim()} ${form.soyad.trim()}`, 
      tckn: form.tckn, 
      sicil, 
      sube: form.sube,
      departman: form.departman,
      unvan: form.unvan,
      takim: form.takim,
      yonetici: form.yonetici,
      lokasyon: form.lokasyon,
      isBasTarihi: form.isBasTarihi,
      calismaTuru: form.calismaTuru,
      kilit: false 
    });
  };
  const inputCls = (key: keyof YeniPersonelForm) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-[13.5px] font-medium text-[#172b4d] placeholder-gray-400 outline-none transition-all ${
      errors[key] && submitted
        ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-400/20"
        : "border-gray-200 bg-white hover:border-gray-300 focus:border-[#ef5a28] focus:ring-2 focus:ring-[#ef5a28]/10"
    }`;
  const selectCls = `w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-[13.5px] font-medium text-[#172b4d] outline-none appearance-none cursor-pointer hover:border-gray-300 focus:border-[#ef5a28] focus:ring-2 focus:ring-[#ef5a28]/10 transition-all`;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-[640px] max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#172b4d] hover:bg-black flex items-center justify-center transition-colors shadow-md">
          <X className="w-4.5 h-4.5 text-white" />
        </button>
        <div className="p-7 flex flex-col gap-7">
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-[#ef5a28] flex items-center justify-center shadow-md shadow-[#ef5a28]/25">
                <Plus className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-[17px] font-extrabold text-[#172b4d]">Kişisel Bilgiler</h3>
                <p className="text-[12px] font-medium text-gray-400">Personelin temel kimlik bilgilerini girin.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Ad <span className="text-red-500">*</span></label>
                <input value={form.ad} onChange={e=>set("ad",e.target.value)} placeholder="Ahmet" className={inputCls("ad")} />
                {submitted && errors.ad && <span className="text-[11px] font-bold text-red-500">{errors.ad}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Soyad <span className="text-red-500">*</span></label>
                <input value={form.soyad} onChange={e=>set("soyad",e.target.value)} placeholder="Yılmaz" className={inputCls("soyad")} />
                {submitted && errors.soyad && <span className="text-[11px] font-bold text-red-500">{errors.soyad}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">TCKN <span className="text-red-500">*</span></label>
                <input value={form.tckn} onChange={e=>set("tckn",e.target.value.replace(/\D/g,"").slice(0,11))} placeholder="12345678901" maxLength={11} className={inputCls("tckn")} />
                {submitted && errors.tckn && <span className="text-[11px] font-bold text-red-500">{errors.tckn}</span>}
              </div>
            </div>
          </section>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-[#172b4d] flex items-center justify-center shadow-md shadow-[#172b4d]/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[17px] font-extrabold text-[#172b4d]">Kurum ve Kadro Bilgileri</h3>
                <p className="text-[12px] font-medium text-gray-400">Şube, departman ve unvan bilgilerini girin.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {/* Şube */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Şube</label>
                {subeListesi.length > 0 ? (
                  <div className="relative">
                    <select value={form.sube} onChange={e=>set("sube",e.target.value)} className={selectCls}>
                      <option value="">Seçiniz</option>
                      {subeListesi.map(s=><option key={s.id} value={s.name || s.id}>{s.name || s.id}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                ) : (
                  <input value={form.sube} onChange={e=>set("sube",e.target.value)} placeholder="Merkez" className={inputCls("sube")} />
                )}
              </div>
              
              {/* Departman */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Departman</label>
                {departmanListesi.length > 0 ? (
                  <div className="relative">
                    <select value={form.departman} onChange={e=>set("departman",e.target.value)} className={selectCls}>
                      <option value="">Seçiniz</option>
                      {departmanListesi.map(d=><option key={d.id} value={d.name || d.id}>{d.name || d.id}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                ) : (
                  <input value={form.departman} onChange={e=>set("departman",e.target.value)} placeholder="Yazılım" className={inputCls("departman")} />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Unvan</label>
                <input value={form.unvan} onChange={e=>set("unvan",e.target.value)} placeholder="Uzman" className={inputCls("unvan")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Takım</label>
                <input value={form.takim} onChange={e=>set("takim",e.target.value)} placeholder="Ürün Ekibi" className={inputCls("takim")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Yönetici</label>
                <input value={form.yonetici} onChange={e=>set("yonetici",e.target.value)} placeholder="Ad Soyad" className={inputCls("yonetici")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">İş Yeri Lokasyonu</label>
                <input value={form.lokasyon} onChange={e=>set("lokasyon",e.target.value)} placeholder="İstanbul" className={inputCls("lokasyon")} />
              </div>
            </div>
          </section>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-[#0052cc] flex items-center justify-center shadow-md shadow-[#0052cc]/20">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[17px] font-extrabold text-[#172b4d]">İşe Giriş ve İstihdam Bilgileri</h3>
                <p className="text-[12px] font-medium text-gray-400">İşe başlangıç ve çalışma şekli bilgilerini girin.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">İşe Başlama Tarihi</label>
                <input type="date" value={form.isBasTarihi} onChange={e=>set("isBasTarihi",e.target.value)} className={inputCls("isBasTarihi")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Çalışma Türü</label>
                <div className="relative">
                  <select value={form.calismaTuru} onChange={e=>set("calismaTuru",e.target.value)} className={selectCls}>
                    <option>Tam Zamanlı</option>
                    <option>Yarı Zamanlı</option>
                    <option>Sözleşmeli</option>
                    <option>Stajyer</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={onClose} className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-[#172b4d] hover:bg-gray-50 transition-colors">
              <X className="w-4 h-4" /> İptal
            </button>
            <button onClick={handleSubmit} className="flex items-center gap-2 bg-[#ef5a28] hover:bg-[#d94720] text-white font-extrabold text-[13px] px-6 py-2.5 rounded-xl transition-all shadow-md shadow-[#ef5a28]/20 active:scale-95">
              <Plus className="w-4 h-4 stroke-[2.5]" /> {submitText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}