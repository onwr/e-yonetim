"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, Building2, UserPlus, Search, Download, Eye } from "lucide-react";
import { YeniPersonelModal, YeniPersonelData } from "@/components/personel/YeniPersonelModal";
import { ApiErrorBanner, ApiLoadingText } from "@/components/common/ApiStatus";
import { fetchJsonWithError, getApiErrorMessage } from "@/lib/fetchJsonWithError";

function maskTckn(tckn: string | undefined): string {
  const s = String(tckn ?? "").replace(/\D/g, "");
  if (s.length < 4) return s.length ? "****" : "—";
  if (s.length <= 6) return "*".repeat(Math.max(0, s.length - 2)) + s.slice(-2);
  return `${s.slice(0, 3)}${"*".repeat(s.length - 5)}${s.slice(-2)}`;
}

function getInitials(adSoyad: string | undefined): string {
  const parts = String(adSoyad ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function isPhotoUrl(url: string | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const u = url.trim();
  return u.startsWith("data:") || u.startsWith("http://") || u.startsWith("https://") || u.startsWith("/");
}

export default function PersonelListesiPage() {
  const [personeller, setPersoneller] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [filterSube, setFilterSube] = useState("Tümü");
  const [filterDepartman, setFilterDepartman] = useState("Tümü");
  const [filterStatu, setFilterStatu] = useState("Tümü");
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    void (async () => {
      try {
        setErrorMsg("");
        const data = await fetchJsonWithError<any[]>("/api/v1/personel?page=1&pageSize=500");
        if (!Array.isArray(data)) {
          setErrorMsg("Personel listesi formati gecersiz.");
          return;
        }
        setPersoneller(
          data.map((item) => ({
            ...item,
            ...(item.personelJson && typeof item.personelJson === "object" ? item.personelJson : {}),
          })),
        );
      } catch (e) {
        setErrorMsg(getApiErrorMessage(e, "Personel listesi cekilirken baglanti hatasi olustu."));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleAddPersonel = async (data: YeniPersonelData) => {
    const payload = {
      ...data,
      org: data.sube || "Belirtilmemiş",
      unvan: data.unvan || "Belirtilmemiş",
      departman: data.departman || "Belirtilmemiş",
      uyrugu: "T.C.",
      dogumTarihi: "-",
      dogumYeri: "-",
      cinsiyet: "Erkek",
      medeniHal: "Bekar",
      anaAdi: "-",
      babaAdi: "-",
      adres: "-",
      ilce: "-",
      cepTelefonu: "-",
      eposta: "-",
      acilDurumKisisi: "-",
      yakinlik: "-",
      acilDurumTelefon: "-",
      statu: "Aktif",
    };
    try {
      const created = await fetchJsonWithError<{ id: string }>("/api/v1/personel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!created?.id) {
        setErrorMsg("Personel ekleme yaniti gecersiz.");
        return;
      }
      setPersoneller((prev) => [{ ...payload, id: created.id } as any, ...prev]);
      setShowModal(false);
    } catch (e) {
      setErrorMsg(getApiErrorMessage(e, "Personel ekleme islemi basarisiz oldu."));
    }
  };

  const filteredPersoneller = useMemo(
    () =>
      personeller.filter((p) => {
        const q = search.trim().toLowerCase();
        const sMatch =
          !q ||
          p.adSoyad?.toLowerCase().includes(q) ||
          String(p.tckn ?? "").includes(search.trim()) ||
          String(p.unvan ?? "")
            .toLowerCase()
            .includes(q) ||
          String(p.departman ?? "")
            .toLowerCase()
            .includes(q);
        const subeMatch = filterSube === "Tümü" || p.org === filterSube;
        const depMatch = filterDepartman === "Tümü" || (p.departman ?? "Belirtilmemiş") === filterDepartman;
        const statuMatch = filterStatu === "Tümü" || (p.statu ?? "Aktif") === filterStatu;
        return sMatch && subeMatch && depMatch && statuMatch;
      }),
    [personeller, search, filterSube, filterDepartman, filterStatu],
  );

  const subeOptions = useMemo(
    () => Array.from(new Set(personeller.map((p) => p.org).filter(Boolean))) as string[],
    [personeller],
  );
  const departmanOptions = useMemo(
    () =>
      Array.from(
        new Set(personeller.map((p) => (p.departman ?? "Belirtilmemiş") as string).filter(Boolean)),
      ),
    [personeller],
  );

  const allFilteredSelected =
    filteredPersoneller.length > 0 && filteredPersoneller.every((p) => selectedIds.has(p.id));
  const someFilteredSelected = filteredPersoneller.some((p) => selectedIds.has(p.id));

  const toggleSelectAll = useCallback(() => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredPersoneller.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredPersoneller.forEach((p) => next.add(p.id));
        return next;
      });
    }
  }, [allFilteredSelected, filteredPersoneller]);

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthCount = personeller.filter((p) => {
    const created = p.createdAt ? new Date(p.createdAt) : null;
    return created && created >= thisMonthStart;
  }).length;

  const stats = [
    { label: "TOPLAM PERSONEL", value: personeller.length.toString(), icon: Users, color: "text-[#0052cc]", bg: "bg-blue-50/50" },
    { label: "AKTİF ÇALIŞAN", value: personeller.filter((p) => p.statu === "Aktif").length.toString(), icon: Building2, color: "text-[#22c55e]", bg: "bg-green-50/50" },
    { label: "YENİ EKLENENLER (BU AY)", value: thisMonthCount.toString(), icon: UserPlus, color: "text-[#ef5a28]", bg: "bg-orange-50/50" },
  ];

  const selectCls =
    "bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] text-[#172b4d] px-3 py-2.5 rounded-xl font-extrabold text-[12px] outline-none transition-all shadow-sm min-w-[140px] cursor-pointer";

  return (
    <div className="flex flex-col gap-6 w-full">
      <ApiErrorBanner message={errorMsg} />
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-2">
        <div>
          <h1 className="text-[24px] font-black text-[#172b4d] tracking-tight">Personel Listesi</h1>
          <p className="text-[13px] font-bold text-gray-400 mt-1">Firmanıza kayıtlı personelleri tablo üzerinden arayın, filtreleyin ve yönetin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white border-2 border-transparent hover:border-gray-100 rounded-[20px] p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all cursor-default"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color} stroke-[2.5]`} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 tracking-[0.08em] mb-1">{stat.label}</span>
              <span className="text-[26px] font-black text-[#172b4d] leading-none">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[24px] p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 xl:gap-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Ad soyad, TCKN, pozisyon veya departman ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-[#ef5a28] rounded-xl text-[13px] font-bold text-[#172b4d] placeholder-gray-400 outline-none transition-all focus:ring-4 focus:ring-[#ef5a28]/10 shadow-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={filterSube} onChange={(e) => setFilterSube(e.target.value)} className={selectCls} aria-label="Şube filtresi">
              <option value="Tümü">Tüm şubeler</option>
              {subeOptions.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
            <select value={filterDepartman} onChange={(e) => setFilterDepartman(e.target.value)} className={selectCls} aria-label="Departman filtresi">
              <option value="Tümü">Tüm departmanlar</option>
              {departmanOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select value={filterStatu} onChange={(e) => setFilterStatu(e.target.value)} className={selectCls} aria-label="Durum filtresi">
              <option value="Tümü">Tüm durumlar</option>
              <option value="Aktif">Aktif</option>
              <option value="Pasif">Pasif</option>
            </select>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 bg-[#ef5a28] hover:bg-[#d94720] text-white px-4 py-2.5 rounded-xl font-extrabold text-[12px] shadow-md shadow-[#ef5a28]/20 transition-all active:scale-[0.98] whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" /> Personel Ekle
            </button>
            <button
              type="button"
              onClick={() => {
                const rows = filteredPersoneller;
                const csvStr = ["AD SOYAD,POZİSYON,DEPARTMAN,ŞUBE,TCKN (maskeli),DURUM\n"].concat(
                  rows.map(
                    (d) =>
                      `"${(d.adSoyad ?? "").replace(/"/g, '""')}","${(d.unvan ?? "").replace(/"/g, '""')}","${(d.departman ?? "").replace(/"/g, '""')}","${(d.org ?? "").replace(/"/g, '""')}",${maskTckn(d.tckn)},${d.statu ?? ""}`,
                  ),
                ).join("\n");
                const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvStr], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "PersonelListesi.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center justify-center gap-2 bg-[#ecfccb] border border-[#d9f99d] hover:bg-[#d9f99d] text-[#4d7c0f] px-4 py-2.5 rounded-xl font-extrabold text-[12px] transition-all whitespace-nowrap"
            >
              <Download className="w-4 h-4 stroke-[2.5]" /> Excel
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[960px]">
              <thead>
                <tr className="bg-[#f4f5f7] border-b border-gray-200">
                  <th className="py-3 px-3 w-12">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected;
                      }}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#ef5a28] focus:ring-[#ef5a28]"
                      aria-label="Tümünü seç"
                    />
                  </th>
                  <th className="py-3 px-2 text-[10px] font-black text-gray-500 uppercase tracking-wider w-14">Foto</th>
                  <th className="py-3 px-3 text-[10px] font-black text-gray-500 uppercase tracking-wider min-w-[160px]">Ad Soyad</th>
                  <th className="py-3 px-3 text-[10px] font-black text-gray-500 uppercase tracking-wider min-w-[120px]">Pozisyon</th>
                  <th className="py-3 px-3 text-[10px] font-black text-gray-500 uppercase tracking-wider min-w-[120px]">Departman</th>
                  <th className="py-3 px-3 text-[10px] font-black text-gray-500 uppercase tracking-wider min-w-[100px]">Şube</th>
                  <th className="py-3 px-3 text-[10px] font-black text-gray-500 uppercase tracking-wider min-w-[120px]">TCKN</th>
                  <th className="py-3 px-3 text-[10px] font-black text-gray-500 uppercase tracking-wider w-24">Durum</th>
                  <th className="py-3 px-3 text-[10px] font-black text-gray-500 uppercase tracking-wider w-28 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-16">
                      <ApiLoadingText message="Personel listesi yükleniyor..." className="flex justify-center" />
                    </td>
                  </tr>
                ) : filteredPersoneller.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center border-2 border-gray-100">
                          <Search className="w-6 h-6 text-gray-400 stroke-[2]" />
                        </div>
                        <span className="text-[13px] font-bold text-gray-400">Aranan kriterlere uygun personel bulunamadı.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPersoneller.map((p) => {
                    const photo = p.profilFotografi as string | undefined;
                    const showImg = isPhotoUrl(photo);
                    const pasif = p.statu === "Pasif";
                    return (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-[#fafbfc] transition-colors">
                        <td className="py-3 px-3 align-middle">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => toggleOne(p.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-gray-300 text-[#ef5a28] focus:ring-[#ef5a28]"
                            aria-label={`Seç: ${p.adSoyad}`}
                          />
                        </td>
                        <td className="py-3 px-2 align-middle">
                          <div className="w-10 h-10 rounded-xl border-2 border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                            {showImg && photo ? (
                              photo.startsWith("/") ? (
                                <Image src={photo} alt="" width={40} height={40} className="object-cover w-full h-full" />
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={photo} alt="" className="w-full h-full object-cover" />
                              )
                            ) : (
                              <span className="text-[11px] font-black text-[#6b778c]">{getInitials(p.adSoyad)}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 align-middle">
                          <span className="text-[13px] font-black text-[#172b4d]">{p.adSoyad ?? "—"}</span>
                        </td>
                        <td className="py-3 px-3 align-middle text-[12px] font-bold text-[#42526e]">{p.unvan ?? "—"}</td>
                        <td className="py-3 px-3 align-middle text-[12px] font-semibold text-[#5e6c84]">{p.departman ?? "—"}</td>
                        <td className="py-3 px-3 align-middle text-[12px] font-semibold text-[#5e6c84]">{p.org ?? "—"}</td>
                        <td className="py-3 px-3 align-middle">
                          <span className="text-[12px] font-mono font-bold text-[#42526e] tracking-wide">{maskTckn(p.tckn)}</span>
                        </td>
                        <td className="py-3 px-3 align-middle">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${
                              pasif ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"
                            }`}
                          >
                            {p.statu ?? "Aktif"}
                          </span>
                        </td>
                        <td className="py-3 px-3 align-middle text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/panel/personel/${p.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f4f5f7] hover:bg-[#172b4d] hover:text-white text-[#172b4d] text-[11px] font-extrabold transition-colors border border-gray-200"
                            >
                              <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                              Detay
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!isLoading && selectedIds.size > 0 ? (
          <p className="text-[12px] font-semibold text-[#6b778c]">
            {selectedIds.size} personel seçildi.
          </p>
        ) : null}
      </div>

      {showModal && <YeniPersonelModal onAdd={handleAddPersonel} onClose={() => setShowModal(false)} submitText="Kaydet" />}
    </div>
  );
}
