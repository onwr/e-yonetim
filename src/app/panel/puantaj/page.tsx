"use client";

import React, { useState, useEffect, useCallback, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Plus,
  UserMinus,
  Download,
  Save,
  Search,
  X,
  ChevronDown,
  Calendar,
  Check,
  CheckSquare,
  Square,
  XCircle,
  Clock,
} from "lucide-react";
import { YeniPersonelModal, YeniPersonelData } from "@/components/personel/YeniPersonelModal";
import { fetchJsonWithError, getApiErrorMessage } from "@/lib/fetchJsonWithError";
import { ApiErrorBanner, ApiLoadingText } from "@/components/common/ApiStatus";

const CALISME_GRUPLARI = [
  {
    grup: "ÇALIŞMA GÜNLERİ",
    items: [
      { kod: "N", label: "Normal Mesai", renk: "#22c55e", bg: "#dcfce7" },
      { kod: "HX", label: "Hafta T. Çalışma", renk: "#06b6d4", bg: "#cffafe" },
      { kod: "RX", label: "Resmi T. Çalışma", renk: "#8b5cf6", bg: "#ede9fe" },
    ],
  },
  {
    grup: "İZİN GÜNLERİ",
    items: [
      { kod: "HT", label: "Hafta Tatili", renk: "#f59e0b", bg: "#fef3c7" },
      { kod: "Üİ", label: "Ücretsiz İzinli", renk: "#8b5cf6", bg: "#ede9fe" },
      { kod: "ÜZ", label: "Ücretli İzinli", renk: "#eab308", bg: "#fefce8" },
      { kod: "Yİ", label: "Yıllık İzinli", renk: "#14b8a6", bg: "#ccfbf1" },
      { kod: "RT", label: "Resmi Tatil", renk: "#ef4444", bg: "#fee2e2" },
      { kod: "Bİ", label: "Babalık İzni", renk: "#3b82f6", bg: "#dbeafe" },
      { kod: "Cİ", label: "Cenaze İzni", renk: "#6b7280", bg: "#f3f4f6" },
      { kod: "Aİ", label: "Analık İzni", renk: "#ec4899", bg: "#fce7f3" },
    ],
  },
  {
    grup: "ÖZEL GÜNLER",
    items: [
      { kod: "G", label: "Geçici Görevli", renk: "#f97316", bg: "#ffedd5" },
      { kod: "RP", label: "Raporlu", renk: "#22c55e", bg: "#dcfce7" },
      { kod: "D", label: "Devamsızlık", renk: "#ef4444", bg: "#fee2e2" },
    ],
  },
] as const;

/** flatMap ile birleşim dizisi üretildiğinde TS hata veriyor; tek tip olarak düzleştiriyoruz */
type PuantajTur = { kod: string; label: string; renk: string; bg: string };

const ALL_TYPES: PuantajTur[] = CALISME_GRUPLARI.flatMap((g) =>
  g.items.map((item) => ({
    kod: item.kod,
    label: item.label,
    renk: item.renk,
    bg: item.bg,
  }))
);

const HIZLI_ISLEMLER = [
  { kod: "HT_ALL", label: "Cmt + Paz Günlerine HT Gir", renk: "#f59e0b" },
  { kod: "HT_PAZ", label: "Pazar Günlerine HT Gir", renk: "#f59e0b" },
  { kod: "HT_CMT", label: "Cumartesi Günlerine HT Gir", renk: "#f59e0b" },
  { kod: "N_BOS", label: "Boş Günleri Normal Yap (N)", renk: "#22c55e" },
  { kod: "RT_RES", label: "Resmî Tatilleri Doldur (RT)", renk: "#22c55e" },
  { kod: "TEMIZLE", label: "Tümünü Temizle", renk: "#ef4444" },
] as const;

const AYLAR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const GUN_ADLARI = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Türkiye'deki yasal resmi tatil günlerini döndürır.
 * Her yıl sabit olan tatiller + yıla göre hesaplanan Ramazan/Kurban Bayramları
 * Not: Dini tatil tarihleri yıldan yıla değişir, yaklaşık değerler verilmiştir.
 * Anahtar: "YYYY-M-D" formatında tarih string.
 */
function getTurkeyHolidays(year: number): Set<string> {
  const set = new Set<string>();
  const add = (m: number, d: number) => set.add(`${year}-${m}-${d}`);

  // Sabit resmi tatiller
  add(1, 1);   // Yeniyıl
  add(4, 23);  // Ulusal Egemenlik ve Çocuk Bayramı
  add(5, 1);   // Emek ve Dayanışma Günü (İşçi Bayramı)
  add(5, 19);  // Atatürk'ü Anma, Gençlik ve Spor Bayramı
  add(7, 15);  // Demokrasi ve Millî Birlik Günü
  add(8, 30);  // Zafer Bayramı
  add(10, 28); // Cumhuriyet Bayramı arifesi (yarım gün - tam gün sayın)
  add(10, 29); // Cumhuriyet Bayramı

  // Dini Bayramlar - yıla göre yaklaşik (3-5 yıllık sabit tablo)
  // Ramazan Bayramı: 1 gün arife + 3 gün bayram
  // Kurban Bayramı: 1 gün arife + 4 gün bayram
  const diniBayramlar: Record<number, { ramazanArife: [number,number]; kurbanArife: [number,number] }> = {
    2024: { ramazanArife: [4,9],  kurbanArife: [6,15] },
    2025: { ramazanArife: [3,29], kurbanArife: [6,5]  },
    2026: { ramazanArife: [3,19], kurbanArife: [5,26] },
    2027: { ramazanArife: [3,8],  kurbanArife: [5,15] },
    2028: { ramazanArife: [2,25], kurbanArife: [5,3]  },
    2029: { ramazanArife: [2,13], kurbanArife: [4,22] },
  };

  const bayram = diniBayramlar[year];
  if (bayram) {
    // Ramazan Bayramı: arife + 3 gün
    let [rm, rd] = bayram.ramazanArife;
    for (let i = 0; i < 4; i++) {
      const d = new Date(year, rm - 1, rd + i);
      set.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    }
    // Kurban Bayramı: arife + 4 gün
    let [km, kd] = bayram.kurbanArife;
    for (let i = 0; i < 5; i++) {
      const d = new Date(year, km - 1, kd + i);
      set.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    }
  }

  return set;
}

function getDayName(year: number, month: number, day: number) {
  return GUN_ADLARI[new Date(year, month, day).getDay()];
}

function isWeekend(year: number, month: number, day: number) {
  const d = new Date(year, month, day).getDay();
  return d === 0 || d === 6;
}

function formatTarih(year: number, month: number, day: number) {
  const names = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const dayName = names[new Date(year, month, day).getDay()];
  return `${String(day).padStart(2, "0")} ${AYLAR[month].toUpperCase()} ${year} ${dayName}`;
}

type PuantajData = Record<string, Record<number, string>>;
type OvertimeData = Record<string, Record<number, { hours: number; desc: string }>>;
type IdName = { id: string; name: string };

/** Bugünden 2 gün öncesi için otomatik kilit kuralı */
function isCellAutolocked(year: number, month: number, day: number): boolean {
  const cellDate = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  return cellDate < twoDaysAgo;
}

/** Çıkış tarihinden sonraki günler pasif */
function isAfterCikisTarihi(
  year: number,
  month: number,
  day: number,
  cikisTarihi: string | null | undefined
): boolean {
  if (!cikisTarihi) return false;
  const exitDate = new Date(cikisTarihi);
  if (isNaN(exitDate.getTime())) return false;
  exitDate.setHours(0, 0, 0, 0);
  const cellDate = new Date(year, month, day);
  return cellDate > exitDate;
}

/** Giriş tarihinden önceki günler pasif */
function isBeforeGirisTarihi(
  year: number,
  month: number,
  day: number,
  girisTarihi: string | null | undefined
): boolean {
  if (!girisTarihi) return false;
  const entryDate = new Date(girisTarihi);
  if (isNaN(entryDate.getTime())) return false;
  entryDate.setHours(0, 0, 0, 0);
  const cellDate = new Date(year, month, day);
  return cellDate < entryDate;
}

function mapPersonelRow(item: Record<string, unknown>) {
  return {
    ...item,
    ...(item.personelJson && typeof item.personelJson === "object" ? (item.personelJson as object) : {}),
  };
}

function payrollEntriesToPuantajData(entries: unknown[]): PuantajData {
  const map: PuantajData = {};
  if (!Array.isArray(entries)) return map;

  for (const e of entries) {
    if (!e || typeof e !== "object") continue;
    const row = e as { employeeId?: string; payload?: unknown; data?: unknown };
    const pid = row.employeeId;
    if (!pid) continue;

    const payload = row.payload ?? row.data;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) continue;

    const days: Record<number, string> = {};
    for (const [k, v] of Object.entries(payload as Record<string, unknown>)) {
      const d = Number.parseInt(k, 10);
      if (Number.isFinite(d) && typeof v === "string") days[d] = v;
    }
    map[pid] = days;
  }

  return map;
}

function payrollEntriesToOvertimeData(entries: unknown[]): OvertimeData {
  const map: OvertimeData = {};
  if (!Array.isArray(entries)) return map;

  for (const e of entries) {
    if (!e || typeof e !== "object") continue;
    const row = e as { employeeId?: string; overtime?: unknown; payload?: unknown; data?: unknown };
    const pid = row.employeeId;
    if (!pid) continue;

    const payloadObj = (row.payload ?? row.data) as Record<string, unknown> | undefined;
    const src = payloadObj?.overtime ?? row.overtime;
    if (!src || typeof src !== "object" || Array.isArray(src)) continue;

    const days: Record<number, { hours: number; desc: string }> = {};
    for (const [k, v] of Object.entries(src as Record<string, unknown>)) {
      const d = Number.parseInt(k, 10);
      if (!Number.isFinite(d)) continue;
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const item = v as { hours?: unknown; desc?: unknown };
        days[d] = {
          hours: typeof item.hours === "number" ? item.hours : Number(item.hours) || 0,
          desc: typeof item.desc === "string" ? item.desc : "",
        };
      }
    }

    map[pid] = days;
  }

  return map;
}

