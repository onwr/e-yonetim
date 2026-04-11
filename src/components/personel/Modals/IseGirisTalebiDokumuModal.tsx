import React, { useState } from 'react';
import { X, User, Download, Eye } from 'lucide-react';

interface InfoRowProps {
  label: string;
  value: string | undefined | null;
}

const InfoBox = ({ label, value }: InfoRowProps) => (
  <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 flex flex-col justify-center">
    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
    <span className={`text-[12.5px] font-bold ${value && value !== 'Belirtilmedi' && value !== '-' ? 'text-[#172b4d]' : 'text-gray-300 italic'}`}>
      {value || 'Belirtilmedi'}
    </span>
  </div>
);

interface IseGirisTalebiDokumuModalProps {
  talep: any;
  onClose: () => void;
  onApprove: (id: string) => void;
}

export default function IseGirisTalebiDokumuModal({ talep, onClose, onApprove }: IseGirisTalebiDokumuModalProps) {
  const [activeTab, setActiveTab] = useState<'ozluk' | 'kariyer' | 'egitim' | 'evraklar'>('ozluk');
  const fb = talep?.formBilgileri || {};

  if (!talep) return null;

  return (
    <div className="fixed inset-0 bg-[#0a1a3a]/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-4xl flex flex-col h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#172b4d] text-white flex items-center justify-center shadow-md">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-[#172b4d]">İşe Giriş Talebi Dökümü</h2>
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

        {/* Tabs */}
        <div className="flex items-center px-8 border-b border-gray-100 shrink-0">
          {[
            { id: 'ozluk', label: 'ÖZLÜK BİLGİLERİ' },
            { id: 'kariyer', label: 'KARIYER & ÜCRET' },
            { id: 'egitim', label: 'EĞİTİM & MYK' },
            { id: 'evraklar', label: 'EVRAKLAR' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 text-[12.5px] font-black uppercase tracking-wider transition-all border-b-[3px] ${
                activeTab === tab.id 
                  ? 'text-[#172b4d] border-[#172b4d]' 
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* ÖZLÜK BİLGİLERİ */}
          {activeTab === 'ozluk' && (
            <div className="flex flex-col gap-10">
              {/* KİMLİK & İLETİŞİM */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-[#ef5a28] rounded-full"></div>
                  <h3 className="text-[13px] font-black text-[#172b4d] tracking-wider uppercase">KİMLİK & İLETİŞİM BİLGİLERİ</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoBox label="TCKN" value={fb.tckn} />
                  <InfoBox label="AD SOYAD" value={`${fb.ad || ''} ${fb.soyad || ''}`.trim()} />
                  <InfoBox label="DOĞUM TARİHİ" value={fb.dogumTarihi} />
                  <InfoBox label="UYRUK" value={fb.uyrugu} />
                  <InfoBox label="CİNSİYET" value={fb.cinsiyet} />
                  <InfoBox label="MEDENİ HAL" value={fb.medeniHal} />
                  <InfoBox label="KAN GRUBU" value={fb.kanGrubu} />
                  <InfoBox label="TELEFON" value={fb.cepTelefonu} />
                  <InfoBox label="E-POSTA" value={fb.eposta} />
                  <InfoBox label="ADRES" value={fb.adres} />
                </div>
              </div>

              {/* BANKA & FİNANSAL */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                  <h3 className="text-[13px] font-black text-blue-900 tracking-wider uppercase">BANKA & FİNANSAL VERİLER</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoBox label="BANKA ADI" value={fb.bankaAdi} />
                  <InfoBox label="ŞUBE KODU/ADI" value={fb.hesapSubeSayfa} />
                  <InfoBox label="IBAN NUMARASI" value={fb.iban} />
                </div>
              </div>

              {/* YASAL & SAĞLIK */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-[13px] font-black text-emerald-900 tracking-wider uppercase">YASAL & SAĞLIK GEÇMİŞİ</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoBox label="ASKERLİK DURUMU" value={fb.askerlikDurumu} />
                  <InfoBox label="ENGEL ORANI/DURUMU" value={fb.engellilikDurumu !== 'Yok' ? `${fb.engellilikTuru} - %${fb.engellilikOrani}` : 'Yok'} />
                  <InfoBox label="ADLİ SİCİL KAYDI" value={fb.adliSicilKaydi} />
                </div>
              </div>
            </div>
          )}

          {/* KARİYER & ÜCRET */}
          {activeTab === 'kariyer' && (
            <div className="flex flex-col gap-10">
              {/* İSTİHDAM & KADRO */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-[#ef5a28] rounded-full"></div>
                  <h3 className="text-[13px] font-black text-[#172b4d] tracking-wider uppercase">İSTİHDAM & KADRO DETAYLARI</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoBox label="ŞİRKET/KURUM" value={fb.firmaAdi} />
                  <InfoBox label="ÇALIŞTIĞI ŞUBE" value={fb.subeAdi} />
                  <InfoBox label="DEPARTMAN/BİRİM" value={fb.departman} />
                  <InfoBox label="GÖREVİ" value={fb.gorevi} />
                  <InfoBox label="KADRO STATÜSÜ" value={fb.kadroStatusu} />
                  <InfoBox label="PERSONEL SINIFI" value={fb.personelSinifi} />
                </div>
              </div>

              {/* ÜCRET & YAN HAKLAR */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-[13px] font-black text-emerald-900 tracking-wider uppercase">ÜCRET & YAN HAKLAR PAKETİ</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoBox label="NET MAAŞ (HAKEDİŞ)" value={fb.netMaasi ? `₺ ${fb.netMaasi}` : undefined} />
                  <InfoBox label="BRÜT MAAŞ (MALİYET)" value={fb.brutMaasi ? `₺ ${fb.brutMaasi}` : undefined} />
                  <InfoBox label="YEMEK ÖDEMESİ" value={fb.yemekDestekOdemesi ? `${fb.yemekDestekOdemesi} (₺ ${fb.yemekDestekUcreti})` : undefined} />
                  <InfoBox label="YOL TAZMİNATI" value={fb.yolDestekOdemesi ? `${fb.yolDestekOdemesi} (₺ ${fb.yolDestekUcreti})` : undefined} />
                </div>
              </div>
            </div>
          )}

          {/* EĞİTİM & MYK */}
          {activeTab === 'egitim' && (
            <div className="flex flex-col gap-10">
              {/* RESMİ EĞİTİM */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-[#ef5a28] rounded-full"></div>
                  <h3 className="text-[13px] font-black text-[#172b4d] tracking-wider uppercase">RESMİ EĞİTİM GEÇMİŞİ</h3>
                </div>
                <div className="bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden">
                  <div className="grid grid-cols-4 px-5 py-3 border-b border-gray-100 bg-gray-100/30">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">EĞİTİM SEVİYESİ</span>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">OKUL / KURUM ADI</span>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">MEZUNİYET BÖLÜMÜ</span>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">YIL</span>
                  </div>
                  {fb.egitimler && fb.egitimler.length > 0 ? (
                    fb.egitimler.map((eg: any, i: number) => (
                      <div key={i} className="grid grid-cols-4 px-5 py-4 text-[12px] font-bold text-[#172b4d] border-b border-gray-100/50 last:border-0 hover:bg-white transition-colors">
                        <span>{eg.egitimDurumu}</span>
                        <span>{eg.okulAdi}</span>
                        <span>{eg.bolum}</span>
                        <span>{eg.mezuniyetYili}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-5 py-6 text-center text-[12px] font-bold text-gray-400 italic">Eğitim kaydı bulunamadı</div>
                  )}
                </div>
              </div>

              {/* MYK */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                  <h3 className="text-[13px] font-black text-blue-900 tracking-wider uppercase">MESLEKİ YETERLİLİK (MYK)</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoBox label="MYK BELGE DURUMU" value={fb.mykBelgesi} />
                  <InfoBox label="ULUSAL YETERLİLİK" value={fb.meslekAdi} />
                  <InfoBox label="BELGE SERİ NO" value={fb.mykBelgeNo} />
                  <InfoBox label="SON GEÇERLİLİK" value={fb.mykSeviye} />
                </div>
              </div>
            </div>
          )}

          {/* EVRAKLAR */}
          {activeTab === 'evraklar' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-5 bg-[#ef5a28] rounded-full"></div>
                <h3 className="text-[13px] font-black text-[#172b4d] tracking-wider uppercase">YÜKLENEN EVRAKLAR</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {fb.evraklar && fb.evraklar.map((evrak: any) => (
                  <div key={evrak.id} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[12.5px] font-bold text-[#172b4d]">{evrak.isim}</span>
                      <span className={`text-[10.5px] font-bold mt-1 ${evrak.durum === 'yuklendi' ? 'text-green-500' : 'text-orange-500'}`}>
                        {evrak.durum === 'yuklendi' ? 'Dosya Var' : 'Eksik / Yüklenmemiş'}
                      </span>
                    </div>
                    {evrak.durum === 'yuklendi' && evrak.dosyaUrl && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.open(evrak.dosyaUrl, '_blank')}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-[#172b4d] hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm"
                          title="İncele"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a 
                          href={evrak.dosyaUrl}
                          download={evrak.isim}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#ef5a28] border border-[#ef5a28] text-white hover:bg-[#d4481b] transition-colors shadow-sm"
                          title="İndir"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
                {!fb.evraklar?.length && (
                  <div className="col-span-2 text-center text-gray-400 font-bold text-[13px] py-10 italic">
                    Evrak modülü bilgisi bulunamadı.
                  </div>
                )}
              </div>
            </div>
          )}

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
              className="px-6 py-2.5 rounded-xl bg-[#172b4d] text-white text-[13px] font-black tracking-wide hover:bg-[#0052cc] transition-colors shadow-sm"
             >
               TALEP ONAYINA GİT
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
