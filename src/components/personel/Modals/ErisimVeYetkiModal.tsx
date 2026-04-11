import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ChevronDown } from "lucide-react";
import { Personel } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: Personel;
  onSave: (updates: Partial<Personel>) => void;
}

const SelectField = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-extrabold text-[#172b4d]">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-4 pr-10 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#0052cc] outline-none text-[13.5px] font-medium text-[#172b4d] appearance-none focus:ring-4 focus:ring-[#0052cc]/10 transition-all cursor-pointer"
      >
        <option value="">Seçiniz</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#172b4d] pointer-events-none stroke-[2.5]" />
    </div>
  </div>
);

const TextField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-extrabold text-[#172b4d]">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/10 outline-none text-[13.5px] font-medium text-[#172b4d] transition-all"
    />
  </div>
);

export default function ErisimVeYetkiModal({ isOpen, onClose, data, onSave }: Props) {
  const [draft, setDraft] = useState<Partial<Personel>>({});

  useEffect(() => {
    if (isOpen) {
      setDraft({
        kurumsalEposta: data.kurumsalEposta || "",
        kurumsalEpostaAdresi: data.kurumsalEpostaAdresi || "",
        kurumsalTelefon: data.kurumsalTelefon || "",
        kurumsalGsm: data.kurumsalGsm || "",
        dahiliyeNo: data.dahiliyeNo || "",
        kartSeriNo: data.kartSeriNo || "",
        parmakIzi: data.parmakIzi || "",
        otoparkYetkisi: data.otoparkYetkisi || "",
        ziyaretciGirisYetki: data.ziyaretciGirisYetki || "",
        manyetikKart: data.manyetikKart || "",
        erpProgramKullanimi: data.erpProgramKullanimi || "",
        kartvizit: data.kartvizit || "",
      });
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const set = (key: keyof Partial<Personel>) => (v: string) => setDraft((prev: Partial<Personel>) => ({ ...prev, [key]: v }));

  return (
    <div className="fixed inset-0 bg-[#091e42]/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-50 shrink-0">
          <h2 className="text-[16px] font-black text-[#172b4d]">Erişim ve Yetki Tanımlamaları</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center text-gray-500 hover:text-[#172b4d] transition-colors">
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          <SelectField label="Kurumsal E-Posta Kullanımı" value={draft.kurumsalEposta || ""} onChange={set("kurumsalEposta")} options={["Var", "Yok"]} />
          <TextField label="Kurumsal E-posta Adresi" value={draft.kurumsalEpostaAdresi || ""} onChange={set("kurumsalEpostaAdresi")} />
          <SelectField label="Kurumsal Telefon Kullanımı" value={draft.kurumsalTelefon || ""} onChange={set("kurumsalTelefon")} options={["Var", "Yok"]} />
          <TextField label="Kurumsal GSM Numarası" value={draft.kurumsalGsm || ""} onChange={set("kurumsalGsm")} />
          <TextField label="Dahiliye Telefon No" value={draft.dahiliyeNo || ""} onChange={set("dahiliyeNo")} />
          <TextField label="Manyetik Giriş Kartı Seri No" value={draft.kartSeriNo || ""} onChange={set("kartSeriNo")} />
          <SelectField label="Parmak İzi Tanımı" value={draft.parmakIzi || ""} onChange={set("parmakIzi")} options={["Var", "Yok"]} />
          <SelectField label="Otopark Kullanım Yetki" value={draft.otoparkYetkisi || ""} onChange={set("otoparkYetkisi")} options={["Var", "Yok"]} />
          <SelectField label="Ziyaretçi Giriş Yetki" value={draft.ziyaretciGirisYetki || ""} onChange={set("ziyaretciGirisYetki")} options={["Var", "Yok"]} />
          <SelectField label="Manyetik Kart Durumu" value={draft.manyetikKart || ""} onChange={set("manyetikKart")} options={["Var", "Yok"]} />
          <SelectField label="Kartvizit" value={draft.kartvizit || ""} onChange={set("kartvizit")} options={["Basıldı", "Basılmadı"]} />
          <SelectField label="ERP Program Kullanımı" value={draft.erpProgramKullanimi || ""} onChange={set("erpProgramKullanimi")} options={["Var", "Yok"]} />
        </div>
        <div className="p-6 border-t-2 border-gray-50 flex items-center gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-[#172b4d] font-extrabold text-[13px] transition-all active:scale-95">İptal</button>
          <button onClick={() => onSave(draft)} className="flex-1 px-4 py-3 rounded-xl bg-[#111827] hover:bg-[#000000] text-white font-extrabold text-[13px] transition-all active:scale-95 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]"/> Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
