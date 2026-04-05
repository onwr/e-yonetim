"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Plus, GitFork, Building2, User, Tag, MapPin, MoreVertical, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DepartmanListesiPage() {
  const router = useRouter();
  const [personeller, setPersoneller] = useState<any[]>([]);
  const [departmanlar, setDepartmanlar] = useState<any[]>([]);
  const [subeler, setSubeler] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSube, setSelectedSube] = useState("Tüm Şubeler");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingDepartman, setEditingDepartman] = useState<any>(null);
  const [deletingDepartman, setDeletingDepartman] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    void (async () => {
      try {
        const [subeRes, depRes] = await Promise.all([
          fetch("/api/v1/subeler?page=1&pageSize=200", { credentials: "include" }),
          fetch("/api/v1/departmanlar?page=1&pageSize=200", { credentials: "include" }),
        ]);

        const subeJson = (await subeRes.json()) as { success?: boolean; data?: any[] };
        const depJson = (await depRes.json()) as { success?: boolean; data?: any[] };

        if (subeRes.ok && subeJson.success && Array.isArray(subeJson.data)) {
          setSubeler(
            subeJson.data.map((item) => ({
              id: item.id,
              subeAdi: item.name ?? item.subeAdi,
            })),
          );
        }
        if (depRes.ok && depJson.success && Array.isArray(depJson.data)) {
          setDepartmanlar(
            depJson.data.map((item) => ({
              id: item.id,
              subeId: item.branchId ?? item.subeId,
              departmanAdi: item.name ?? item.departmanAdi,
              masrafKodu: item.masrafKodu,
              acilisTarihi: item.acilisTarihi ? String(item.acilisTarihi).slice(0, 10) : "",
              yetkiliId: item.yetkiliUserId ?? item.yetkiliId,
              departmanYetkilisi: item.yetkiliUser?.adSoyad ?? item.departmanYetkilisi ?? "Atanmadı",
            })),
          );
        }
      } catch (error) {
        console.error(error);
        setSubeler([]);
        setDepartmanlar([]);
      }

      try {
        const personelRes = await fetch("/api/v1/personel?page=1&pageSize=500", { credentials: "include" });
        const personelJson = (await personelRes.json()) as { success?: boolean; data?: any[] };
        if (personelRes.ok && personelJson.success && Array.isArray(personelJson.data)) {
          setPersoneller(personelJson.data);
        }
      } catch {}
    })();
  }, []);

  const handleSaveEdit = (e: React.FormEvent) => {
     e.preventDefault();
     const form = e.target as HTMLFormElement;
     const formData = new FormData(form);
     const formSubeId = formData.get("subeId") as string;
     const formYetkiliId = formData.get("yetkiliId") as string;
     
     let yetkiliAdSoyad = "Atanmadı";
     if(formYetkiliId) {
        const found = personeller.find(p => p.id.toString() === formYetkiliId);
        if(found) yetkiliAdSoyad = found.adSoyad;
     }

     const updatedDepartman = {
         ...editingDepartman,
         departmanAdi: formData.get("departmanAdi"),
         masrafKodu: formData.get("masrafKodu"),
         acilisTarihi: formData.get("acilisTarihi"),
         subeId: formSubeId,
         yetkiliId: formYetkiliId,
         departmanYetkilisi: yetkiliAdSoyad
     };

     void (async () => {
       try {
         const response = await fetch(`/api/v1/departmanlar/${editingDepartman.id}`, {
           method: "PATCH",
           headers: { "Content-Type": "application/json" },
           credentials: "include",
           body: JSON.stringify(updatedDepartman),
         });
         if (!response.ok) {
           throw new Error("API update failed");
         }
       } catch {
         return;
       } finally {
         const newData = departmanlar.map((d) => (d.id === editingDepartman.id ? updatedDepartman : d));
         setDepartmanlar(newData);
         setEditingDepartman(null);
       }
     })();
  };

  const handleDeleteConfirm = () => {
     if(deletingDepartman) {
       void (async () => {
         try {
           const response = await fetch(`/api/v1/departmanlar/${deletingDepartman.id}`, {
             method: "DELETE",
             credentials: "include",
           });
           if (!response.ok) {
             throw new Error("API delete failed");
           }
         } catch {
           return;
         } finally {
           const newData = departmanlar.filter((d) => d.id !== deletingDepartman.id);
           setDepartmanlar(newData);
           setDeletingDepartman(null);
         }
       })();
     }
  };

  const filteredDepartmanlar = departmanlar.filter(d => {
    const matchesSearch = d.departmanAdi?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSube = selectedSube === "Tüm Şubeler" || d.subeId === selectedSube;
    return matchesSearch && matchesSube;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full pb-10 max-w-[1400px] mx-auto font-sans mt-2">
      
      {/* Header */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col">
            <h1 className="text-[24px] font-[900] text-[#0b1b42] tracking-tight">Departman Listesi</h1>
            <p className="text-[13px] font-semibold text-[#6b778c] mt-1">Firmanıza bağlı tüm departmanlar — toplam <strong className="text-[#0b1b42]">{departmanlar.length}</strong> kayıt</p>
         </div>
         <button 
           onClick={() => router.push("/panel/departman/yeni")}
           className="bg-[#1f1e33] hover:bg-[#2b2a46] text-white px-5 py-3 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-colors shadow-sm"
         >
            <Plus className="w-4 h-4 stroke-[3]" />
            Yeni Departman Ekle
         </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center mb-2">
         <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Departman ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] text-[13px] font-semibold text-[#0b1b42] placeholder:text-gray-400 transition-all bg-[#fafafa]/50"
            />
         </div>
         <div className="w-64 relative">
            <select 
               value={selectedSube}
               onChange={(e) => setSelectedSube(e.target.value)}
               className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-200 outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] text-[13px] font-semibold text-[#0b1b42] appearance-none cursor-pointer transition-all bg-[#fafafa]/50"
            >
               <option value="Tüm Şubeler">Tüm Şubeler</option>
               {subeler.map((sube, i) => (
                  <option key={i} value={sube.id || sube.subeAdi}>{sube.subeAdi}</option>
               ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
         </div>
      </div>

      {/* Main Content Area */}
      {filteredDepartmanlar.length === 0 ? (
         <div className="w-full flex flex-col items-center justify-center mt-32">
            <div className="w-16 h-16 opacity-30 flex items-center justify-center mb-4">
               <GitFork className="w-12 h-12 text-[#6b778c] stroke-[1.5]" />
            </div>
            <p className="text-[14.5px] font-semibold text-[#6b778c]">Henüz departman eklenmemiş. İlk departmanı ekleyin!</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDepartmanlar.map(d => {
               const bSube = subeler.find(s => s.id === d.subeId || s.subeAdi === d.subeId);
               return (
                 <div key={d.id} className="bg-white border text-left border-gray-100 rounded-[1.5rem] p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all relative">
                    <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-4">
                            <div className="w-[42px] h-[42px] rounded-xl bg-fuchsia-50 flex items-center justify-center shrink-0">
                                <GitFork className="w-[22px] h-[22px] text-fuchsia-600 stroke-[2]" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-black text-[#0b1b42]">{d.departmanAdi}</h3>
                                <div className="mt-1">
                                  <span className="px-2 py-[3px] rounded bg-[#10b981] text-white text-[10px] font-bold tracking-wide">Aktif</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <button onClick={() => setOpenMenuId(openMenuId === d.id ? null : d.id)} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                               <MoreVertical className="w-5 h-5 text-[#0b1b42]" />
                            </button>
                            {openMenuId === d.id && (
                               <div className="absolute right-0 top-10 w-48 bg-white border border-gray-100 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] rounded-2xl py-2 z-10 animate-fade-in">
                                   <button onClick={() => { setEditingDepartman(d); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-[13px] font-bold text-[#172b4d] transition-colors">
                                      <Edit className="w-4 h-4 text-gray-400" /> Departmanı Düzenle
                                   </button>
                                   <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                   <button onClick={() => { setDeletingDepartman(d); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2.5 text-[13px] font-bold text-red-600 transition-colors">
                                      <Trash2 className="w-4 h-4 text-red-500" /> Departmanı Sil
                                   </button>
                               </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2.5 pl-1">
                        <div className="flex items-center gap-3 text-[13px] font-semibold text-[#6b778c]">
                            <Building2 className="w-[15px] h-[15px] text-[#0b1b42]" />
                            <span className="truncate">{bSube?.subeAdi || d.subeId}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[13px] font-semibold text-[#6b778c]">
                            <User className="w-[15px] h-[15px] text-[#0b1b42]" />
                            <span className="truncate text-gray-500">{d.departmanYetkilisi && d.departmanYetkilisi !== "Atanmadı" ? d.departmanYetkilisi : "Yetkili atanmamış"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[13px] font-semibold text-[#6b778c]">
                            <Tag className="w-[15px] h-[15px] text-[#0b1b42]" />
                            <span className="truncate">{d.masrafKodu || "-"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[13px] font-semibold text-[#6b778c]">
                            <MapPin className="w-[15px] h-[15px] text-[#0b1b42]" />
                            <span className="truncate">Açılış: {d.acilisTarihi || "-"}</span>
                        </div>
                    </div>
                 </div>
               )
            })}
         </div>
      )}

      {/* Edit Modal */}
      {mounted && editingDepartman && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0b1b42]/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl flex flex-col shadow-2xl max-h-[90vh] overflow-hidden">
            <div className="flex mb-4 items-center justify-between p-6 pb-2 border-b border-gray-100 flex-shrink-0">
               <div>
                 <h2 className="text-[20px] font-black text-[#0b1b42]">Departmanı Düzenle</h2>
                 <p className="text-[13px] font-semibold text-[#6b778c] mt-1">Departman bilgilerini güncelleyin.</p>
               </div>
               <button onClick={() => setEditingDepartman(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 font-bold">✕</button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">Departman Adı</label>
                   <input required name="departmanAdi" defaultValue={editingDepartman.departmanAdi} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"/>
                 </div>
                 
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">Bağlı Şube</label>
                   <select required name="subeId" defaultValue={editingDepartman.subeId} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all bg-white cursor-pointer appearance-none">
                      {subeler.map(s => (
                         <option key={s.id || s.subeAdi} value={s.id || s.subeAdi}>{s.subeAdi}</option>
                      ))}
                   </select>
                 </div>

                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">Masraf Merkezi Kodu</label>
                   <input required name="masrafKodu" defaultValue={editingDepartman.masrafKodu} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"/>
                 </div>

                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">Açılış Tarihi</label>
                   <input type="date" required name="acilisTarihi" defaultValue={editingDepartman.acilisTarihi} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"/>
                 </div>

                 <div className="flex flex-col gap-1.5 col-span-2">
                   <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">Departman Yetkilisi</label>
                   <select name="yetkiliId" defaultValue={editingDepartman.yetkiliId || ""} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all bg-white cursor-pointer appearance-none">
                      <option value="">Yetkili seçin (isteğe bağlı)</option>
                      {personeller.map(p => (
                         <option key={p.id} value={p.id}>{p.adSoyad} — {p.unvan}</option>
                      ))}
                   </select>
                 </div>
              </div>

              <div className="flex items-center gap-3 mt-8 pt-4 border-t border-gray-100">
                 <button type="button" onClick={() => setEditingDepartman(null)} className="flex-1 py-3 rounded-xl font-bold text-[14px] text-[#6b778c] bg-gray-50 hover:bg-gray-100 transition-colors">İptal Et</button>
                 <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-[14px] text-white bg-[#0052cc] hover:bg-[#0047b3] transition-colors shadow-sm">Değişiklikleri Kaydet</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {mounted && deletingDepartman && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0b1b42]/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-sm flex flex-col shadow-2xl p-8 relative items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
               <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-[20px] font-black text-[#0b1b42] mb-2">
               Departmanı Sil
            </h2>
            <p className="text-[13px] font-semibold text-[#6b778c] mb-8 leading-relaxed">
              <strong className="text-[#172b4d]">{deletingDepartman.departmanAdi}</strong> isimli departmanı tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex items-center gap-3 w-full">
               <button onClick={() => setDeletingDepartman(null)} className="flex-1 py-3.5 rounded-xl font-bold text-[14px] text-[#6b778c] bg-gray-50 hover:bg-gray-100 transition-colors">İptal Et</button>
               <button onClick={handleDeleteConfirm} className="flex-1 py-3.5 rounded-xl font-bold text-[14px] text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm">Evet, Sil</button>
            </div>
          </div>
        </div>,
        document.body
      )}

       <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out forwards;
        }
      `}} />
    </div>
  );
}