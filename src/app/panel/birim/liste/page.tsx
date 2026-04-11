"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Plus, Layers, Building2, GitFork, MoreVertical, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BirimRow = {
  id: string;
  birimAdi: string;
  departmanId: string;
  departmanAdi: string;
  subeId: string;
  subeAdi: string;
};

export default function BirimListesiPage() {
  const router = useRouter();
  const [birimler, setBirimler] = useState<BirimRow[]>([]);
  const [subeler, setSubeler] = useState<{ id: string; subeAdi: string }[]>([]);
  const [departmanlar, setDepartmanlar] = useState<{ id: string; departmanAdi: string; subeId: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSube, setSelectedSube] = useState("Tüm Şubeler");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editing, setEditing] = useState<BirimRow | null>(null);
  const [deleting, setDeleting] = useState<BirimRow | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    void (async () => {
      try {
        const [subeRes, depRes, birimRes] = await Promise.all([
          fetch("/api/v1/subeler?page=1&pageSize=200", { credentials: "include" }),
          fetch("/api/v1/departmanlar?page=1&pageSize=500", { credentials: "include" }),
          fetch("/api/v1/birimler?page=1&pageSize=500", { credentials: "include" }),
        ]);

        const subeJson = (await subeRes.json()) as { success?: boolean; data?: any[] };
        const depJson = (await depRes.json()) as { success?: boolean; data?: any[] };
        const birimJson = (await birimRes.json()) as { success?: boolean; data?: any[] };

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
              departmanAdi: item.name ?? item.departmanAdi,
              subeId: item.branchId ?? item.subeId,
            })),
          );
        }
        if (birimRes.ok && birimJson.success && Array.isArray(birimJson.data)) {
          setBirimler(
            birimJson.data.map((item) => ({
              id: item.id,
              birimAdi: item.name ?? item.birimAdi,
              departmanId: item.departmentId,
              departmanAdi: item.department?.name ?? "",
              subeId: item.department?.branchId ?? "",
              subeAdi: item.department?.branch?.name ?? "",
            })),
          );
        }
      } catch {
        setSubeler([]);
        setDepartmanlar([]);
        setBirimler([]);
      }
    })();
  }, []);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const departmanId = formData.get("departmanId") as string;
    const birimAdi = formData.get("birimAdi") as string;
    const dep = departmanlar.find((d) => d.id === departmanId);

    void (async () => {
      try {
        const response = await fetch(`/api/v1/birimler/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ birimAdi, departmanId }),
        });
        if (!response.ok) throw new Error("API update failed");
      } catch {
        return;
      } finally {
        setBirimler((prev) =>
          prev.map((b) =>
            b.id === editing.id
              ? {
                  ...b,
                  birimAdi,
                  departmanId,
                  departmanAdi: dep?.departmanAdi ?? b.departmanAdi,
                  subeId: dep?.subeId ?? b.subeId,
                  subeAdi: subeler.find((s) => s.id === dep?.subeId)?.subeAdi ?? b.subeAdi,
                }
              : b,
          ),
        );
        setEditing(null);
      }
    })();
  };

  const handleDeleteConfirm = () => {
    if (!deleting) return;
    void (async () => {
      try {
        const response = await fetch(`/api/v1/birimler/${deleting.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) throw new Error("API delete failed");
      } catch {
        return;
      } finally {
        setBirimler((prev) => prev.filter((b) => b.id !== deleting.id));
        setDeleting(null);
      }
    })();
  };

  const filtered = birimler.filter((b) => {
    const matchesSearch = b.birimAdi?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSube = selectedSube === "Tüm Şubeler" || b.subeId === selectedSube;
    return matchesSearch && matchesSube;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full pb-10 max-w-[1400px] mx-auto font-sans mt-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-[24px] font-[900] text-[#0b1b42] tracking-tight">Birim Listesi</h1>
          <p className="text-[13px] font-semibold text-[#6b778c] mt-1">
            Firmanıza bağlı birimler — toplam <strong className="text-[#0b1b42]">{birimler.length}</strong> kayıt
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/panel/birim/yeni")}
          className="bg-[#1f1e33] hover:bg-[#2b2a46] text-white px-5 py-3 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Yeni Birim Ekle
        </button>
      </div>

      <div className="flex gap-4 items-center mb-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Birim ara..."
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
            {subeler.map((sube) => (
              <option key={sube.id} value={sube.id}>
                {sube.subeAdi}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center mt-32">
          <div className="w-16 h-16 opacity-30 flex items-center justify-center mb-4">
            <Layers className="w-12 h-12 text-[#6b778c] stroke-[1.5]" />
          </div>
          <p className="text-[14.5px] font-semibold text-[#6b778c]">Henüz birim eklenmemiş veya filtreye uygun kayıt yok.</p>
          <Link href="/panel/birim/yeni" className="mt-4 text-[13px] font-bold text-[#0052cc] hover:underline">
            Yeni birim ekle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white border text-left border-gray-100 rounded-[1.5rem] p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all relative"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-[42px] h-[42px] rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
                    <Layers className="w-[22px] h-[22px] text-cyan-600 stroke-[2]" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[16px] font-black text-[#0b1b42]">{b.birimAdi}</h3>
                    <div className="mt-1">
                      <span className="px-2 py-[3px] rounded bg-[#10b981] text-white text-[10px] font-bold tracking-wide">Aktif</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === b.id ? null : b.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-[#0b1b42]" />
                  </button>
                  {openMenuId === b.id && (
                    <div className="absolute right-0 top-10 w-48 bg-white border border-gray-100 shadow-lg rounded-2xl py-2 z-10 animate-fade-in">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(b);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-[13px] font-bold text-[#172b4d]"
                      >
                        <Edit className="w-4 h-4 text-gray-400" /> Birimi Düzenle
                      </button>
                      <div className="h-px bg-gray-100 my-1 mx-2" />
                      <button
                        type="button"
                        onClick={() => {
                          setDeleting(b);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2.5 text-[13px] font-bold text-red-600"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" /> Birimi Sil
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2.5 pl-1">
                <div className="flex items-center gap-3 text-[13px] font-semibold text-[#6b778c]">
                  <Building2 className="w-[15px] h-[15px] text-[#0b1b42]" />
                  <span className="truncate">{b.subeAdi || "-"}</span>
                </div>
                <div className="flex items-center gap-3 text-[13px] font-semibold text-[#6b778c]">
                  <GitFork className="w-[15px] h-[15px] text-[#0b1b42]" />
                  <span className="truncate">{b.departmanAdi || "-"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {mounted &&
        editing &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0b1b42]/50 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-lg flex flex-col shadow-2xl max-h-[90vh] overflow-hidden">
              <div className="flex mb-4 items-center justify-between p-6 pb-2 border-b border-gray-100">
                <div>
                  <h2 className="text-[20px] font-black text-[#0b1b42]">Birimi Düzenle</h2>
                  <p className="text-[13px] font-semibold text-[#6b778c] mt-1">Birim adı ve bağlı departmanı güncelleyin.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">Birim Adı</label>
                  <input
                    required
                    name="birimAdi"
                    defaultValue={editing.birimAdi}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wide">Departman</label>
                  <select
                    required
                    name="departmanId"
                    defaultValue={editing.departmanId}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#0b1b42] outline-none focus:border-[#0052cc] bg-white cursor-pointer appearance-none"
                  >
                    {departmanlar.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.departmanAdi}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="flex-1 py-3 rounded-xl font-bold text-[14px] text-[#6b778c] bg-gray-50 hover:bg-gray-100"
                  >
                    İptal
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-[14px] text-white bg-[#0052cc] hover:bg-[#0047b3]">
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {mounted &&
        deleting &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0b1b42]/50 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-sm flex flex-col shadow-2xl p-8 items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-[20px] font-black text-[#0b1b42] mb-2">Birimi Sil</h2>
              <p className="text-[13px] font-semibold text-[#6b778c] mb-8 leading-relaxed">
                <strong className="text-[#172b4d]">{deleting.birimAdi}</strong> birimini silmek istediğinize emin misiniz?
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setDeleting(null)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-[14px] text-[#6b778c] bg-gray-50 hover:bg-gray-100"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3.5 rounded-xl font-bold text-[14px] text-white bg-red-500 hover:bg-red-600"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