function Toast({
  message,
  type = "success",
  onClose,
}: {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-[13.5px] font-bold border animate-fade-in ${
        type === "success" ? "bg-green-600 border-green-400/40" : "bg-red-600 border-red-400/40"
      }`}
      style={{ animation: "slideInRight 0.35s cubic-bezier(0.23,1,0.32,1) forwards" }}
    >
      <Check className="w-4 h-4 shrink-0" />
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface GunModalProps {
  pid: string | number;
  day: number;
  year: number;
  month: number;
  personelName: string;
  currentVal: string;
  onSelect: (kod: string) => void;
  onClose: () => void;
}

function GunModal({
  pid,
  day,
  year,
  month,
  personelName,
  currentVal,
  onSelect,
  onClose,
}: GunModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-[480px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#ef5a28]" />
            </div>
            <span className="text-[17px] font-extrabold text-[#172b4d]">Gün Durumu Girişi</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4.5 h-4.5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Personel</p>
            <p className="text-[15px] font-extrabold text-[#172b4d]">{personelName}</p>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-2 mb-0.5">Tarih</p>
            <p className="text-[15px] font-extrabold text-[#172b4d]">{formatTarih(year, month, day)}</p>
          </div>

          {CALISME_GRUPLARI.map((grup) => (
            <div key={grup.grup}>
              <h4 className="text-[10.5px] font-extrabold text-gray-400 tracking-widest uppercase mb-3">
                {grup.grup}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {grup.items.map((t) => (
                  <button
                    key={t.kod}
                    onClick={() => onSelect(t.kod)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left font-bold text-[13.5px] ${
                      currentVal === t.kod
                        ? "border-current shadow-md scale-[1.01]"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                    style={
                      currentVal === t.kod
                        ? { borderColor: t.renk, color: t.renk, backgroundColor: t.bg }
                        : { color: "#172b4d" }
                    }
                  >
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
                      style={{ backgroundColor: t.renk }}
                    >
                      {t.kod}
                    </span>
                    {t.label}
                    {currentVal === t.kod && <Check className="w-4 h-4 ml-auto shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            {currentVal && (
              <button
                onClick={() => onSelect("")}
                className="flex items-center gap-2 text-[12.5px] font-bold text-red-500 hover:text-red-700 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Seçimi Temizle
              </button>
            )}
            <button
              onClick={onClose}
              className="ml-auto px-6 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-[#172b4d] hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MesaiModalProps {
  pid: string | number;
  day: number;
  year: number;
  month: number;
  personelName: string;
  currentHours: number;
  currentDesc: string;
  onSave: (hours: number, desc: string) => void;
  onClose: () => void;
}

function MesaiModal({
  pid,
  day,
  year,
  month,
  personelName,
  currentHours,
  currentDesc,
  onSave,
  onClose,
}: MesaiModalProps) {
  const [hours, setHours] = useState(currentHours || 0);
  const [desc, setDesc] = useState(currentDesc || "");

  useEffect(() => {
    setHours(currentHours || 0);
    setDesc(currentDesc || "");
  }, [currentHours, currentDesc]);

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-[430px] max-w-[95vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#0052cc]" />
            </div>
            <span className="text-[17px] font-extrabold text-[#172b4d]">Fazla Mesai Girişi</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4.5 h-4.5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Personel</p>
            <p className="text-[15px] font-extrabold text-[#172b4d]">{personelName}</p>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-2 mb-0.5">Tarih</p>
            <p className="text-[15px] font-extrabold text-[#172b4d]">{formatTarih(year, month, day)}</p>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#172b4d] mb-2">Mesai Saati</label>
            <input
              type="number"
              min={0}
              max={24}
              value={hours}
              onChange={(e) => setHours(Math.max(0, Math.min(24, Number(e.target.value) || 0)))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/10"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#172b4d] mb-2">Açıklama</label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Fazla mesai nedeni..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none resize-none focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/10"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-[#172b4d] hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={() => onSave(hours, desc)}
              className="px-5 py-2.5 rounded-xl bg-[#0052cc] hover:bg-[#003d99] text-white text-[13px] font-bold"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PeriodPicker({
  year,
  month,
  onChange,
  isOpen,
  onToggle,
}: {
  year: number;
  month: number;
  onChange: (y: number, m: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (isOpen && ref.current && !ref.current.contains(e.target as Node)) onToggle();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [isOpen, onToggle]);

  const label = `${AYLAR[month].toUpperCase()} ${year}`;
  const years = Array.from({ length: 8 }, (_, i) => 2022 + i);

  return (
    <div ref={ref} className="relative dropdown-container">
      <button
        onClick={onToggle}
        className="flex items-center gap-2.5 pl-5 pr-4 py-2.5 bg-white border-2 border-gray-200 hover:border-[#0052cc] rounded-xl text-[14px] font-extrabold text-[#0052cc] outline-none cursor-pointer transition-all shadow-sm min-w-[170px] justify-between"
      >
        {label}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 text-[#0052cc] ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl w-[220px] overflow-hidden">
          <div className="max-h-[320px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {years.flatMap((y) =>
              AYLAR.map((a, mi) => {
                const isSelected = y === year && mi === month;
                return (
                  <button
                    key={`${y}-${mi}`}
                    onClick={() => {
                      onChange(y, mi);
                      onToggle();
                    }}
                    className={`flex items-center justify-between w-full px-5 py-2.5 text-left transition-colors ${
                      isSelected ? "bg-[#0052cc] text-white" : "hover:bg-gray-50 text-[#172b4d]"
                    }`}
                  >
                    <span className="text-[13.5px] font-extrabold tracking-wide">
                      {a.toUpperCase()} {y}
                    </span>
                    {isSelected && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StyledSelect({
  label,
  value,
  options,
  onChange,
  isOpen,
  onToggle,
}: {
  label: string;
  value: string;
  options: string[];
  onChange?: (v: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (isOpen && ref.current && !ref.current.contains(e.target as Node)) onToggle();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [isOpen, onToggle]);

  return (
    <div className="flex flex-col gap-1 min-w-[110px]">
      {label ? <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">{label}</span> : null}
      <div ref={ref} className="relative dropdown-container">
        <button
          onClick={onToggle}
          className="flex items-center justify-between w-full pl-3.5 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-bold text-[#172b4d] hover:border-gray-300 focus:border-[#ef5a28] transition-all shadow-sm gap-2"
        >
          <span className="truncate">{value}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-[calc(100%+4px)] z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-full">
            <div className="max-h-56 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              {options.map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    onChange?.(o);
                    onToggle();
                  }}
                  className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-[12.5px] font-bold transition-colors ${
                    value === o ? "bg-orange-50 text-[#ef5a28]" : "text-[#172b4d] hover:bg-gray-50"
                  }`}
                >
                  {value === o && <span className="w-1.5 h-1.5 rounded-full bg-[#ef5a28] shrink-0"></span>}
                  <span className="truncate">{o}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GunSec({
  value,
  options,
  onChange,
  isOpen,
  onToggle,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (isOpen && ref.current && !ref.current.contains(e.target as Node)) onToggle();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [isOpen, onToggle]);

  return (
    <div ref={ref} className="relative dropdown-container">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-[13px] font-extrabold transition-all shadow-sm min-w-[56px] justify-between ${
          isOpen ? "border-[#0052cc] text-[#0052cc] bg-blue-50/50" : "border-gray-200 text-[#172b4d] bg-white hover:border-gray-300"
        }`}
      >
        <span>{value}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+5px)] z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden min-w-[200px]">
          <div className="max-h-40 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>
            <div className="grid grid-cols-5 gap-1 p-2">
              {options.map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    onChange(o);
                    onToggle();
                  }}
                  className={`w-8 h-8 rounded-xl text-[12px] font-extrabold transition-all outline-none ${
                    value === o ? "bg-[#0052cc] text-white shadow-md scale-105" : "text-[#172b4d] bg-gray-50 hover:bg-gray-200"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PuantajPage() {
  const now = new Date();
  const router = useRouter();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [pendingYear, setPendingYear] = useState(now.getFullYear());
  const [pendingMonth, setPendingMonth] = useState(now.getMonth());

  const [duzenlemeIzni, setDuzenlemeIzni] = useState(false);
  const [kilit, setKilit] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [secilenHizliIslem, setSecilenHizliIslem] = useState("");
  const [gunAraligiBas, setGunAraligiBas] = useState("01");
  const [gunAraligiSon, setGunAraligiSon] = useState("15");
  const [secilenTur, setSecilenTur] = useState<PuantajTur>(ALL_TYPES[0]!);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as Element).closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleKilit = async () => {
    const nextState = !kilit;
    setKilit(nextState);
    try {
      await fetchJsonWithError("/api/v1/puantaj/lock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, isLocked: nextState }),
      });
      showToast(`Puantaj dönemi ${nextState ? "kilitlendi" : "açıldı"}.`);
    } catch (e) {
      setKilit(!nextState); // Hata varsa geri al
      showToast(getApiErrorMessage(e, "Kilit durumu kaydedilemedi."), "error");
    }
  };

  // --- Filtre state (cascade) ---
  const [firmaAdi, setFirmaAdi] = useState<string>("");         // Firma adı (sadece gösterim)
  const [firmaSecili, setFirmaSecili] = useState(false);         // Firma seçili mi?

  const [subeList, setSubeList] = useState<IdName[]>([]);        // Tüm şubeler
  const [seciliSubeId, setSeciliSubeId] = useState<string>("");  // Seçili şube ID

  const [departmanList, setDepartmanList] = useState<IdName[]>([]); // Seçili şubenin departmanları
  const [seciliDepartmanId, setSeciliDepartmanId] = useState<string>("");

  const [birimList, setBirimList] = useState<IdName[]>([]);       // Seçili departmanın birimleri
  const [seciliBirimId, setSeciliBirimId] = useState<string>("");

  const [loadingSubeler, setLoadingSubeler] = useState(false);
  const [loadingDepartmanlar, setLoadingDepartmanlar] = useState(false);
  const [loadingBirimler, setLoadingBirimler] = useState(false);
  // --- / Filtre state ---

  const [puantajData, setPuantajData] = useState<PuantajData>({});
  const [pendingData, setPendingData] = useState<PuantajData>({});
  const [overtimeData, setOvertimeData] = useState<OvertimeData>({});
  const [pendingOvertimeData, setPendingOvertimeData] = useState<OvertimeData>({});

  const [activeModal, setActiveModal] = useState<{ pid: string | number; day: number } | null>(null);
  const [activeMesaiModal, setActiveMesaiModal] = useState<{ pid: string | number; day: number } | null>(null);

  const [panelGizle, setPanelGizle] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [apiError, setApiError] = useState("");
  const [loadingPersonel, setLoadingPersonel] = useState(true);
  const [loadingPuantaj, setLoadingPuantaj] = useState(true);
  const [personel, setPersonel] = useState<any[]>([]);
  const [hiddenPersonelIds, setHiddenPersonelIds] = useState<Set<string>>(() => new Set());
  const [showYeniPersonelModal, setShowYeniPersonelModal] = useState(false);

  // Sayfa açıldığında: Firma adı + Şubeler + Personel listesi
  useEffect(() => {
    void (async () => {
      try {
        setApiError("");
        setLoadingPersonel(true);
        setLoadingSubeler(true);

        const [list, firmaData, subelerData] = await Promise.all([
          fetchJsonWithError<any[]>("/api/v1/personel?page=1&pageSize=500"),
          fetchJsonWithError<any>("/api/v1/firma").catch(() => null),
          fetchJsonWithError<any[]>("/api/v1/subeler?page=1&pageSize=200").catch(() => []),
        ]);

        const rows = Array.isArray(list) ? list.map(mapPersonelRow) : [];
        setPersonel(rows.map((p) => ({ ...p, kilit: false })));

        if (firmaData?.firmaUnvani) setFirmaAdi(firmaData.firmaUnvani);
        else if (firmaData?.firmaKodu) setFirmaAdi(firmaData.firmaKodu);

        const subelerArr = (Array.isArray(subelerData) ? subelerData : []).map((s: any) => ({
          id: String(s.id ?? ""),
          name: String(s.name ?? ""),
        })).filter((s) => s.id && s.name);
        setSubeList(subelerArr);
      } catch (e) {
        setApiError(getApiErrorMessage(e, "Personel listesi yuklenemedi."));
        setPersonel([]);
      } finally {
        setLoadingPersonel(false);
        setLoadingSubeler(false);
      }
    })();
  }, []);

  // Şube seçilince departmanları çek
  useEffect(() => {
    setSeciliDepartmanId("");
    setDepartmanList([]);
    setSeciliBirimId("");
    setBirimList([]);

    if (!seciliSubeId) return;

    void (async () => {
      try {
        setLoadingDepartmanlar(true);
        const data = await fetchJsonWithError<any[]>(
          `/api/v1/departmanlar?subeId=${seciliSubeId}&page=1&pageSize=500`
        ).catch(() => []);
        const arr = (Array.isArray(data) ? data : []).map((d: any) => ({
          id: String(d.id ?? ""),
          name: String(d.name ?? d.departmanAdi ?? ""),
        })).filter((d) => d.id && d.name);
        setDepartmanList(arr);
      } finally {
        setLoadingDepartmanlar(false);
      }
    })();
  }, [seciliSubeId]);

  // Departman seçilince birimleri çek
  useEffect(() => {
    setSeciliBirimId("");
    setBirimList([]);

    if (!seciliDepartmanId) return;

    void (async () => {
      try {
        setLoadingBirimler(true);
        const data = await fetchJsonWithError<any[]>(
          `/api/v1/birimler?departmanId=${seciliDepartmanId}&page=1&pageSize=500`
        ).catch(() => []);
        const arr = (Array.isArray(data) ? data : []).map((u: any) => ({
          id: String(u.id ?? ""),
          name: String(u.name ?? u.birimAdi ?? ""),
        })).filter((u) => u.id && u.name);
        setBirimList(arr);
      } finally {
        setLoadingBirimler(false);
      }
    })();
  }, [seciliDepartmanId]);

  useEffect(() => {
    void (async () => {
      try {
        setLoadingPuantaj(true);

        const [entries, lockData] = await Promise.all([
          fetchJsonWithError<unknown[]>(`/api/v1/puantaj?year=${year}&month=${month}`),
          fetchJsonWithError<{ isLocked: boolean }>(`/api/v1/puantaj/lock?year=${year}&month=${month}`).catch(() => ({ isLocked: false }))
        ]);

        setPuantajData(payrollEntriesToPuantajData(entries ?? []));
        setOvertimeData(payrollEntriesToOvertimeData(entries ?? []));
        setPendingData({});
        setPendingOvertimeData({});
        setKilit(lockData?.isLocked || false);

        // Per-person lock status
        const isArr = Array.isArray(entries);
        const lockedMap: Record<string, boolean> = {};
        if (isArr) {
          for (const e of entries) {
            if (e && (e as any).payload && typeof (e as any).payload === "object") {
              const b = (e as any).payload.isLocked;
              if (typeof b === "boolean") lockedMap[String((e as any).employeeId)] = b;
            }
          }
        }
        setPersonel((prev) => prev.map((p) => ({ ...p, kilit: !!lockedMap[p.id] })));
      } catch (e) {
        setApiError(getApiErrorMessage(e, "Puantaj verisi yuklenemedi."));
        setPuantajData({});
        setOvertimeData({});
        setKilit(false);
      } finally {
        setLoadingPuantaj(false);
      }
    })();
  }, [year, month]);


  const daysInMonth = getDaysInMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const unsavedCount =
    Object.values(pendingData).reduce((sum, dayMap) => sum + Object.keys(dayMap).length, 0) +
    Object.values(pendingOvertimeData).reduce((sum, dayMap) => sum + Object.keys(dayMap).length, 0);

  const filteredPersonel = personel.filter((p) => {
    if (hiddenPersonelIds.has(String(p.id))) return false;

    const q = search.toLowerCase();
    const sMatch =
      !q ||
      String(p.adSoyad ?? "").toLowerCase().includes(q) ||
      String(p.tckn ?? "").includes(q) ||
      String(p.sicil ?? "").includes(q);

    // Firma filtresi: firma seçiliyse hepsini göster (single-tenant — zaten aynı firma)
    const fMatch = !firmaSecili || true;

    // Şube filtresi: personelin branchId'si seçili şubeyle eşleşmeli
    const suMatch = !seciliSubeId || String(p.branchId ?? "") === seciliSubeId;

    // Departman filtresi: personelin departmentId'si seçili departmanla eşleşmeli
    const dMatch = !seciliDepartmanId || String(p.departmentId ?? "") === seciliDepartmanId;

    // Birim filtresi: personelin unitId'si seçili birimle eşleşmeli (varsa)
    const bMatch = !seciliBirimId || String(p.unitId ?? p.birimId ?? "") === seciliBirimId;

    // Pasiflik (çıkış tarihi) filtresi: Seçili dönem başlangıcından önce işten çıkmışsa listede gösterme
    let cMatch = true;
    const pJson = (p as any).personelJson && typeof (p as any).personelJson === "object" ? (p as any).personelJson : {};
    const cikisTarihi =
      (p as any).cikisTarihi ||
      (p as any).sgkCikisTarihi ||
      pJson.istenAyrilisTarihi ||
      pJson.cikisTarihi ||
      (p as any)['İşten Çıkış Tarihi'] ||
      null;
    if (cikisTarihi) {
      const exitDate = new Date(cikisTarihi);
      if (!isNaN(exitDate.getTime())) {
        exitDate.setHours(0, 0, 0, 0);
        const periodStart = new Date(year, month, 1);
        if (exitDate < periodStart) {
          cMatch = false; 
        }
      }
    }

    // Giriş tarihi filtresi: Seçili dönemin son gününden sonra işe girmişse listede gösterme
    const girisTarihi =
      (p as any).girisTarihi ||
      (p as any).sgkGirisTarihi ||
      pJson.iseBaslamaTarihi ||
      pJson.girisTarihi ||
      (p as any)['İşe Giriş Tarihi'] ||
      null;
    if (girisTarihi && cMatch) {
      const entryDate = new Date(girisTarihi);
      if (!isNaN(entryDate.getTime())) {
        entryDate.setHours(0, 0, 0, 0);
        // Period sonu
        const periodEnd = new Date(year, month + 1, 0);
        if (entryDate > periodEnd) {
          cMatch = false;
        }
      }
    }

    return sMatch && fMatch && suMatch && dMatch && bMatch && cMatch;
  });

  const handleFiltreyiKaldir = () => {
    setFirmaSecili(false);
    setSeciliSubeId("");
    setDepartmanList([]);
    setSeciliDepartmanId("");
    setBirimList([]);
    setSeciliBirimId("");
    setSearch("");
  };

  const handleExcelDownload = () => {
    let csv = "S.No,Ad Soyad,TCKN,Sicil No,Unvan,Sube,Departman";
    for (let d = 1; d <= daysInMonth; d++) csv += `,${d} ${getDayName(year, month, d)}`;
    csv += ",FM Toplam\n";

    filteredPersonel.forEach((p, idx) => {
      const pr = p as typeof p & { sube?: string; departman?: string };
      let row = `${idx + 1},${p.adSoyad},${p.tckn},${p.sicil},${p.unvan},${pr.sube || p.org},${pr.departman ?? ""}`;
      for (let d = 1; d <= daysInMonth; d++) row += `,${getCellValue(p.id, d) || ""}`;
      row += `,${getTotalOvertime(p.id)}`;
      csv += row + "\n";
    });

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Puantaj_${AYLAR[month]}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast("Excel dosyası indirildi.");
  };

  const toggleDropdown = (id: string) => setActiveDropdown((p) => (p === id ? null : id));

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
  }, []);

  const getCellValue = (pid: string | number, day: number) => {
    return pendingData[`${pid}`]?.[day] ?? puantajData[`${pid}`]?.[day] ?? "";
  };

  const getOvertimeValue = (pid: string | number, day: number) => {
    return pendingOvertimeData[`${pid}`]?.[day] ?? overtimeData[`${pid}`]?.[day] ?? { hours: 0, desc: "" };
  };

  const getSummary = (pid: string | number) => {
    const merged = {
      ...(puantajData[`${pid}`] || {}),
      ...(pendingData[`${pid}`] || {}),
    };

    const counts: Record<string, number> = {};
    Object.values(merged).forEach((status) => {
      if (status) counts[status] = (counts[status] || 0) + 1;
    });

    return counts;
  };

  const getTotalOvertime = (pid: string | number) => {
    const merged = {
      ...(overtimeData[`${pid}`] || {}),
      ...(pendingOvertimeData[`${pid}`] || {}),
    };

    return Object.values(merged).reduce((sum, item) => sum + (item?.hours || 0), 0);
  };

  const handleCellClick = (pid: string | number, day: number) => {
    if (!duzenlemeIzni || kilit) return;
    setActiveModal({ pid, day });
  };

  const handleCellSelect = (kod: string) => {
    if (!activeModal) return;
    const { pid, day } = activeModal;

    setPendingData((prev) => ({
      ...prev,
      [`${pid}`]: { ...prev[`${pid}`], [day]: kod },
    }));

    showToast("Değişiklik eklendi. Kaydet butonuna tıklayın.");
    setActiveModal(null);
  };

  const handleMesaiClick = (pid: string | number, day: number) => {
    if (!duzenlemeIzni || kilit) return;
    setActiveMesaiModal({ pid, day });
  };

  const handleMesaiSave = (hours: number, desc: string) => {
    if (!activeMesaiModal) return;
    const { pid, day } = activeMesaiModal;

    setPendingOvertimeData((prev) => ({
      ...prev,
      [`${pid}`]: {
        ...prev[`${pid}`],
        [day]: { hours, desc },
      },
    }));

    showToast("Fazla mesai değişikliği eklendi.");
    setActiveMesaiModal(null);
  };

  const handleSave = () => {
    const nextPuantaj: PuantajData = { ...puantajData };
    Object.entries(pendingData).forEach(([pid, dayMap]) => {
      nextPuantaj[pid] = { ...nextPuantaj[pid], ...dayMap };
      Object.keys(nextPuantaj[pid]).forEach((d) => {
        if (!nextPuantaj[pid][+d]) delete nextPuantaj[pid][+d];
      });
    });

    const nextOvertime: OvertimeData = { ...overtimeData };
    Object.entries(pendingOvertimeData).forEach(([pid, dayMap]) => {
      nextOvertime[pid] = { ...nextOvertime[pid], ...dayMap };
      Object.keys(nextOvertime[pid]).forEach((d) => {
        const item = nextOvertime[pid][+d];
        if (!item || (!item.hours && !item.desc)) delete nextOvertime[pid][+d];
      });
    });

    const allEmployeeIds = Array.from(new Set([...Object.keys(nextPuantaj), ...Object.keys(nextOvertime), ...personel.filter(p=>p.kilit).map(p=>String(p.id))]));

    const body = allEmployeeIds.map((employeeId) => {
      const p = personel.find(x => String(x.id) === employeeId);
      return {
        employeeId,
        year,
        month,
        data: nextPuantaj[employeeId] || {},
        overtime: nextOvertime[employeeId] || {},
        isLocked: !!p?.kilit,
      };
    });

    void (async () => {
      try {
        await fetchJsonWithError("/api/v1/puantaj", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        setPuantajData(nextPuantaj);
        setOvertimeData(nextOvertime);
        setPendingData({});
        setPendingOvertimeData({});
        showToast("Değişiklikler kaydedildi.");
      } catch (e) {
        showToast(getApiErrorMessage(e, "Kayıt başarısız."), "error");
      }
    })();
  };

  const applyBulkOp = () => {
    if (!secilenHizliIslem || !duzenlemeIzni) return;

    const start = parseInt(gunAraligiBas, 10);
    const end = parseInt(gunAraligiSon, 10);
    if (isNaN(start) || isNaN(end) || start > end) {
      showToast("Geçerli bir gün aralığı girin.", "error");
      return;
    }

    const pids = selectedRows.length > 0 ? selectedRows : filteredPersonel.map((p) => p.id);
    const holidays = getTurkeyHolidays(year);

    setPendingData((prev) => {
      const next: PuantajData = {};
      // Önce tüm mevcut pending'i kopyala
      for (const k of Object.keys(prev)) next[k] = { ...prev[k] };

      pids.forEach((pid) => {
        const pidKey = `${pid}`;
        if (!next[pidKey]) next[pidKey] = {};

        const selectedPerson = filteredPersonel.find((p) => String(p.id) === pidKey);
        const pKilit = selectedPerson?.kilit ?? false;
        const pJson3 = selectedPerson
          ? ((selectedPerson as any).personelJson && typeof (selectedPerson as any).personelJson === "object"
            ? (selectedPerson as any).personelJson : {})
          : {};
        const cikisTarihi = selectedPerson ? (
          (selectedPerson as any).cikisTarihi ||
          (selectedPerson as any).sgkCikisTarihi ||
          pJson3.istenAyrilisTarihi || pJson3.cikisTarihi ||
          (selectedPerson as any)['\u0130\u015ften \u00c7\u0131k\u0131\u015f Tarihi'] || null
        ) : null;
        const girisTarihi = selectedPerson ? (
          (selectedPerson as any).girisTarihi ||
          (selectedPerson as any).sgkGirisTarihi ||
          pJson3.iseBaslamaTarihi || pJson3.girisTarihi ||
          (selectedPerson as any)['\u0130\u015fe Giri\u015f Tarihi'] || null
        ) : null;

        for (let d = start; d <= end; d++) {
          if (d > getDaysInMonth(year, month)) break;

          const afterExit = isAfterCikisTarihi(year, month, d, cikisTarihi);
          const beforeEntry = isBeforeGirisTarihi(year, month, d, girisTarihi);
          // Toplu işlemlerde 'autoLocked' pas geçilir (Düzenleme İzni açık varsayılır)
          if (pKilit || afterExit || beforeEntry || kilit) continue;

          const dayName = getDayName(year, month, d);
          const dateKey = `${year}-${month + 1}-${d}`;
          const isHoliday = holidays.has(dateKey);

          // Mevcut değer: önce next (pending)'e bak, yoksa kaydedilmiş veriye bak
          const existingVal = next[pidKey]?.[d] ?? puantajData[pidKey]?.[d] ?? "";

          if (secilenHizliIslem === "HT_ALL") {
            if (dayName === "Cmt" || dayName === "Paz") {
              next[pidKey][d] = "HT";
            }
          } else if (secilenHizliIslem === "HT_PAZ") {
            if (dayName === "Paz") next[pidKey][d] = "HT";
          } else if (secilenHizliIslem === "HT_CMT") {
            if (dayName === "Cmt") next[pidKey][d] = "HT";
          } else if (secilenHizliIslem === "N_BOS") {
            // Hiç değer girilmemiş günleri Normal yap (Resmi tatil ve Hafta Sonu HARİÇ)
            if (!existingVal && !isHoliday && dayName !== "Cmt" && dayName !== "Paz") {
              next[pidKey][d] = "N";
            }
          } else if (secilenHizliIslem === "TEMIZLE") {
            next[pidKey][d] = "";
          } else if (secilenHizliIslem === "RT_RES") {
            if (isHoliday) {
              next[pidKey][d] = "RT";
            }
          }
        }
      });

      return next;
    });

    const labels: Record<string, string> = {
      HT_ALL: "Cmt+Paz günlerine HT",
      HT_PAZ: "Pazar günlerine HT",
      HT_CMT: "Cumartesi günlerine HT",
      N_BOS: "Boş günlere Normal (N)",
      TEMIZLE: "Temizle",
      RT_RES: "Resmi Tatillere RT",
    };
    showToast(`${gunAraligiBas}-${gunAraligiSon} arası: ${labels[secilenHizliIslem] ?? secilenHizliIslem} uygulandı.`);
  };

  const applyAsAtaOp = () => {
    if (!duzenlemeIzni) return;

    const start = parseInt(gunAraligiBas, 10);
    const end = parseInt(gunAraligiSon, 10);
    if (isNaN(start) || isNaN(end) || start > end) {
      showToast("Geçerli bir gün aralığı girin.", "error");
      return;
    }

    const pids = selectedRows.length > 0 ? selectedRows : filteredPersonel.map((p) => p.id);

    setPendingData((prev) => {
      const next: PuantajData = {};
      for (const k of Object.keys(prev)) next[k] = { ...prev[k] };

      pids.forEach((pid) => {
        const pidKey = `${pid}`;
        if (!next[pidKey]) next[pidKey] = {};

        const selectedPerson = filteredPersonel.find((p) => String(p.id) === pidKey);
        const pKilit = selectedPerson?.kilit ?? false;
        const pJson4 = selectedPerson
          ? ((selectedPerson as any).personelJson && typeof (selectedPerson as any).personelJson === "object"
            ? (selectedPerson as any).personelJson : {})
          : {};
        const cikisTarihi = selectedPerson ? (
          (selectedPerson as any).cikisTarihi ||
          (selectedPerson as any).sgkCikisTarihi ||
          pJson4.istenAyrilisTarihi || pJson4.cikisTarihi ||
          (selectedPerson as any)['\u0130\u015ften \u00c7\u0131k\u0131\u015f Tarihi'] || null
        ) : null;
        const girisTarihi = selectedPerson ? (
          (selectedPerson as any).girisTarihi ||
          (selectedPerson as any).sgkGirisTarihi ||
          pJson4.iseBaslamaTarihi || pJson4.girisTarihi ||
          (selectedPerson as any)['\u0130\u015fe Giri\u015f Tarihi'] || null
        ) : null;

        for (let d = start; d <= end; d++) {
          if (d > getDaysInMonth(year, month)) break;

          const afterExit = isAfterCikisTarihi(year, month, d, cikisTarihi);
          const beforeEntry = isBeforeGirisTarihi(year, month, d, girisTarihi);
          // Toplu işlemlerde 'autoLocked' kuralı atlanır
          if (pKilit || afterExit || beforeEntry || kilit) continue;

          next[pidKey][d] = secilenTur.kod;
        }
      });

      return next;
    });

    showToast(`${gunAraligiBas}-${gunAraligiSon} arasına "${secilenTur.label}" (${secilenTur.kod}) atandı.`);
  };


  const getTur = (kod: string): PuantajTur | undefined => ALL_TYPES.find((t) => t.kod === kod);

  const toggleRow = (id: string | number) =>
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const toggleAll = () =>
    setSelectedRows((prev) => (prev.length === filteredPersonel.length ? [] : filteredPersonel.map((p) => p.id)));

  const activePersonId = activeModal?.pid ?? activeMesaiModal?.pid;
  const modalPerson = activePersonId ? personel.find((p) => p.id === activePersonId) : null;

  const handleAddPersonel = (p: YeniPersonelData) => {
    const { unvan, sube, ...rest } = p;

    const payload = {
      ...rest,
      unvan: unvan || "Belirtilmemiş",
      org: sube || "Belirtilmemiş",
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

    void (async () => {
      try {
        const created = await fetchJsonWithError<{ id: string }>("/api/v1/personel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!created?.id) {
          showToast("Personel kaydı oluşturulamadı.", "error");
          return;
        }

        setPersonel((prev) => [...prev, { ...payload, id: created.id, kilit: false }]);
        setShowYeniPersonelModal(false);
        showToast(`${p.adSoyad} puantaja eklendi.`);
      } catch (e) {
        showToast(getApiErrorMessage(e, "Personel eklenemedi."), "error");
      }
    })();
  };

  const handlePersonelCikar = () => {
    if (selectedRows.length === 0) {
      showToast("Önce satır seçiniz.", "error");
      return;
    }

    setHiddenPersonelIds((prev) => {
      const n = new Set(prev);
      selectedRows.forEach((id) => n.add(String(id)));
      return n;
    });

    const n = selectedRows.length;
    setSelectedRows([]);
    showToast(`${n} personel puantaj görünümünden çıkarıldı.`);
  };

  return (
    <div className="flex flex-col gap-5 w-full pb-12">
      <ApiErrorBanner message={apiError} />

      {loadingPersonel || loadingPuantaj ? (
        <ApiLoadingText message="Puantaj verileri yukleniyor..." className="py-8 text-center" />
      ) : null}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes slideInRight { 0%{opacity:0;transform:translateX(60px)} 100%{opacity:1;transform:none} }
            @keyframes fadeIn { 0%{opacity:0;transform:translateY(12px)} 100%{opacity:1;transform:none} }
            .animate-fade-in { animation: fadeIn 0.35s cubic-bezier(0.23,1,0.32,1) forwards; }
            .scroll-x::-webkit-scrollbar { height: 5px; }
            .scroll-x::-webkit-scrollbar-thumb { background:#ddd;border-radius:99px; }
          `,
        }}
      />

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {showYeniPersonelModal && (
        <YeniPersonelModal
          onAdd={handleAddPersonel}
          onClose={() => setShowYeniPersonelModal(false)}
          submitText="Personeli Puantaja Ekle"
        />
      )}

      {activeModal && modalPerson && (
        <GunModal
          pid={activeModal.pid}
          day={activeModal.day}
          year={year}
          month={month}
          personelName={modalPerson.adSoyad}
          currentVal={getCellValue(activeModal.pid, activeModal.day)}
          onSelect={handleCellSelect}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeMesaiModal && modalPerson && (
        <MesaiModal
          pid={activeMesaiModal.pid}
          day={activeMesaiModal.day}
          year={year}
          month={month}
          personelName={modalPerson.adSoyad}
          currentHours={getOvertimeValue(activeMesaiModal.pid, activeMesaiModal.day).hours}
          currentDesc={getOvertimeValue(activeMesaiModal.pid, activeMesaiModal.day).desc}
          onSave={handleMesaiSave}
          onClose={() => setActiveMesaiModal(null)}
        />
      )}

      <div className="flex items-end justify-between flex-wrap gap-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-1.5">DÖNEM</label>
          <div className="flex items-center gap-2">
            <PeriodPicker
              year={pendingYear}
              month={pendingMonth}
              onChange={(y, m) => {
                setPendingYear(y);
                setPendingMonth(m);
              }}
              isOpen={activeDropdown === "period"}
              onToggle={() => toggleDropdown("period")}
            />

            <button
              onClick={() => {
                setYear(pendingYear);
                setMonth(pendingMonth);
              }}
              className="flex items-center gap-2 bg-[#ef5a28] hover:bg-[#d94720] text-white font-extrabold text-[13px] px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#ef5a28]/20 active:scale-95"
            >
              <RefreshCw className="w-4 h-4 stroke-[2.5]" />
              Getir
            </button>

            <button
              onClick={toggleKilit}
              className={`flex items-center gap-2 font-extrabold text-[13px] px-5 py-2.5 rounded-xl transition-all border active:scale-95 ${
                kilit
                  ? "bg-[#ef5a28]/10 border-[#ef5a28]/50 text-[#ef5a28]"
                  : "bg-white border-gray-200 text-[#172b4d] hover:border-gray-300 shadow-sm"
              }`}
            >
              <Lock className="w-4 h-4 stroke-[2.5]" />
              {kilit ? "Aç" : "Kilitle"}
            </button>
          </div>
        </div>

        <button
          onClick={() => setPanelGizle((p) => !p)}
          className="flex items-center gap-2 text-[#0052cc] text-[13px] font-bold hover:underline pb-1"
        >
          {panelGizle ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {panelGizle ? "Filtreleri Göster" : "Filtreleri Gizle"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm flex flex-col min-w-0">
        <div className="flex flex-wrap items-center gap-2 px-5 py-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ad Soyad, TCKN veya Personel Sicil No ile ara..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium text-[#172b4d] placeholder-gray-400 outline-none focus:bg-white focus:border-[#ef5a28] focus:ring-2 focus:ring-[#ef5a28]/10 transition-all"
            />
          </div>

          <button
            onClick={() => router.push("/panel/sgk-giris/yeni")}
            className="flex items-center gap-2 bg-[#ef5a28] hover:bg-[#d94720] text-white font-extrabold text-[12.5px] px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Yeni Personel Ekle
          </button>

          <button
            onClick={handlePersonelCikar}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-red-300 hover:text-red-600 text-[#172b4d] font-bold text-[12.5px] px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <UserMinus className="w-4 h-4" />
            Personel Çıkar
          </button>

          <button
            onClick={handleExcelDownload}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-[#172b4d] font-bold text-[12.5px] px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center gap-2 font-extrabold text-[12.5px] px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap ${
              unsavedCount > 0 ? "bg-[#0052cc] hover:bg-[#003d99] text-white" : "bg-white border border-gray-200 text-[#172b4d]"
            }`}
          >
            <Save className="w-4 h-4" />
            Kaydet{unsavedCount > 0 ? ` (${unsavedCount})` : ""}
          </button>

          <div className="flex items-center gap-2.5 ml-1">
            <button
              onClick={() => setDuzenlemeIzni((p) => !p)}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 ${duzenlemeIzni ? "bg-green-500" : "bg-gray-300"}`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${
                  duzenlemeIzni ? "left-[22px]" : "left-0.5"
                }`}
              ></div>
            </button>
            <span className={`text-[12.5px] font-extrabold ${duzenlemeIzni ? "text-green-600" : "text-gray-400"}`}>
              Düzenleme İzni
            </span>
          </div>
        </div>

        {!panelGizle && (
          <>
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/40">
              <p className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-3">FİLTRELER</p>

              <div className="flex flex-wrap items-end gap-3">
                {/* --- FİRMA --- */}
                <div className="flex flex-col gap-1 min-w-[140px]">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Firma</span>
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => toggleDropdown("firma")}
                      className={`flex items-center justify-between w-full pl-3.5 pr-3 py-2 bg-white border rounded-xl text-[13px] font-bold transition-all shadow-sm gap-2 ${
                        firmaSecili ? "border-[#ef5a28] text-[#ef5a28]" : "border-gray-200 text-[#172b4d] hover:border-gray-300"
                      }`}
                    >
                      <span className="truncate">{firmaSecili && firmaAdi ? firmaAdi : "Tümü"}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${activeDropdown === "firma" ? "rotate-180" : ""}`} />
                    </button>
                    {activeDropdown === "firma" && (
                      <div className="absolute left-0 top-[calc(100%+4px)] z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-full">
                        <button
                          onClick={() => { setFirmaSecili(false); setSeciliSubeId(""); setSeciliDepartmanId(""); setSeciliBirimId(""); toggleDropdown("firma"); }}
                          className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-[12.5px] font-bold transition-colors ${!firmaSecili ? "bg-orange-50 text-[#ef5a28]" : "text-[#172b4d] hover:bg-gray-50"}`}
                        >
                          {!firmaSecili && <span className="w-1.5 h-1.5 rounded-full bg-[#ef5a28] shrink-0" />}
                          Tümü
                        </button>
                        {firmaAdi && (
                          <button
                            onClick={() => { setFirmaSecili(true); toggleDropdown("firma"); }}
                            className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-[12.5px] font-bold transition-colors ${firmaSecili ? "bg-orange-50 text-[#ef5a28]" : "text-[#172b4d] hover:bg-gray-50"}`}
                          >
                            {firmaSecili && <span className="w-1.5 h-1.5 rounded-full bg-[#ef5a28] shrink-0" />}
                            <span className="truncate">{firmaAdi}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* --- ŞUBE --- */}
                <div className="flex flex-col gap-1 min-w-[130px]">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Şube</span>
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => toggleDropdown("sube")}
                      className={`flex items-center justify-between w-full pl-3.5 pr-3 py-2 bg-white border rounded-xl text-[13px] font-bold transition-all shadow-sm gap-2 ${
                        seciliSubeId ? "border-[#ef5a28] text-[#ef5a28]" : "border-gray-200 text-[#172b4d] hover:border-gray-300"
                      }`}
                    >
                      <span className="truncate">
                        {seciliSubeId ? (subeList.find((s) => s.id === seciliSubeId)?.name ?? "Tümü") : "Tümü"}
                      </span>
                      {loadingSubeler
                        ? <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-[#ef5a28] rounded-full animate-spin shrink-0" />
                        : <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${activeDropdown === "sube" ? "rotate-180" : ""}`} />
                      }
                    </button>
                    {activeDropdown === "sube" && (
                      <div className="absolute left-0 top-[calc(100%+4px)] z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-full">
                        <div className="max-h-56 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                          <button
                            onClick={() => { setSeciliSubeId(""); toggleDropdown("sube"); }}
                            className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-[12.5px] font-bold transition-colors ${!seciliSubeId ? "bg-orange-50 text-[#ef5a28]" : "text-[#172b4d] hover:bg-gray-50"}`}
                          >
                            {!seciliSubeId && <span className="w-1.5 h-1.5 rounded-full bg-[#ef5a28] shrink-0" />}
                            Tümü
                          </button>
                          {subeList.length === 0 && (
                            <div className="px-4 py-3 text-[12px] text-gray-400 italic">Şube bulunamadı</div>
                          )}
                          {subeList.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => { setSeciliSubeId(s.id); toggleDropdown("sube"); }}
                              className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-[12.5px] font-bold transition-colors ${seciliSubeId === s.id ? "bg-orange-50 text-[#ef5a28]" : "text-[#172b4d] hover:bg-gray-50"}`}
                            >
                              {seciliSubeId === s.id && <span className="w-1.5 h-1.5 rounded-full bg-[#ef5a28] shrink-0" />}
                              <span className="truncate">{s.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* --- DEPARTMAN --- */}
                <div className="flex flex-col gap-1 min-w-[140px]">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Departman</span>
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => seciliSubeId && toggleDropdown("dep")}
                      title={!seciliSubeId ? "Önce bir şube seçin" : undefined}
                      className={`flex items-center justify-between w-full pl-3.5 pr-3 py-2 bg-white border rounded-xl text-[13px] font-bold transition-all shadow-sm gap-2 ${
                        !seciliSubeId
                          ? "border-gray-100 text-gray-300 cursor-not-allowed"
                          : seciliDepartmanId
                          ? "border-[#ef5a28] text-[#ef5a28]"
                          : "border-gray-200 text-[#172b4d] hover:border-gray-300"
                      }`}
                    >
                      <span className="truncate">
                        {seciliDepartmanId ? (departmanList.find((d) => d.id === seciliDepartmanId)?.name ?? "Tümü") : "Tümü"}
                      </span>
                      {loadingDepartmanlar
                        ? <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-[#ef5a28] rounded-full animate-spin shrink-0" />
                        : <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${activeDropdown === "dep" ? "rotate-180" : ""}`} />
                      }
                    </button>
                    {activeDropdown === "dep" && seciliSubeId && (
                      <div className="absolute left-0 top-[calc(100%+4px)] z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-full">
                        <div className="max-h-56 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                          <button
                            onClick={() => { setSeciliDepartmanId(""); toggleDropdown("dep"); }}
                            className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-[12.5px] font-bold transition-colors ${!seciliDepartmanId ? "bg-orange-50 text-[#ef5a28]" : "text-[#172b4d] hover:bg-gray-50"}`}
                          >
                            {!seciliDepartmanId && <span className="w-1.5 h-1.5 rounded-full bg-[#ef5a28] shrink-0" />}
                            Tümü
                          </button>
                          {departmanList.length === 0 && (
                            <div className="px-4 py-3 text-[12px] text-gray-400 italic">Bu şubede departman yok</div>
                          )}
                          {departmanList.map((d) => (
                            <button
                              key={d.id}
                              onClick={() => { setSeciliDepartmanId(d.id); toggleDropdown("dep"); }}
                              className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-[12.5px] font-bold transition-colors ${seciliDepartmanId === d.id ? "bg-orange-50 text-[#ef5a28]" : "text-[#172b4d] hover:bg-gray-50"}`}
                            >
                              {seciliDepartmanId === d.id && <span className="w-1.5 h-1.5 rounded-full bg-[#ef5a28] shrink-0" />}
                              <span className="truncate">{d.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* --- BİRİM --- */}
                <div className="flex flex-col gap-1 min-w-[130px]">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Görev/Birim</span>
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => seciliDepartmanId && toggleDropdown("birim")}
                      title={!seciliDepartmanId ? "Önce bir departman seçin" : undefined}
                      className={`flex items-center justify-between w-full pl-3.5 pr-3 py-2 bg-white border rounded-xl text-[13px] font-bold transition-all shadow-sm gap-2 ${
                        !seciliDepartmanId
                          ? "border-gray-100 text-gray-300 cursor-not-allowed"
                          : seciliBirimId
                          ? "border-[#ef5a28] text-[#ef5a28]"
                          : "border-gray-200 text-[#172b4d] hover:border-gray-300"
                      }`}
                    >
                      <span className="truncate">
                        {seciliBirimId ? (birimList.find((b) => b.id === seciliBirimId)?.name ?? "Tümü") : "Tümü"}
                      </span>
                      {loadingBirimler
                        ? <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-[#ef5a28] rounded-full animate-spin shrink-0" />
                        : <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${activeDropdown === "birim" ? "rotate-180" : ""}`} />
                      }
                    </button>
                    {activeDropdown === "birim" && seciliDepartmanId && (
                      <div className="absolute left-0 top-[calc(100%+4px)] z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-full">
                        <div className="max-h-56 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                          <button
                            onClick={() => { setSeciliBirimId(""); toggleDropdown("birim"); }}
                            className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-[12.5px] font-bold transition-colors ${!seciliBirimId ? "bg-orange-50 text-[#ef5a28]" : "text-[#172b4d] hover:bg-gray-50"}`}
                          >
                            {!seciliBirimId && <span className="w-1.5 h-1.5 rounded-full bg-[#ef5a28] shrink-0" />}
                            Tümü
                          </button>
                          {birimList.length === 0 && (
                            <div className="px-4 py-3 text-[12px] text-gray-400 italic">Bu departmanda birim yok</div>
                          )}
                          {birimList.map((b) => (
                            <button
                              key={b.id}
                              onClick={() => { setSeciliBirimId(b.id); toggleDropdown("birim"); }}
                              className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-[12.5px] font-bold transition-colors ${seciliBirimId === b.id ? "bg-orange-50 text-[#ef5a28]" : "text-[#172b4d] hover:bg-gray-50"}`}
                            >
                              {seciliBirimId === b.id && <span className="w-1.5 h-1.5 rounded-full bg-[#ef5a28] shrink-0" />}
                              <span className="truncate">{b.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 items-end pb-0.5 ml-auto">
                  <button
                    onClick={handleFiltreyiKaldir}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-[#6b778c] hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Filtreyi Kaldır
                  </button>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-3">TOPLU İŞLEMLER</p>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 relative">
                  <span className="text-[12px] font-extrabold text-[#172b4d]">HIZLI MENÜ</span>

                  <div className="relative dropdown-container">
                    <button
                      onClick={() => toggleDropdown("hizliMenu")}
                      className={`flex items-center gap-2 w-64 pl-4 pr-3 py-2 border-2 rounded-xl text-[13px] font-bold shadow-sm transition-all ${
                        activeDropdown === "hizliMenu" ? "bg-white border-[#ef5a28]" : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {secilenHizliIslem ? (
                        <>
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0"
                            style={{ backgroundColor: HIZLI_ISLEMLER.find((h) => h.kod === secilenHizliIslem)?.renk }}
                          >
                            {secilenHizliIslem.slice(0, 2)}
                          </span>
                          <span className="flex-1 text-left truncate text-[#172b4d]">
                            {HIZLI_ISLEMLER.find((h) => h.kod === secilenHizliIslem)?.label}
                          </span>
                        </>
                      ) : (
                        <span className="flex-1 text-left truncate text-gray-400">İşlem seçiniz...</span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                          activeDropdown === "hizliMenu" ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {activeDropdown === "hizliMenu" && (
                      <div className="absolute left-0 top-[calc(100%+5px)] z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl w-72 overflow-hidden">
                        {HIZLI_ISLEMLER.map((h) => (
                          <button
                            key={h.kod}
                            onClick={() => {
                              setSecilenHizliIslem(h.kod);
                              setActiveDropdown(null);
                            }}
                            className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors ${
                              secilenHizliIslem === h.kod ? "bg-orange-50" : ""
                            }`}
                          >
                            <span
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white shrink-0"
                              style={{ backgroundColor: h.renk }}
                            >
                              {h.kod.slice(0, 2)}
                            </span>
                            <span
                              className="text-[12.5px] font-bold"
                              style={{ color: secilenHizliIslem === h.kod ? h.renk : "#172b4d" }}
                            >
                              {h.label}
                            </span>
                            {secilenHizliIslem === h.kod && <Check className="w-4 h-4 ml-auto text-[#ef5a28] shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={applyBulkOp}
                    className="flex items-center gap-2 bg-[#ef5a28] hover:bg-[#d94720] text-white font-extrabold text-[12.5px] px-5 py-2 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    Uygula
                  </button>
                </div>

                <div className="w-px h-7 bg-gray-200 mx-1 hidden sm:block"></div>

                <div className="flex items-center gap-2 flex-wrap relative">
                  <span className="text-[12px] font-bold text-gray-500">Gün Aralığı:</span>

                  <GunSec
                    value={gunAraligiBas}
                    options={days.map((d) => String(d).padStart(2, "0"))}
                    onChange={setGunAraligiBas}
                    isOpen={activeDropdown === "gunBas"}
                    onToggle={() => toggleDropdown("gunBas")}
                  />

                  <span className="text-gray-400 font-bold">-</span>

                  <GunSec
                    value={gunAraligiSon}
                    options={days.map((d) => String(d).padStart(2, "0"))}
                    onChange={setGunAraligiSon}
                    isOpen={activeDropdown === "gunSon"}
                    onToggle={() => toggleDropdown("gunSon")}
                  />

                  <span className="text-gray-400 font-bold text-[12px]">arası</span>

                  <div className="relative dropdown-container">
                    <button
                      onClick={() => toggleDropdown("turAta")}
                      className={`flex items-center gap-2.5 pl-3.5 pr-3 py-2 bg-white border-2 rounded-xl text-[13px] font-extrabold transition-all shadow-sm whitespace-nowrap ${
                        activeDropdown === "turAta"
                          ? "border-[#ef5a28] text-[#ef5a28]"
                          : "border-gray-200 text-[#172b4d] hover:border-gray-300"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: secilenTur.renk }}></span>
                      {secilenTur.label}
                      <ChevronDown
                        className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${
                          activeDropdown === "turAta" ? "rotate-180" : ""
                        }`}
                        style={{ color: activeDropdown === "turAta" ? secilenTur.renk : "#9ca3af" }}
                      />
                    </button>

                    {activeDropdown === "turAta" && (
                      <div className="absolute right-0 top-[calc(100%+5px)] z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl w-60 overflow-hidden">
                        {ALL_TYPES.map((t) => (
                          <button
                            key={t.kod}
                            onClick={() => {
                              setSecilenTur(t);
                              setActiveDropdown(null);
                            }}
                            className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${
                              secilenTur.kod === t.kod ? "text-white" : "text-[#172b4d] hover:bg-gray-50"
                            }`}
                            style={secilenTur.kod === t.kod ? { backgroundColor: t.renk } : {}}
                          >
                            <span
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 text-white"
                              style={{ backgroundColor: t.renk }}
                            >
                              {t.kod}
                            </span>
                            <span className="text-[12.5px] font-bold">{t.label}</span>
                            {secilenTur.kod === t.kod && <Check className="w-4 h-4 ml-auto shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={applyAsAtaOp}
                    className="flex items-center gap-2 bg-[#ef5a28] hover:bg-[#d94720] text-white font-extrabold text-[12.5px] px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    olarak ata Uygula
                  </button>
                </div>
              </div>

              {!duzenlemeIzni && (
                <p className="text-[11.5px] text-gray-400 font-medium mt-2">
                  Toplu işlemler menüsünü kullanmak için, hızlı veri girişi yapılabilir.
                </p>
              )}
            </div>
          </>
        )}

        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12.5px] font-extrabold text-[#172b4d]">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Toplam <span className="text-[#ef5a28] text-[14px] font-black mx-1">{filteredPersonel.length}</span> Kayıt
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 relative">
              <span className="text-[11px] font-bold text-gray-400">Sayfa Başına</span>
              <StyledSelect
                label=""
                value="200"
                options={["50", "100", "200"]}
                isOpen={activeDropdown === "sayfa"}
                onToggle={() => toggleDropdown("sayfa")}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400">Kişi Göster</span>
              <span className="w-7 h-7 bg-[#ef5a28] text-white text-[12px] font-black rounded-lg flex items-center justify-center">
                {filteredPersonel.length}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto scroll-x">
          <table className="w-full border-collapse" style={{ minWidth: `${520 + daysInMonth * 38}px` }}>
            <colgroup>
              <col style={{ width: "44px" }} />
              <col style={{ width: "54px" }} />
              <col style={{ width: "44px" }} />
              <col style={{ width: "200px" }} />
              {days.map((d) => (
                <col key={d} style={{ width: "38px" }} />
              ))}
              <col style={{ width: "220px" }} />
            </colgroup>

            <thead>
              <tr className="bg-[#ef5a28] text-white">
                <th className="py-3 px-2 text-center">
                  <button onClick={toggleAll} className="flex items-center justify-center w-full">
                    {selectedRows.length === filteredPersonel.length && filteredPersonel.length > 0 ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4 opacity-70" />
                    )}
                  </button>
                </th>

                <th className="py-3 px-2 text-center text-[11px] font-extrabold tracking-wider uppercase">S.No</th>

                <th className="py-3 px-2 text-center">
                  <Lock className="w-3.5 h-3.5 mx-auto opacity-80" />
                </th>

                <th className="py-3 px-2 text-left">
                  <div className="flex items-center gap-2 bg-[#d94720] rounded-lg px-2.5 py-1">
                    <Search className="w-3 h-3 opacity-70" />
                    <input
                      type="text"
                      placeholder="Ara..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="bg-transparent text-white placeholder-white/60 outline-none text-[11px] font-bold w-full"
                    />
                  </div>
                </th>

                {days.map((d) => {
                  const dayName = getDayName(year, month, d);
                  const wknd = isWeekend(year, month, d);
                  const autoLocked = isCellAutolocked(year, month, d);
                  // Düzenleme izni kapalıyken TÜM günlerde kilit göster
                  const showLock = autoLocked || !duzenlemeIzni;

                  return (
                    <th
                      key={d}
                      className={`py-1 text-center text-[10px] border-l border-[#d94720] ${
                        autoLocked ? "bg-[#b83210]" : wknd ? "bg-[#c83d13]" : ""
                      }`}
                      title={
                        autoLocked
                          ? "Otomatik kilitli (2 gün kuralı)"
                          : !duzenlemeIzni
                          ? "Düzenleme İzni kapalı"
                          : undefined
                      }
                    >
                      <div className="font-black leading-tight flex items-center justify-center gap-0.5">
                        {String(d).padStart(2, "0")}
                        {showLock && <Lock className="w-2 h-2 opacity-60" />}
                      </div>
                      <div className="opacity-80 font-bold">{dayName}</div>
                    </th>
                  );
                })}

                <th className="py-3 px-2 text-center text-[11px] font-extrabold tracking-wider uppercase border-l border-[#d94720]">
                  Toplamlar
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPersonel.length === 0 ? (
                <tr>
                  <td colSpan={5 + daysInMonth} className="py-16 text-center text-[13px] font-bold text-gray-400">
                    Kayıt bulunamadı
                  </td>
                </tr>
              ) : (
                filteredPersonel.map((p, idx) => {
                  const isExpanded = expandedRow === p.id;
                  const pJson2 = (p as any).personelJson && typeof (p as any).personelJson === "object" ? (p as any).personelJson : {};
                  const cikisTarihi =
                        (p as any).cikisTarihi ||
                        (p as any).sgkCikisTarihi ||
                        pJson2.istenAyrilisTarihi ||
                        pJson2.cikisTarihi ||
                        (p as any)['İşten Çıkış Tarihi'] ||
                        null;
                  const girisTarihi =
                        (p as any).girisTarihi ||
                        (p as any).sgkGirisTarihi ||
                        pJson2.iseBaslamaTarihi ||
                        pJson2.girisTarihi ||
                        (p as any)['İşe Giriş Tarihi'] ||
                        null;
                  const isPassive = !!cikisTarihi && new Date(cikisTarihi) < new Date();
                  const durumMetni = isPassive ? "Pasif" : (p.statu || "Aktif");
                  const statColor = durumMetni === "Pasif" ? "#ef4444" : "#10b981"; // kirmizi vs yesil
                  
                  return (
                  <Fragment key={p.id}>
                  <tr
                    className={`border-b border-gray-100 transition-colors ${
                      selectedRows.includes(p.id) ? "bg-orange-50/50" : "hover:bg-gray-50/40"
                    }`}
                  >
                    <td className="py-3 px-2 text-center">
                      <button onClick={() => toggleRow(p.id)}>
                        {selectedRows.includes(p.id) ? (
                          <CheckSquare className="w-4 h-4 text-[#ef5a28]" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300 hover:text-gray-400" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-2 text-center text-[11.5px] font-extrabold text-gray-500">
                      {String(idx + 1).padStart(3, "0")}
                    </td>

                    <td className="py-3 px-2 text-center">
                      <button 
                         onClick={() => {
                            if (!duzenlemeIzni) return;
                            setPersonel(prev => prev.map(x => x.id === p.id ? { ...x, kilit: !x.kilit } : x));
                            showToast(`${p.adSoyad} isimli personelin kilidi ${!p.kilit ? 'kapatıldı' : 'açıldı'}. Lütfen değişiklikleri kaydedin.`);
                         }}
                         className="hover:scale-110 active:scale-95 transition-transform"
                         title={p.kilit ? "Kilidi Aç" : "Personeli Kilitle (İşlem yapılmasını engeller)"}
                      >
                         <Lock className={`w-4 h-4 mx-auto transition-colors ${p.kilit ? "text-[#ef5a28]" : "text-gray-200 hover:text-gray-300"}`} />
                      </button>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statColor }}></span>
                        <span className="font-extrabold text-[13px] text-[#172b4d] truncate cursor-pointer hover:text-[#ef5a28] transition-colors flex items-center gap-1" onClick={() => setExpandedRow(isExpanded ? null : p.id)}>
                          {p.adSoyad}
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </span>
                      </div>
                      <div className="text-[10.5px] font-semibold text-gray-400 truncate pl-4">TCKN: {p.tckn}</div>
                      <div className="text-[10.5px] font-semibold text-gray-400 truncate pl-4 flex items-center justify-between">
                        <span>Per.Sicil.No: <span className="text-[#ef5a28] font-extrabold">{p.sicil}</span></span>
                      </div>
                    </td>

                    {days.map((d) => {
                      const val = getCellValue(p.id, d);
                      const tur = val ? getTur(val) : null;
                      const wknd = isWeekend(year, month, d);
                      const overtime = getOvertimeValue(p.id, d);

                      // --- Kural 1: 2 gün öncesi otomatik kilit ---
                      const autoLocked = isCellAutolocked(year, month, d);

                      // --- Kural 2: Çıkış tarihinden sonrası pasif ---
                      // personelJson içinden cikisTarihi çekilir (varsa)
                      const afterExit = isAfterCikisTarihi(year, month, d, cikisTarihi);

                      // --- Düzenleme izni + tüm kilitler ---
                      const beforeEntry = isBeforeGirisTarihi(year, month, d, girisTarihi);
                      const canEdit =
                        duzenlemeIzni && !kilit && !p.kilit && !autoLocked && !afterExit && !beforeEntry;

                      // Görsel durum sınıflandırması
                      const isPassive = afterExit || beforeEntry; // tamamen gri / pasif
                      const isHardLocked = autoLocked && !isPassive; // turuncu kafes
                      const isEditLocked = !duzenlemeIzni && !isPassive; // düzenleme izni yok

                      return (
                        <td
                          key={d}
                          className={`border-l border-gray-100 py-1 px-0.5 text-center relative ${
                            isPassive
                              ? "bg-gray-100/80"
                              : wknd
                              ? "bg-gray-50/40"
                              : ""
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1 relative">
                            {/* Düzenleme izni kapalıyken kafes overlay */}
                            {isEditLocked && !isPassive && !tur && (
                              <div
                                className="absolute inset-0 rounded-lg pointer-events-none"
                                style={{
                                  backgroundImage:
                                    "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(180,180,200,0.18) 3px, rgba(180,180,200,0.18) 4px)",
                                  zIndex: 1,
                                }}
                              />
                            )}

                            <button
                              onClick={() => handleCellClick(p.id, d)}
                              disabled={!canEdit}
                              title={
                                afterExit
                                  ? "Çıkış tarihinden sonraki gün"
                                  : beforeEntry
                                  ? "Giriş tarihinden önceki gün"
                                  : autoLocked
                                  ? "Bu gün otomatik kilitlendi (2 gün kuralı)"
                                  : canEdit
                                  ? "Tıkla ve durum seç"
                                  : "Düzenleme İzni kapalı"
                              }
                              className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center transition-all text-[10px] font-black relative ${
                                isPassive
                                  ? "bg-gray-200/60 text-gray-400 cursor-not-allowed border border-gray-200"
                                  : isHardLocked
                                  ? tur
                                    ? "cursor-not-allowed shadow-sm opacity-75"
                                    : "border-2 border-dashed border-orange-200 bg-orange-50/40 cursor-not-allowed"
                                  : tur
                                  ? `shadow-sm ${canEdit ? "hover:scale-105 cursor-pointer" : "cursor-default"}`
                                  : canEdit
                                  ? "border border-dashed border-gray-200 hover:border-[#ef5a28] hover:bg-orange-50/60 cursor-pointer"
                                  : "border border-gray-200/60 bg-gray-50/80 cursor-default"
                              }`}
                              style={
                                isPassive
                                  ? {}
                                  : tur
                                  ? { backgroundColor: tur.bg, color: tur.renk, opacity: isHardLocked ? 0.7 : 1 }
                                  : {}
                              }
                            >
                              {isPassive ? (
                                <span className="text-gray-300 text-[10px]">—</span>
                              ) : isHardLocked && !tur ? (
                                <Lock className="w-2.5 h-2.5 text-orange-300" />
                              ) : !duzenlemeIzni && !tur ? (
                                <Lock className="w-2.5 h-2.5 text-gray-300" />
                              ) : tur ? (
                                tur.kod
                              ) : (
                                ""
                              )}
                            </button>

                            <button
                              onClick={() => handleMesaiClick(p.id, d)}
                              disabled={!canEdit}
                              title={canEdit ? "Fazla mesai gir" : "Düzenleme İzni kapalı"}
                              className={`w-7 h-4 rounded-md text-[9px] font-black border transition-all ${
                                isPassive
                                  ? "border-gray-100 bg-gray-100/60 text-transparent cursor-not-allowed"
                                  : overtime?.hours > 0
                                  ? "border-blue-300 bg-blue-50 text-blue-600"
                                  : "border-gray-200 text-gray-300 hover:border-blue-300 hover:bg-blue-50"
                              } ${canEdit ? "cursor-pointer" : "cursor-default"}`}
                            >
                              {!isPassive && overtime?.hours > 0 ? overtime.hours : ""}
                            </button>
                          </div>
                        </td>
                      );
                    })}

                    <td className="border-l border-gray-100 px-3 py-2 bg-white min-w-[220px]">
                      {(() => {
                        const summary = getSummary(p.id);
                        const totalOT = getTotalOvertime(p.id);

                        const items = [
                          { key: "N", color: "text-green-600" },
                          { key: "HT", color: "text-amber-600" },
                          { key: "Üİ", color: "text-violet-600" },
                          { key: "ÜZ", color: "text-yellow-600" },
                          { key: "Yİ", color: "text-teal-600" },
                          { key: "RP", color: "text-lime-600" },
                          { key: "D", color: "text-red-600" },
                          { key: "RX", color: "text-purple-600" },
                          { key: "HX", color: "text-cyan-600" },
                          { key: "RT", color: "text-rose-600" },
                        ];

                        return (
                          <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10.5px] font-bold">
                            {items.map((item) => (
                              <div key={item.key} className={summary[item.key] ? item.color : "text-gray-300"}>
                                {item.key}: <span className="font-black">{String(summary[item.key] || 0).padStart(2, "0")}</span>
                              </div>
                            ))}
                            <div className={`${totalOT > 0 ? "text-blue-600" : "text-gray-300"} col-span-3`}>
                              FM: <span className="font-black">{String(totalOT).padStart(2, "0")} saat</span>
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-orange-50/20 border-b-2 border-orange-100">
                      <td colSpan={5 + daysInMonth} className="p-0">
                        <div className="overflow-hidden transition-all duration-300 animate-in slide-in-from-top-2">
                          <div className="px-6 py-3 flex items-center gap-x-6 gap-y-2 flex-wrap text-[11.5px] font-semibold text-gray-600">
                            <div className="flex items-center gap-2 border-r border-orange-200/60 pr-6">
                              <span className="text-gray-400">Durum:</span>
                              <div className="flex items-center gap-1.5 font-extrabold" style={{ color: statColor }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statColor }}></span>
                                {durumMetni}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-400">Firma:</span>
                              <span className="text-[#172b4d] font-extrabold">{firmaAdi || "-"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-400">Şube:</span>
                              <span className="text-[#172b4d] font-extrabold">{(p.branch as any)?.name || (p as any).sube || "-"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-400">Departman:</span>
                              <span className="text-[#172b4d] font-extrabold">{(p.department as any)?.name || (p as any).departman || "-"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-400">Görevi:</span>
                              <span className="text-[#172b4d] font-extrabold">{p.unvan || "-"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 border-l border-orange-200/60 pl-6 ml-auto">
                              <span className="text-gray-400">Giriş Trh:</span>
                              <span className="text-[#172b4d] font-extrabold">
                                {(p as any).girisTarihi || (p as any).sgkGirisTarihi || (p as any)['İşe Giriş Tarihi'] || "-"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-400">Çıkış Trh:</span>
                              <span className="text-[#172b4d] font-extrabold">{cikisTarihi || "-"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}