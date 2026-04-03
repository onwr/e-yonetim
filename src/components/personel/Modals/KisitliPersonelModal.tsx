"use client";
import React, { useState, useEffect } from "react";
import { X, AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import { KisitliPersonel } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (personel: Omit<KisitliPersonel, "id" | "eklenmeTarihi" | "durum">) => void;
}

export function KisitliPersonelModal({ isOpen, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<Partial<KisitliPersonel>>({
    tckn: "",
    neden: "",
    aciklama: "",
  });

  // We need distinct states for ad and soyad even though interface has adSoyad, but we can combine them onSave.
  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDraft({
        tckn: "",
        neden: "",
        aciklama: ""
      });
      setAd("");
      setSoyad("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isFormValid = draft.tckn && ad && soyad && draft.neden;

  const handleSave = () => {
    if (!isFormValid) return;
    onSave({
      adSoyad: `${ad} ${soyad}`,
      tckn: draft.tckn || "",
      neden: draft.neden || "",
      aciklama: draft.aciklama || ""
    });
    onClose();
  };

  const nedenOptions = [
    "Şirket Politikalarına Aykırılık",
    "Performans Yetersizliği",
    "Zimmet / Mali Suistimal",
    "Taciz / Şiddet",
    "İşe Devamsızlık",
    "Güven İhlali",
    "Hukuki Engel / Adli Sicil",
    "Diğer"
  ];

  return (
    <div className="fixed inset-0 bg-[#091e42]/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between p-8 shrink-0 relative">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col gap-1.5 mt-1">
              <h2 className="text-[18px] font-black text-[#172b4d]">Yeni Kısıtlı Personel Talebi</h2>
              <p className="text-[13px] font-medium text-gray-500 max-w-xl leading-relaxed">
                Oluşturduğunuz talep Admin onayına gönderilecektir. Onaylanması durumunda personel kısıtlı listesine eklenecektir.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-[#172b4d] transition-colors absolute top-6 right-6">
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
        
        {/* Form Body */}
        <div className="px-8 pb-8 overflow-y-auto flex flex-col gap-6">
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-extrabold text-[#172b4d]">T.C. Kimlik Numarası <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={draft.tckn || ""}
                onChange={(e) => setDraft({ ...draft, tckn: e.target.value.replace(/[^0-9]/g, '').slice(0, 11) })}
                placeholder="11 haneli TCKN"
                maxLength={11}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10 outline-none text-[13.5px] font-medium text-[#172b4d] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-extrabold text-[#172b4d]">Adı <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                placeholder="Adı"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10 outline-none text-[13.5px] font-medium text-[#172b4d] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-extrabold text-[#172b4d]">Soyadı <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={soyad}
                onChange={(e) => setSoyad(e.target.value)}
                placeholder="Soyadı"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10 outline-none text-[13.5px] font-medium text-[#172b4d] transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-extrabold text-[#172b4d]">Listeye Alınma Nedeni <span className="text-red-500">*</span></label>
            <div className="relative">
              <select
                value={draft.neden || ""}
                onChange={(e) => setDraft({ ...draft, neden: e.target.value })}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] outline-none text-[13.5px] font-medium text-[#172b4d] appearance-none focus:ring-4 focus:ring-[#ef5a28]/10 transition-all cursor-pointer"
              >
                <option value="">Seçiniz</option>
                {nedenOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#172b4d] pointer-events-none stroke-[2.5]" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-extrabold text-[#172b4d]">Listeye Alınma Açıklaması</label>
            <textarea
              value={draft.aciklama || ""}
              onChange={(e) => setDraft({ ...draft, aciklama: e.target.value })}
              rows={4}
              placeholder="Kısıtlama gerekçesini ayrıntılı açıklayınız..."
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] focus:ring-4 focus:ring-[#ef5a28]/10 outline-none text-[13.5px] font-medium text-[#172b4d] transition-all resize-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex items-center justify-end shrink-0">
          <button 
            onClick={handleSave} 
            disabled={!isFormValid}
            className="px-6 py-3 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold text-[13px] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]"/> Onaya Gönder
          </button>
        </div>

      </div>
    </div>
  );
}

