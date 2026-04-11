import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, UserSquare2, Briefcase, GraduationCap, FileCheck } from "lucide-react";

interface TalepDetayModalProps {
  isOpen: boolean;
  onClose: () => void;
  talep: any;
  initialTab?: string;
}

export default function TalepDetayModal({ isOpen, onClose, talep, initialTab = "Özlük Bilgileri" }: TalepDetayModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen || !talep) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const tabs = [
    { id: "Özlük Bilgileri", label: "Özlük Bilgileri" },
    { id: "Kariyer & Ücret", label: "Kariyer & Ücret" },
    { id: "Eğitim & MYK", label: "Eğitim & MYK" },
    { id: "Evraklar", label: "Evraklar" },
  ];

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#172b4d]/40 backdrop-blur-sm shadow-2xl p-4 sm:p-6 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-[24px] w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex flex-col px-8 pt-6 pb-0 border-b border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-[22px] font-extrabold text-[#172b4d] tracking-tight">İşe Giriş Talebi Detayları</h2>
              <p className="text-[13px] text-gray-500 font-medium tracking-wide mt-1">
                #{talep?.id || "2t7LTPFiD7z9N4tZljAt"} - {talep?.adSoyad || "Belirtilmedi"}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#172b4d] transition-colors"
            >
              <X className="w-[22px] h-[22px]" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-[14px] font-extrabold transition-colors relative ${
                  activeTab === tab.id 
                    ? "text-[#ef5a28]" 
                    : "text-[#172b4d] hover:text-gray-600"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#ef5a28] rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#f8f9fc]/50">
          
          {activeTab === "Özlük Bilgileri" && (
            <div className="flex flex-col gap-10 animate-fade-in">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2.5 text-[#172b4d]">
                  <UserSquare2 className="w-[18px] h-[18px] stroke-[2.5]" />
                  <h3 className="text-[15px] font-black">Kimlik & İletişim</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-16 px-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-gray-400">TCKN</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">{talep.tckn || "-"}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-gray-400">Ad Soyad</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">{talep.adSoyad || "-"}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-gray-400">Doğum Tarihi</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">{talep.dogumTarihi || "-"}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-gray-400">Uyruk</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">{talep.uyruk || "Türkiye Cumhuriyeti"}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-gray-400">Cinsiyet</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">{talep.cinsiyet || "-"}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-gray-400">Medeni Hal</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">Bekar</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-gray-400">Kan Grubu</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">-</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-gray-400">Telefon</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">3 (423) 432 43 24</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-gray-400">E-Posta</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">ornek_posta@gmail.com</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-gray-400">Adres</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">Örnek Mah. Örnek Sok. No: 1 İç Kapı: 2</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-[1.5px] bg-gray-100 my-2"></div>

              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2.5 text-[#172b4d]">
                  <Briefcase className="w-[18px] h-[18px] stroke-[2.5]" />
                  <h3 className="text-[15px] font-black">Banka & Finans</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-16 px-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-gray-400">Banka</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">-</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-gray-400">Şube</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">-</span>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <span className="text-[12.5px] font-bold text-gray-400">IBAN</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">-</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-[1.5px] bg-gray-100 my-2"></div>

              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2.5 text-[#172b4d]">
                  <FileCheck className="w-[18px] h-[18px] stroke-[2.5]" />
                  <h3 className="text-[15px] font-black">Yasal & Sağlık</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-16 px-4 pb-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-gray-400">Askerlik</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">-</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-gray-400">Engel Durumu</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">{talep.engelDurumu || "-"}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-gray-400">Adli Sicil</span>
                    <span className="text-[14px] font-extrabold text-[#172b4d]">-</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Kariyer & Ücret" && (
             <div className="flex flex-col gap-10 animate-fade-in">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2.5 text-[#172b4d]">
                    <Briefcase className="w-[18px] h-[18px] stroke-[2.5]" />
                    <h3 className="text-[15px] font-black">İstihdam Bilgileri</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-16 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">Şirket</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">{talep.sirket || "-"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">Şube</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">{talep.sube || "-"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">Departman</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">{talep.departman || "-"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">Görevi / Ünvanı</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">{talep.unvan || "-"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">Birim</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">{talep.birim || "-"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">Takım/Sınıf</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">-</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-[1.5px] bg-gray-100 my-2"></div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2.5 text-[#172b4d]">
                    <Briefcase className="w-[18px] h-[18px] stroke-[2.5]" />
                    <h3 className="text-[15px] font-black">Ücret & Yan Haklar</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-16 px-4 pb-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">Net Maaş</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">{talep.netMaas || "-"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">Brüt Maaş</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">{talep.brutMaas || "-"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">Yemek Ücreti</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">-</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">Yol Ücreti</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">-</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">Servis</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">-</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">Mesai Başlangıç</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">-</span>
                    </div>
                  </div>
                </div>
             </div>
          )}

          {activeTab === "Eğitim & MYK" && (
             <div className="flex flex-col gap-10 animate-fade-in">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2.5 text-[#172b4d]">
                    <GraduationCap className="w-[18px] h-[18px] stroke-[2.5]" />
                    <h3 className="text-[15px] font-black">Eğitim Geçmişi</h3>
                  </div>
                  <div className="w-full border border-gray-200 bg-white rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="py-3 px-5 text-[12.5px] font-extrabold text-[#172b4d]">Seviye</th>
                          <th className="py-3 px-5 text-[12.5px] font-extrabold text-[#172b4d]">Okul</th>
                          <th className="py-3 px-5 text-[12.5px] font-extrabold text-[#172b4d]">Bölüm</th>
                          <th className="py-3 px-5 text-[12.5px] font-extrabold text-[#172b4d]">Mezuniyet Yılı</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-3 px-5 text-[13px] font-bold text-gray-600">Lise</td>
                          <td className="py-3 px-5 text-[13px] font-bold text-gray-600">Örnek Lisesi</td>
                          <td className="py-3 px-5 text-[13px] font-bold text-gray-600">Sayısal</td>
                          <td className="py-3 px-5 text-[13px] font-bold text-gray-600">2018</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2.5 text-[#172b4d]">
                    <FileCheck className="w-[18px] h-[18px] stroke-[2.5]" />
                    <h3 className="text-[15px] font-black">MYK Belgeleri</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12 px-2 pb-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">MYK Belgesi</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">-</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">Ulusal Yeterlilik</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">-</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">Belge No</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">-</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12.5px] font-bold text-gray-400">Geçerlilik</span>
                      <span className="text-[14px] font-extrabold text-[#172b4d]">-</span>
                    </div>
                  </div>
                </div>
             </div>
          )}

          {activeTab === "Evraklar" && (
             <div className="flex flex-col items-center justify-center py-20 animate-fade-in bg-white border border-dashed border-gray-300 rounded-2xl">
                <FileCheck className="w-12 h-12 text-gray-300 stroke-[1.5] mb-4" />
                <h3 className="text-[16px] font-black text-[#172b4d] mb-1">Yüklü Evrak Bulunamadı</h3>
                <p className="text-[13px] text-gray-500 font-medium">Özlük dosyasında henüz herhangi bir dijital belge kaydı görünmüyor.</p>
             </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-white shrink-0">
           <button 
             onClick={onClose}
             className="px-6 py-2.5 border border-gray-200 text-[#172b4d] font-bold text-[13.5px] rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
           >
             Kapat
           </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
