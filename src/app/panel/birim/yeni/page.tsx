"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Building2, GitFork, Check, ChevronDown, Layers } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function YeniBirimEklePage() {
  const router = useRouter();
  const [subeler, setSubeler] = useState<{ id: string; subeAdi: string }[]>([]);
  const [departmanlar, setDepartmanlar] = useState<{ id: string; departmanAdi: string }[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [subeId, setSubeId] = useState("");
  const [departmanId, setDepartmanId] = useState("");
  const [birimAdi, setBirimAdi] = useState("");

  useEffect(() => {
    setMounted(true);
    void (async () => {
      try {
        const response = await fetch("/api/v1/subeler?page=1&pageSize=200", { credentials: "include" });
        const json = (await response.json()) as { success?: boolean; data?: any[] };
        if (response.ok && json.success && Array.isArray(json.data)) {
          setSubeler(
            json.data.map((item) => ({
              id: item.id,
              subeAdi: item.name ?? item.subeAdi,
            })),
          );
        }
      } catch {
        setSubeler([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!subeId) {
      setDepartmanlar([]);
      setDepartmanId("");
      return;
    }
    void (async () => {
      try {
        const response = await fetch(`/api/v1/departmanlar?page=1&pageSize=200&subeId=${encodeURIComponent(subeId)}`, {
          credentials: "include",
        });
        const json = (await response.json()) as { success?: boolean; data?: any[] };
        if (response.ok && json.success && Array.isArray(json.data)) {
          setDepartmanlar(
            json.data.map((item) => ({
              id: item.id,
              departmanAdi: item.name ?? item.departmanAdi,
            })),
          );
          setDepartmanId("");
        } else {
          setDepartmanlar([]);
        }
      } catch {
        setDepartmanlar([]);
      }
    })();
  }, [subeId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subeId || !departmanId || !birimAdi.trim()) return;

    void (async () => {
      try {
        const response = await fetch("/api/v1/birimler", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            departmanId,
            birimAdi: birimAdi.trim(),
          }),
        });
        if (!response.ok) throw new Error("Birim API kaydi basarisiz.");
        setIsSuccessModalOpen(true);
      } catch {
        return;
      }
    })();
  };

  const getSubeName = () => {
    const s = subeler.find((x) => x.id === subeId);
    return s ? s.subeAdi : subeId;
  };

  const getDepName = () => {
    const d = departmanlar.find((x) => x.id === departmanId);
    return d ? d.departmanAdi : departmanId;
  };

  return (
    <div className="flex flex-col animate-fade-in w-full pb-20 max-w-[1000px] mx-auto font-sans mt-2">
      <div className="flex flex-col mb-8">
        <div className="flex items-center text-[12.5px] font-bold text-[#6b778c] mb-3">
          <Link href="/panel/birim/liste" className="hover:text-[#0b1b42] transition-colors">
            Birim İşlemleri
          </Link>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5" />
          <span className="text-[#0052cc]">Yeni Birim Ekle</span>
        </div>
        <h1 className="text-[26px] font-[900] text-[#0b1b42] tracking-tight">Yeni Birim Ekle</h1>
        <p className="text-[13.5px] font-semibold text-[#6b778c] mt-1.5">
          Şube ve departman seçerek organizasyonunuza yeni bir birim tanımlayın.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col items-start gap-6">
          <div className="flex items-start gap-4 w-full">
            <div className="w-14 h-14 rounded-2xl bg-[#ecf4ff] flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-[#0052cc] stroke-[2]" />
            </div>
            <div className="flex flex-col pt-1">
              <h2 className="text-[18px] font-black text-[#0b1b42]">Şube</h2>
              <p className="text-[13px] font-semibold text-[#6b778c] mt-0.5">Birimin bağlı olacağı şubeyi seçin.</p>
            </div>
          </div>
          <div className="w-full mt-2">
            <label className="text-[11px] font-black text-[#0b1b42] uppercase tracking-wide mb-2 block">Şube</label>
            <div className="relative">
              <select
                required
                value={subeId}
                onChange={(e) => setSubeId(e.target.value)}
                className="w-full h-14 pl-5 pr-12 rounded-xl border border-gray-200 outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] text-[13.5px] font-semibold text-[#0b1b42] appearance-none cursor-pointer transition-all bg-white shadow-sm"
              >
                <option value="" disabled>
                  Şube seçiniz...
                </option>
                {subeler.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subeAdi}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div
          className={`bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col items-start gap-6 transition-all ${
            !subeId ? "opacity-50 pointer-events-none select-none" : ""
          }`}
        >
          <div className="flex items-start gap-4 w-full">
            <div className="w-14 h-14 rounded-2xl bg-fuchsia-50 flex items-center justify-center shrink-0">
              <GitFork className="w-7 h-7 text-fuchsia-500 stroke-[2]" />
            </div>
            <div className="flex flex-col pt-1">
              <h2 className="text-[18px] font-black text-[#0b1b42]">Departman</h2>
              <p className="text-[13px] font-semibold text-[#6b778c] mt-0.5">Birim bu departman altında kaydedilir.</p>
            </div>
          </div>
          <div className="w-full">
            <label className="text-[11px] font-black text-[#0b1b42] uppercase tracking-wide mb-2 block">Departman</label>
            <div className="relative">
              <select
                required
                value={departmanId}
                onChange={(e) => setDepartmanId(e.target.value)}
                disabled={!subeId || departmanlar.length === 0}
                className="w-full h-14 pl-5 pr-12 rounded-xl border border-gray-200 outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] text-[13.5px] font-semibold text-[#0b1b42] appearance-none cursor-pointer transition-all bg-white shadow-sm disabled:bg-gray-50"
              >
                <option value="" disabled>
                  {subeId ? (departmanlar.length ? "Departman seçiniz..." : "Bu şubede departman yok") : "Önce şube seçin"}
                </option>
                {departmanlar.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.departmanAdi}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div
          className={`bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col items-start gap-6 ${
            !departmanId ? "opacity-50 pointer-events-none select-none" : ""
          }`}
        >
          <div className="flex items-start gap-4 w-full">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center shrink-0">
              <Layers className="w-7 h-7 text-cyan-600 stroke-[2]" />
            </div>
            <div className="flex flex-col pt-1">
              <h2 className="text-[18px] font-black text-[#0b1b42]">Birim adı</h2>
              <p className="text-[13px] font-semibold text-[#6b778c] mt-0.5">Örn. Ön Yüz, Arka Yüz, Sistem.</p>
            </div>
          </div>
          <div className="w-full">
            <input
              required
              value={birimAdi}
              onChange={(e) => setBirimAdi(e.target.value)}
              placeholder="Birim adı"
              className="w-full h-14 px-5 rounded-xl border border-gray-200 outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] text-[13.5px] font-semibold text-[#0b1b42] placeholder:text-gray-300 shadow-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!subeId || !departmanId}
          className={`w-full h-[60px] rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-[14.5px] shadow-lg transition-colors mt-2 ${
            !subeId || !departmanId ? "bg-gray-400 cursor-not-allowed opacity-60" : "bg-[#1a1c2e] hover:bg-[#252840]"
          }`}
        >
          <Check className="w-5 h-5 stroke-[2.5] text-white/80" />
          Bilgileri Kaydet
        </button>
      </form>

      {mounted &&
        isSuccessModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0b1b42]/50 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-[420px] flex flex-col items-center justify-center shadow-2xl p-10 relative">
              <div className="w-[84px] h-[84px] rounded-full bg-[#ecfdf5] flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-[#10b981] stroke-[3]" />
              </div>
              <h2 className="text-[22px] font-black text-[#0b1b42] mb-3 text-center">Birim Eklendi!</h2>
              <p className="text-[13px] font-semibold text-[#6b778c] mb-8 text-center px-4 leading-relaxed">
                <strong className="text-[#172b4d]">{birimAdi}</strong> birimi{" "}
                <strong className="text-[#172b4d]">{getDepName()}</strong> /{" "}
                <strong className="text-[#172b4d]">{getSubeName()}</strong> altına kaydedildi.
              </p>
              <div className="flex items-center gap-4 w-full px-2">
                <button
                  type="button"
                  onClick={() => {
                    setBirimAdi("");
                    setDepartmanId("");
                    setIsSuccessModalOpen(false);
                  }}
                  className="flex-1 py-3.5 rounded-xl font-bold text-[14px] text-[#0b1b42] bg-white border-2 border-gray-100 hover:border-gray-200 transition-colors h-14"
                >
                  Yeni Ekle
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/panel/birim/liste")}
                  className="flex-1 py-3.5 rounded-xl font-bold text-[14px] text-white bg-[#1a1c2e] hover:bg-[#252840] transition-colors shadow-sm h-14"
                >
                  Listeye Git
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
