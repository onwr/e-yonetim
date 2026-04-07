import React from 'react';
import { X, UserMinus, Download, Eye, Calendar, FileText, Building2 } from 'lucide-react';

interface InfoRowProps {
  label: string;
  value: string | undefined | null;
}

const InfoBox = ({ label, value }: InfoRowProps) => (
  <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">{label}</span>
    <span className={`text-[13px] font-bold ${value && value !== 'Belirtilmedi' && value !== '-' ? 'text-[#172b4d]' : 'text-gray-300 italic'}`}>
      {value || 'Belirtilmedi'}
    </span>
  </div>
);

interface SgkCikisTalebiModalProps {
  talep: any;
  onClose: () => void;
  onApprove: (id: string) => void;
}

export default function SgkCikisTalebiModal({ talep, onClose, onApprove }: SgkCikisTalebiModalProps) {
  if (!talep) return null;

  return (
    <div className="fixed inset-0 bg-[#0a1a3a]/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center shadow-sm">
              <UserMinus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-[#172b4d]">SGK Çıkış Talebi Detayları</h2>
              <div className="flex items-center gap-1.5 mt-0.5 text-[12px] font-bold">
                <span className="text-gray-400">ID:</span>
                <span className="text-[#ef5a28]">{talep.id || '#TLP-0000'}</span>
                <span className="text-gray-300 ml-1">•</span>
                <span className="text-gray-500 ml-1">{talep.adSoyad}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          <div className="flex flex-col gap-8">
            {/* PERSONEL BİLGİLERİ */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 bg-[#ef5a28] rounded-full"></div>
                <h3 className="text-[13px] font-black text-[#172b4d] tracking-wider uppercase">Personel ve İstihdam Bilgileri</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoBox label="AD SOYAD" value={talep.adSoyad} />
                <InfoBox label="TC KİMLİK NO" value={talep.tckn} />
                <div className="col-span-2">
                  <InfoBox label="ŞİRKET / KURUM" value={talep.sirket} />
                </div>
                <InfoBox label="ŞUBE" value={talep.sube} />
                <InfoBox label="DEPARTMAN" value={talep.departman} />
                <div className="col-span-2">
                  <InfoBox label="ÜNVAN / GÖREV" value={talep.unvan} />
                </div>
              </div>
            </div>

            {/* ÇIKIŞ DETAYLARI */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 bg-red-500 rounded-full"></div>
                <h3 className="text-[13px] font-black text-red-900 tracking-wider uppercase">İşten Çıkış Detayları</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoBox label="ÇIKIŞ TARİHİ" value={talep.cikisTarihi} />
                <div className="col-span-2">
                  <InfoBox label="ÇIKIŞ NEDENİ (SGK KODU)" value={talep.cikisNedeni} />
                </div>
              </div>
            </div>

            {/* ÇIKIŞ EVRAKI */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                <h3 className="text-[13px] font-black text-blue-900 tracking-wider uppercase">İlgili Çıkış Evrakları</h3>
              </div>
              
              {(() => {
                const evraklar = talep.evraklar || talep.talepJson?.evraklar;
                if (evraklar && Array.isArray(evraklar) && evraklar.length > 0) {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {evraklar.map((e: any, idx: number) => {
                        const hasUrl = e.dosyaUrl && typeof e.dosyaUrl === 'string';
                        return (
                          <div key={idx} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${hasUrl ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-400'}`}>
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[12px] font-extrabold text-[#172b4d]">{e.isim || 'Evrak'}</span>
                                <span className={`text-[10px] font-bold mt-1 uppercase tracking-wide ${hasUrl ? 'text-green-500' : 'text-gray-400'}`}>
                                  {hasUrl ? 'Belge Yüklendi' : 'Yüklenmemiş'}
                                </span>
                              </div>
                            </div>
                            {hasUrl && (
                              <div className="flex gap-2 w-full pt-2 border-t border-gray-100">
                                <button 
                                  onClick={() => window.open(e.dosyaUrl, '_blank')}
                                  className="flex-1 h-8 flex items-center justify-center gap-1.5 rounded-lg bg-white border border-gray-200 text-[#172b4d] hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm text-[11px] font-bold"
                                  title="İncele"
                                >
                                  <Eye className="w-3.5 h-3.5" /> İncele
                                </button>
                                <a 
                                  href={e.dosyaUrl}
                                  download={`Cikis_${e.isim}_${talep.tckn}`}
                                  className="flex-1 h-8 flex items-center justify-center gap-1.5 rounded-lg bg-[#ef5a28] border border-[#ef5a28] text-white hover:bg-[#d4481b] transition-colors shadow-sm text-[11px] font-bold"
                                  title="İndir"
                                >
                                  <Download className="w-3.5 h-3.5" /> İndir
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                } else if (!talep.evrakUrl) {
                  return (
                    <div className="bg-orange-50 text-orange-600 border border-orange-100 rounded-xl p-4 text-[12.5px] font-bold text-center">
                      Bu talebe eklenmiş bir evrak bulunamadı.
                    </div>
                  );
                } else {
                  return (
                    <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 flex items-center justify-between max-w-[400px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[12.5px] font-bold text-[#172b4d]">Çıkış Evrakı / Fesih Bildirimi</span>
                          <span className="text-[10.5px] font-bold mt-1 text-green-500">
                            Belge Yüklendi
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.open(talep.evrakUrl, '_blank')}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-[#172b4d] hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm"
                          title="İncele"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a 
                          href={talep.evrakUrl}
                          download={`Cikis_Evraki_${talep.tckn}`}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#ef5a28] border border-[#ef5a28] text-white hover:bg-[#d4481b] transition-colors shadow-sm"
                          title="İndir"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/30 shrink-0 flex items-center justify-end gap-3 rounded-b-[1.5rem]">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-[#172b4d] text-[13px] font-black tracking-wide hover:bg-gray-50 transition-colors"
          >
            PENCEREYİ KAPAT
          </button>
          {talep.durum === 'BEKLEYEN' && (
             <button 
              onClick={() => {
                onApprove(talep.id);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-black tracking-wide hover:bg-red-600 transition-colors shadow-sm"
             >
               ÇIKIŞ TALEBİNİ ONAYLA
             </button>
          )}
        </div>

      </div>
    </div>
  );
}
