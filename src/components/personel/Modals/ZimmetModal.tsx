"use client";
import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Calendar } from "lucide-react";
import { Zimmet } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (zimmet: Omit<Zimmet, "id">) => void;
}

const TextField = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-extrabold text-[#172b4d]">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/10 outline-none text-[13.5px] font-medium text-[#172b4d] transition-all"
    />
  </div>
);

const DateField = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 8) val = val.substring(0, 8);
    let formatted = val;
    if (val.length > 2) formatted = val.substring(0, 2) + '.' + val.substring(2);
    if (val.length > 4) formatted = formatted.substring(0, 5) + '.' + val.substring(4);
    onChange(formatted);
  };
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-extrabold text-[#172b4d]">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder || "gg.aa.yyyy"}
          maxLength={10}
          className="w-full pl-4 pr-11 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/10 outline-none text-[13.5px] font-medium text-[#172b4d] transition-all"
        />
        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#172b4d] pointer-events-none stroke-[2.5]" />
      </div>
    </div>
  );
};

export function ZimmetModal({ isOpen, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<Partial<Zimmet>>({
    demirbasAdi: "",
    markaModel: "",
    seriNo: "",
    depoKodu: "",
    adet: "1",
    teslimTarihi: "",
    durum: "Aktif",
  });

  useEffect(() => {
    if (isOpen) {
      setDraft({
        demirbasAdi: "",
        markaModel: "",
        seriNo: "",
        depoKodu: "",
        adet: "1",
        teslimTarihi: "",
        durum: "Aktif",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (key: keyof Partial<Zimmet>) => (v: string) => setDraft((prev) => ({ ...prev, [key]: v }));

  const handleSave = () => {
    onSave(draft as Omit<Zimmet, "id">);
    onClose();
  };

  const isFormValid = !!(draft.demirbasAdi && draft.markaModel && draft.seriNo && draft.depoKodu && draft.adet && draft.teslimTarihi);

  return (
    <div className="fixed inset-0 bg-[#091e42]/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-50 shrink-0">
          <h2 className="text-[16px] font-black text-[#172b4d]">Zimmet Kaydı Oluştur</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center text-gray-500 hover:text-[#172b4d] transition-colors">
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          <TextField label="Demirbaş / Ekipman Adı" value={draft.demirbasAdi || ""} onChange={set("demirbasAdi")} placeholder="Laptop, Telefon..." />
          <TextField label="Marka / Model" value={draft.markaModel || ""} onChange={set("markaModel")} placeholder="Örn: ASUS ZenBook" />
          <TextField label="Seri No" value={draft.seriNo || ""} onChange={set("seriNo")} placeholder="SN1234..." />
          <TextField label="Depo Kodu" value={draft.depoKodu || ""} onChange={set("depoKodu")} placeholder="BT001" />
          <TextField label="Zimmet Adeti" value={draft.adet || ""} onChange={set("adet")} placeholder="1" />
          <DateField label="Teslim Tarihi" value={draft.teslimTarihi || ""} onChange={set("teslimTarihi")} placeholder="gg.aa.yyyy" />
        </div>
        <div className="p-6 border-t-2 border-gray-50 flex items-center gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-[#172b4d] font-extrabold text-[13px] transition-all active:scale-95">İptal</button>
          <button 
            onClick={handleSave} 
            disabled={!isFormValid}
            className="flex-1 px-4 py-3 rounded-xl bg-[#111827] hover:bg-[#000000] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold text-[13px] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]"/> Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
