"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, UploadCloud } from "lucide-react";
import { Evrak } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (evrak: Omit<Evrak, "id">) => void;
}

export function EvrakModal({ isOpen, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<Partial<Evrak>>({
    ad: "",
    dosyaAdi: "",
    boyut: "",
    yuklemeTarihi: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDraft({
        ad: "",
        dosyaAdi: "",
        boyut: "",
        yuklemeTarihi: "",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate file upload
      setDraft((prev) => ({
        ...prev,
        dosyaAdi: file.name,
        boyut: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        yuklemeTarihi: new Date().toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric' }),
      }));
    }
  };

  const handleSave = () => {
    if (!draft.ad || !draft.dosyaAdi) return; // Simple validation
    onSave({
      ad: draft.ad || "",
      dosyaAdi: draft.dosyaAdi || "",
      boyut: draft.boyut || "",
      yuklemeTarihi: draft.yuklemeTarihi || "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#091e42]/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-50 shrink-0">
          <h2 className="text-[16px] font-black text-[#172b4d]">Yeni Evrak Yükle</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center text-gray-500 hover:text-[#172b4d] transition-colors">
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-extrabold text-[#172b4d]">Evrak Adı</label>
            <input
              type="text"
              value={draft.ad || ""}
              onChange={(e) => setDraft({ ...draft, ad: e.target.value })}
              placeholder="Örn: İkametgah Belgesi"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/10 outline-none text-[13.5px] font-medium text-[#172b4d] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-extrabold text-[#172b4d]">Dosya</label>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border-2 border-gray-100 text-[#172b4d] font-extrabold text-[13px] transition-colors whitespace-nowrap"
              >
                Dosya Seç
              </button>
              <span className="text-[13px] font-medium text-gray-500 truncate">
                {draft.dosyaAdi || "Dosya seçilmedi"}
              </span>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t-2 border-gray-50 flex items-center gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-[#172b4d] font-extrabold text-[13px] transition-all active:scale-95">
            İptal
          </button>
          <button 
            onClick={handleSave} 
            disabled={!draft.ad || !draft.dosyaAdi}
            className="flex-1 px-4 py-3 rounded-xl bg-[#111827] hover:bg-[#000000] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold text-[13px] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Yükle
          </button>
        </div>
      </div>
    </div>
  );
}
