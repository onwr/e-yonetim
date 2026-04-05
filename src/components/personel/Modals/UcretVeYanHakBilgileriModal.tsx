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
        className="w-full pl-4 pr-10 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] outline-none text-[13.5px] font-medium text-[#172b4d] appearance-none focus:ring-4 focus:ring-[#ef5a28]/10 transition-all cursor-pointer"
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
      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10 outline-none text-[13.5px] font-medium text-[#172b4d] transition-all"
    />
  </div>
);

const CurrencyField = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, '');
    if (!raw) {
      onChange('');
      return;
    }
    onChange(new Intl.NumberFormat('tr-TR').format(Number(raw)) + ' ₺');
  };
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-extrabold text-[#172b4d]">{label}</label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder || "Örn: 25.000 ₺"}
        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10 outline-none text-[13.5px] font-medium text-[#172b4d] transition-all"
      />
    </div>
  );
};

const TextAreaField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-extrabold text-[#172b4d]">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10 outline-none text-[13.5px] font-medium text-[#172b4d] transition-all resize-none"
    />
  </div>
);

export function UcretVeYanHakBilgileriModal({ isOpen, onClose, data, onSave }: Props) {
  const [draft, setDraft] = useState<Partial<Personel>>({});

  useEffect(() => {
    if (isOpen) {
      setDraft({
        ucretTipi: data.ucretTipi || "",
        netUcret: data.netUcret || "",
        brutUcret: data.brutUcret || "",
        yemekDestekOdemesi: data.yemekDestekOdemesi || "",
        yemekDestekUcreti: data.yemekDestekUcreti || "",
        yolDestekOdemesi: data.yolDestekOdemesi || "",
        yolDestekUcreti: data.yolDestekUcreti || "",
        sabitEkOdeme1VarMi: data.sabitEkOdeme1VarMi || "",
        sabitEkOdeme1Tutari: data.sabitEkOdeme1Tutari || "",
        sabitEkOdeme1Aciklamasi: data.sabitEkOdeme1Aciklamasi || "",
        sabitEkOdeme2VarMi: data.sabitEkOdeme2VarMi || "",
        sabitEkOdeme2Tutari: data.sabitEkOdeme2Tutari || "",
        sabitEkOdeme2Aciklamasi: data.sabitEkOdeme2Aciklamasi || "",
        servisKullanimDurumu: data.servisKullanimDurumu || "",
        servisNumarasi: data.servisNumarasi || "",
      });
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const set = (key: keyof Partial<Personel>) => (v: string) => setDraft((prev: Partial<Personel>) => ({ ...prev, [key]: v }));

  return (
    <div className="fixed inset-0 bg-[#091e42]/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-50 shrink-0">
          <h2 className="text-[16px] font-black text-[#172b4d]">Ücret ve Yan Hak Bilgileri</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center text-gray-500 hover:text-[#172b4d] transition-colors">
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          <SelectField label="Ücret Tipi" value={draft.ucretTipi || ""} onChange={set("ucretTipi")} options={["Aylık", "Günlük", "Saatlik"]} />
          <CurrencyField label="Net Ücret" value={draft.netUcret || ""} onChange={set("netUcret")} />
          <CurrencyField label="Brüt Ücret" value={draft.brutUcret || ""} onChange={set("brutUcret")} />
          <SelectField label="Yemek Destek Ödemesi" value={draft.yemekDestekOdemesi || ""} onChange={set("yemekDestekOdemesi")} options={["Var", "Yok"]} />
          <CurrencyField label="Yemek Destek Ücreti" value={draft.yemekDestekUcreti || ""} onChange={set("yemekDestekUcreti")} />
          <SelectField label="Yol Destek Ödemesi" value={draft.yolDestekOdemesi || ""} onChange={set("yolDestekOdemesi")} options={["Var", "Yok"]} />
          <CurrencyField label="Yol Destek Ücreti" value={draft.yolDestekUcreti || ""} onChange={set("yolDestekUcreti")} />
          <SelectField label="1. Sabit Ek Ödeme Var mı?" value={draft.sabitEkOdeme1VarMi || ""} onChange={set("sabitEkOdeme1VarMi")} options={["Var", "Yok"]} />
          <CurrencyField label="1. Sabit Ek Ödeme Tutarı" value={draft.sabitEkOdeme1Tutari || ""} onChange={set("sabitEkOdeme1Tutari")} />
          <TextAreaField label="1. Sabit Ek Ödeme Açıklaması" value={draft.sabitEkOdeme1Aciklamasi || ""} onChange={set("sabitEkOdeme1Aciklamasi")} />
          <SelectField label="2. Sabit Ek Ödeme Var mı?" value={draft.sabitEkOdeme2VarMi || ""} onChange={set("sabitEkOdeme2VarMi")} options={["Var", "Yok"]} />
          <CurrencyField label="2. Sabit Ek Ödeme Tutarı" value={draft.sabitEkOdeme2Tutari || ""} onChange={set("sabitEkOdeme2Tutari")} />
          <TextAreaField label="2. Sabit Ek Ödeme Açıklaması" value={draft.sabitEkOdeme2Aciklamasi || ""} onChange={set("sabitEkOdeme2Aciklamasi")} />
          <SelectField label="Servis Kullanım Durumu" value={draft.servisKullanimDurumu || ""} onChange={set("servisKullanimDurumu")} options={["Var", "Yok"]} />
          <TextField label="Servis Numarası" value={draft.servisNumarasi || ""} onChange={set("servisNumarasi")} />
        </div>
        <div className="p-6 border-t-2 border-gray-50 flex items-center gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-[#172b4d] font-extrabold text-[13px] transition-all active:scale-95">İptal</button>
          <button onClick={() => { onSave(draft); onClose(); }} className="flex-1 px-4 py-3 rounded-xl bg-[#111827] hover:bg-[#000000] text-white font-extrabold text-[13px] transition-all active:scale-95 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]"/> Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
