"use client";
import React, { createContext, useContext, useState } from "react";
import { fetchJsonSafe } from "@/lib/fetchJsonWithError";
import { Personel, Talep } from "@/types";

interface MockDataContextType {
  personeller: Personel[];
  setPersoneller: React.Dispatch<React.SetStateAction<Personel[]>>;
  talepler: Talep[];
  setTalepler: React.Dispatch<React.SetStateAction<Talep[]>>;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export function mapApiPersonel(item: any): Personel {
  return {
    id: item.id,
    tckn: item.tckn ?? "",
    adSoyad: item.adSoyad ?? "",
    unvan: item.unvan ?? "-",
    org: item.org ?? item.branch?.name ?? "-",
    sicil: item.sicil ?? "-",
    statu: item.statu ?? "Aktif",
    createdAt: item.createdAt ? String(item.createdAt) : undefined,
    ...(item.personelJson && typeof item.personelJson === "object" ? item.personelJson : {}),
  } as Personel;
}

export function mapTalepType(type: string): string {
  if (type === "SGK_GIRIS") return "sgk-giris";
  if (type === "SGK_CIKIS") return "sgk-cikis";
  return (type || "").toLowerCase();
}

export function mapTalepStatus(status: string): string {
  if (status === "ONAYLANDI") return "ONAYLANAN";
  if (status === "REDDEDILDI") return "REDDEDİLEN";
  return status ?? "BEKLEYEN";
}

export function mapApiTalep(item: any): Talep {
  const payload = (item.payload && typeof item.payload === "object" ? item.payload : {}) as Record<string, any>;
  const fb = payload.formBilgileri ?? payload;
  const adSoyad =
    String(item.employee?.adSoyad ?? "")
      .trim()
      .replace(/\s+/g, " ") ||
    String(payload.adSoyad ?? fb.adSoyad ?? "")
      .trim()
      .replace(/\s+/g, " ") ||
    `${String(fb.ad ?? "").trim()} ${String(fb.soyad ?? "").trim()}`.trim() ||
    "Personel";
  const personelIdRaw = item.employeeId ?? payload.personelId;
  return {
    id: item.id,
    tckn: item.employee?.tckn ?? payload.tckn ?? fb.tckn ?? "",
    adSoyad,
    sgkNo: payload.sgkNo ?? "-",
    sirket: payload.sirket ?? payload.firmaAdi ?? fb.firmaAdi ?? "",
    sube: payload.sube ?? payload.subeAdi ?? fb.subeAdi ?? "",
    departman: payload.departman ?? fb.departman ?? "",
    unvan: payload.unvan ?? payload.gorevi ?? fb.gorevi ?? "",
    durum: mapTalepStatus(item.status),
    tarih: item.createdAt ? new Date(item.createdAt).toLocaleDateString("tr-TR") : "",
    type: mapTalepType(item.type),
    formBilgileri: payload.formBilgileri,
    yetkiliEmail: payload.yetkiliEmail,
    personelId: typeof personelIdRaw === "string" && personelIdRaw.trim() ? personelIdRaw.trim() : item.employeeId,
    cikisTarihi: typeof payload.cikisTarihi === "string" ? payload.cikisTarihi : undefined,
    cikisNedeni: typeof payload.cikisNedeni === "string" ? payload.cikisNedeni : undefined,
  };
}

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [personeller, setPersonellerRaw] = useState<Personel[]>([]);
  const [talepler, setTaleplerRaw] = useState<Talep[]>([]);

  React.useEffect(() => {
    void (async () => {
      const [apiPersoneller, apiTalepler] = await Promise.all([
        fetchJsonSafe<any[]>("/api/v1/personel?page=1&pageSize=500"),
        fetchJsonSafe<any[]>("/api/v1/talepler?page=1&pageSize=500"),
      ]);

      setPersonellerRaw((apiPersoneller ?? []).map(mapApiPersonel));
      setTaleplerRaw((apiTalepler ?? []).map(mapApiTalep));
    })();
  }, []);

  const setPersoneller: React.Dispatch<React.SetStateAction<Personel[]>> = (value) => {
    setPersonellerRaw((prev) => {
      return typeof value === "function" ? (value as (p: Personel[]) => Personel[])(prev) : value;
    });
  };

  const setTalepler: React.Dispatch<React.SetStateAction<Talep[]>> = (value) => {
    setTaleplerRaw((prev) => {
      return typeof value === "function" ? (value as (p: Talep[]) => Talep[])(prev) : value;
    });
  };

  return (
    <MockDataContext.Provider value={{ personeller, setPersoneller, talepler, setTalepler }}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    throw new Error("useMockData must be used within a MockDataProvider");
  }
  return context;
}