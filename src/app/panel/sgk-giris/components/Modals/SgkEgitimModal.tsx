"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { SgkEgitim } from "@/types";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (egitim: SgkEgitim) => void;
}

const TextField = ({ label, value, onChange, placeholder = "", type = "text", required = false }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-extrabold text-[#172b4d] flex items-center gap-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] outline-none text-[13.5px] font-medium text-[#172b4d] focus:ring-4 focus:ring-[#ef5a28]/10 transition-all placeholder:text-gray-400"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required = false }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-extrabold text-[#172b4d] flex items-center gap-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-4 pr-10 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] outline-none text-[13.5px] font-medium text-[#172b4d] appearance-none focus:ring-4 focus:ring-[#ef5a28]/10 transition-all cursor-pointer bg-white"
      >
        <option value="" disabled>Seçiniz</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
    </div>
  </div>
);

export default function SgkEgitimModal({ isOpen, onClose, onSave }: Props) {
  const [egitim, setEgitim] = useState<Omit<SgkEgitim, "id">>({
    egitimDurumu: "",
    okulAdi: "",
    bolum: "",
    mezuniyetYili: "",
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!egitim.egitimDurumu || !egitim.okulAdi || !egitim.bolum || !egitim.mezuniyetYili) {
      toast.error("Lütfen tüm zorunlu alanları doldurunuz.");
      return;
    }
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      ...egitim
    });
    // Reset
    setEgitim({ egitimDurumu: "", okulAdi: "", bolum: "", mezuniyetYili: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-[16px] font-black text-[#172b4d]">Eğitim Kaydı Ekle</h2>
            <p className="text-[12.5px] font-medium text-gray-500 mt-0.5">Personelin akademik geçmişini sisteme ekleyin.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          <SelectField 
            label="Eğitim Durumu" 
            value={egitim.egitimDurumu} 
            onChange={(v: string) => setEgitim(prev => ({ ...prev, egitimDurumu: v }))}
            options={["İlköğretim", "Lise", "Önlisans", "Lisans", "Yüksek Lisans", "Doktora"]}
            required
          />
          <TextField 
            label="Mezun Olunan Okul" 
            value={egitim.okulAdi} 
            onChange={(v: string) => setEgitim(prev => ({ ...prev, okulAdi: v }))} 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField 
              label="Mezun Olunan Bölüm" 
              value={egitim.bolum} 
              onChange={(v: string) => setEgitim(prev => ({ ...prev, bolum: v }))} 
              required 
            />
            <SelectField 
              label="Mezuniyet Yılı" 
              value={egitim.mezuniyetYili} 
              onChange={(v: string) => setEgitim(prev => ({ ...prev, mezuniyetYili: v }))}
              options={Array.from({length: 45}, (_, i) => (new Date().getFullYear() - i).toString())}
              required
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white z-10">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            İptal
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-[13px] font-bold bg-[#ef5a28] hover:bg-[#d9491a] text-white transition-colors"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
