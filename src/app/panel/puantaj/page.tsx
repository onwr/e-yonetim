"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
type BirimKayitSatir = { name: string; subeAdi: string; departmanAdi: string };

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
    const row = e as { employeeId?: string; overtime?: unknown };
    const pid = row.employeeId;
    if (!pid) continue;

    const src = row.overtime;
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
    <div ref={ref} className="relative">
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
      <div ref={ref} className="relative">
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
    <div ref={ref} className="relative">
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

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [pendingYear, setPendingYear] = useState(now.getFullYear());
  const [pendingMonth, setPendingMonth] = useState(now.getMonth());

  const [duzenlemeIzni, setDuzenlemeIzni] = useState(false);
  const [kilit, setKilit] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [secilenHizliIslem, setSecilenHizliIslem] = useState("");
  const [gunAraligiBas, setGunAraligiBas] = useState("01");
  const [gunAraligiSon, setGunAraligiSon] = useState("15");
  const [secilenTur, setSecilenTur] = useState<PuantajTur>(ALL_TYPES[0]!);

  const [firmaFiltre, setFirmaFiltre] = useState("Tümü");
  const [subeFiltre, setSubeFiltre] = useState("Tümü");
  const [departmanFiltre, setDepartmanFiltre] = useState("Tümü");
  const [birimFiltre, setBirimFiltre] = useState("Tümü");

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
  const [subeOptions, setSubeOptions] = useState<string[]>([]);
  const [departmanOptions, setDepartmanOptions] = useState<string[]>([]);
  const [birimKayitlari, setBirimKayitlari] = useState<BirimKayitSatir[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        setApiError("");
        setLoadingPersonel(true);

        const [list, subeler, departmanlar, birimler] = await Promise.all([
          fetchJsonWithError<any[]>("/api/v1/personel?page=1&pageSize=500"),
          fetchJsonWithError<any[]>("/api/v1/subeler?page=1&pageSize=200").catch(() => []),
          fetchJsonWithError<any[]>("/api/v1/departmanlar?page=1&pageSize=200").catch(() => []),
          fetchJsonWithError<any[]>("/api/v1/birimler?page=1&pageSize=500").catch(() => []),
        ]);

        const rows = Array.isArray(list) ? list.map(mapPersonelRow) : [];
        setPersonel(rows.map((p) => ({ ...p, kilit: false })));

        const sNames = (Array.isArray(subeler) ? subeler : []).map((s: any) => s.name).filter(Boolean);
        const dNames = (Array.isArray(departmanlar) ? departmanlar : [])
          .map((d: any) => d.departmanAdi || d.name)
          .filter(Boolean);

        setSubeOptions(sNames);
        setDepartmanOptions(dNames);
        setBirimKayitlari(
          (Array.isArray(birimler) ? birimler : []).map((u: any) => ({
            name: String(u.name ?? u.birimAdi ?? "").trim(),
            subeAdi: String(u.department?.branch?.name ?? "").trim(),
            departmanAdi: String(u.department?.name ?? "").trim(),
          })).filter((b) => b.name),
        );
      } catch (e) {
        setApiError(getApiErrorMessage(e, "Personel listesi yuklenemedi."));
        setPersonel([]);
      } finally {
        setLoadingPersonel(false);
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        setLoadingPuantaj(true);

        const entries = await fetchJsonWithError<unknown[]>(`/api/v1/puantaj?year=${year}&month=${month}`);

        setPuantajData(payrollEntriesToPuantajData(entries ?? []));
        setOvertimeData(payrollEntriesToOvertimeData(entries ?? []));
        setPendingData({});
        setPendingOvertimeData({});
      } catch (e) {
        setApiError(getApiErrorMessage(e, "Puantaj verisi yuklenemedi."));
        setPuantajData({});
        setOvertimeData({});
      } finally {
        setLoadingPuantaj(false);
      }
    })();
  }, [year, month]);

  const birimSelectOptions = useMemo(() => {
    let rows = birimKayitlari;
    if (subeFiltre !== "Tümü") {
      rows = rows.filter((r) => r.subeAdi === subeFiltre);
    }
    if (departmanFiltre !== "Tümü") {
      rows = rows.filter((r) => r.departmanAdi === departmanFiltre);
    }
    return [...new Set(rows.map((r) => r.name))].sort((a, b) => a.localeCompare(b, "tr"));
  }, [birimKayitlari, subeFiltre, departmanFiltre]);

  useEffect(() => {
    if (birimFiltre === "Tümü") return;
    if (!birimSelectOptions.includes(birimFiltre)) {
      setBirimFiltre("Tümü");
    }
  }, [birimFiltre, birimSelectOptions]);

  const daysInMonth = getDaysInMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const unsavedCount =
    Object.values(pendingData).reduce((sum, dayMap) => sum + Object.keys(dayMap).length, 0) +
    Object.values(pendingOvertimeData).reduce((sum, dayMap) => sum + Object.keys(dayMap).length, 0);

  const filteredPersonel = personel.filter((p) => {
    if (hiddenPersonelIds.has(String(p.id))) return false;

    const row = p as typeof p & { sirket?: string; sube?: string; departman?: string; birim?: string };
    const q = search.toLowerCase();

    const sMatch =
      !q ||
      String(p.adSoyad ?? "").toLowerCase().includes(q) ||
      String(p.tckn ?? "").includes(q) ||
      String(p.sicil ?? "").includes(q);

    const fMatch = firmaFiltre === "Tümü" || row.sirket === firmaFiltre;
    const suMatch = subeFiltre === "Tümü" || row.sube === subeFiltre || p.org === subeFiltre;
    const dMatch = departmanFiltre === "Tümü" || row.departman === departmanFiltre;
    const bMatch = birimFiltre === "Tümü" || row.birim === birimFiltre;

    return sMatch && fMatch && suMatch && dMatch && bMatch;
  });

  const handleFiltreyiKaldir = () => {
    setFirmaFiltre("Tümü");
    setSubeFiltre("Tümü");
    setDepartmanFiltre("Tümü");
    setBirimFiltre("Tümü");
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

    const allEmployeeIds = Array.from(new Set([...Object.keys(nextPuantaj), ...Object.keys(nextOvertime)]));

    const body = allEmployeeIds.map((employeeId) => ({
      employeeId,
      year,
      month,
      data: nextPuantaj[employeeId] || {},
      overtime: nextOvertime[employeeId] || {},
    }));

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
    const pids = selectedRows.length > 0 ? selectedRows : filteredPersonel.map((p) => p.id);

    setPendingData((prev) => {
      const next = { ...prev };

      pids.forEach((pid) => {
        const pidKey = `${pid}`;
        next[pidKey] = { ...next[pidKey] };

        for (let d = start; d <= end; d++) {
          const dayName = getDayName(year, month, d);

          if (secilenHizliIslem === "HT_ALL" && (dayName === "Cmt" || dayName === "Paz")) next[pidKey][d] = "HT";
          else if (secilenHizliIslem === "HT_PAZ" && dayName === "Paz") next[pidKey][d] = "HT";
          else if (secilenHizliIslem === "HT_CMT" && dayName === "Cmt") next[pidKey][d] = "HT";
          else if (secilenHizliIslem === "N_BOS" && !getCellValue(pid, d)) next[pidKey][d] = "N";
          else if (secilenHizliIslem === "TEMIZLE") next[pidKey][d] = "";
          else if (secilenHizliIslem === "RT_RES") {
            // Buraya resmi tatil takvimi bağlıysa doldurma mantığı ekleyebilirsin.
          }
        }
      });

      return next;
    });

    showToast(`${gunAraligiBas}-${gunAraligiSon} günleri arasına seçili işlem uygulandı.`);
  };

  const applyAsAtaOp = () => {
    if (!duzenlemeIzni) return;

    const start = parseInt(gunAraligiBas, 10);
    const end = parseInt(gunAraligiSon, 10);
    const pids = selectedRows.length > 0 ? selectedRows : filteredPersonel.map((p) => p.id);

    setPendingData((prev) => {
      const next = { ...prev };

      pids.forEach((pid) => {
        const pidKey = `${pid}`;
        next[pidKey] = { ...next[pidKey] };
        for (let d = start; d <= end; d++) next[pidKey][d] = secilenTur.kod;
      });

      return next;
    });

    showToast(`${gunAraligiBas}-${gunAraligiSon} günleri arasına seçili durum atandı.`);
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
              onClick={() => setKilit((p) => !p)}
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

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col min-w-0">
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
            onClick={() => setShowYeniPersonelModal(true)}
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
                <StyledSelect
                  label="Firma"
                  value={firmaFiltre}
                  options={["Tümü", "Diğer Firma"]}
                  onChange={setFirmaFiltre}
                  isOpen={activeDropdown === "firma"}
                  onToggle={() => toggleDropdown("firma")}
                />

                <StyledSelect
                  label="Şube"
                  value={subeFiltre}
                  options={["Tümü", ...subeOptions]}
                  onChange={setSubeFiltre}
                  isOpen={activeDropdown === "sube"}
                  onToggle={() => toggleDropdown("sube")}
                />

                <StyledSelect
                  label="Departman"
                  value={departmanFiltre}
                  options={["Tümü", ...departmanOptions]}
                  onChange={setDepartmanFiltre}
                  isOpen={activeDropdown === "dep"}
                  onToggle={() => toggleDropdown("dep")}
                />

                <StyledSelect
                  label="Birim"
                  value={birimFiltre}
                  options={["Tümü", ...birimSelectOptions]}
                  onChange={setBirimFiltre}
                  isOpen={activeDropdown === "birim"}
                  onToggle={() => toggleDropdown("birim")}
                />

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

                  <div className="relative">
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

                  <div className="relative">
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

                  return (
                    <th
                      key={d}
                      className={`py-1 text-center text-[10px] border-l border-[#d94720] ${wknd ? "bg-[#c83d13]" : ""}`}
                    >
                      <div className="font-black leading-tight">{String(d).padStart(2, "0")}</div>
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
                filteredPersonel.map((p, idx) => (
                  <tr
                    key={p.id}
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
                      <Lock className={`w-3.5 h-3.5 mx-auto ${p.kilit ? "text-[#ef5a28]" : "text-gray-200"}`} />
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                        <span className="font-extrabold text-[13px] text-[#172b4d] truncate">{p.adSoyad}</span>
                      </div>
                      <div className="text-[10.5px] font-semibold text-gray-400 truncate pl-4">TCKN: {p.tckn}</div>
                      <div className="text-[10.5px] font-semibold text-gray-400 truncate pl-4">
                        Per.Sicil.No: <span className="text-[#ef5a28] font-extrabold">{p.sicil}</span>
                      </div>
                    </td>

                    {days.map((d) => {
                      const val = getCellValue(p.id, d);
                      const tur = val ? getTur(val) : null;
                      const wknd = isWeekend(year, month, d);
                      const canEdit = duzenlemeIzni && !kilit && !p.kilit;
                      const overtime = getOvertimeValue(p.id, d);

                      return (
                        <td key={d} className={`border-l border-gray-100 py-1 px-0.5 text-center ${wknd ? "bg-gray-50/40" : ""}`}>
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => handleCellClick(p.id, d)}
                              disabled={!canEdit}
                              title={canEdit ? "Tıkla ve durum seç" : "Düzenleme İzni kapalı"}
                              className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center transition-all text-[10px] font-black ${
                                tur
                                  ? `shadow-sm ${canEdit ? "hover:scale-105 cursor-pointer" : "cursor-default"}`
                                  : canEdit
                                  ? "border border-dashed border-gray-200 hover:border-[#ef5a28] hover:bg-orange-50/60 cursor-pointer"
                                  : "border border-gray-200 bg-white/70 cursor-default rounded-lg"
                              }`}
                              style={tur ? { backgroundColor: tur.bg, color: tur.renk } : {}}
                            >
                              {tur ? tur.kod : ""}
                            </button>

                            <button
                              onClick={() => handleMesaiClick(p.id, d)}
                              disabled={!canEdit}
                              title={canEdit ? "Fazla mesai gir" : "Düzenleme İzni kapalı"}
                              className={`w-7 h-4 rounded-md text-[9px] font-black border transition-all ${
                                overtime?.hours > 0
                                  ? "border-blue-300 bg-blue-50 text-blue-600"
                                  : "border-gray-200 text-gray-300 hover:border-blue-300 hover:bg-blue-50"
                              } ${canEdit ? "cursor-pointer" : "cursor-default"}`}
                            >
                              {overtime?.hours > 0 ? overtime.hours : ""}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}