"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchJsonSafe } from "@/lib/fetchJsonWithError";

export type FirmaDataType = {
  formData: {
    vergiNo: string;
    firmaUnvani: string;
    sektor: string;
    calisanSayisi: string;
    subeSayisi: string;
    il: string;
    ilce: string;
    mahalle: string;
    adres: string;
    postaKodu: string;
    telefon: string;
    ePosta: string;
    webSitesi: string;
  };
  files: {
    vergiLevhasi: any;
    ticaretSicil: any;
    imzaSirkuleri: any;
  }
};

export type AnaKullaniciDataType = {
  formData: {
    adSoyad: string;
    tckn: string;
    unvan: string;
    telefon: string;
    email: string;
  };
  files: {
    kimlikOn: any;
    kimlikArka: any;
    vekaletname: any;
  };
  contractsStatus: Record<string, { read: boolean; approved: boolean }>;
};

const defaultFirmaData: FirmaDataType = {
  formData: {
    vergiNo: "",
    firmaUnvani: "",
    sektor: "",
    calisanSayisi: "0",
    subeSayisi: "0",
    il: "",
    ilce: "",
    mahalle: "",
    adres: "",
    postaKodu: "",
    telefon: "",
    ePosta: "",
    webSitesi: "",
  },
  files: {
    vergiLevhasi: null,
    ticaretSicil: null,
    imzaSirkuleri: null,
  }
};

const defaultAnaKullaniciData: AnaKullaniciDataType = {
  formData: { adSoyad: "", tckn: "", unvan: "", telefon: "", email: "" },
  files: { kimlikOn: null, kimlikArka: null, vekaletname: null },
  contractsStatus: {
    kvkk: { read: false, approved: false },
    hizmet: { read: false, approved: false },
    iletisim: { read: false, approved: false },
    veri: { read: false, approved: false },
  }
};

type OnboardingContextType = {
  isSetupComplete: boolean;
  setupStep: number;
  completeFirmaSetup: () => void;
  completeAnaKullaniciSetup: () => void;
  completeSetup: () => void; // doğrudan bitirmek için (geriye dönük uyumluluk veya test)
  firmaData: FirmaDataType;
  setFirmaData: React.Dispatch<React.SetStateAction<FirmaDataType>>;
  anaKullaniciData: AnaKullaniciDataType;
  setAnaKullaniciData: React.Dispatch<React.SetStateAction<AnaKullaniciDataType>>;
};

const OnboardingContext = createContext<OnboardingContextType>({
  isSetupComplete: false,
  setupStep: 0,
  completeFirmaSetup: () => {},
  completeAnaKullaniciSetup: () => {},
  completeSetup: () => {},
  firmaData: defaultFirmaData,
  setFirmaData: () => {},
  anaKullaniciData: defaultAnaKullaniciData,
  setAnaKullaniciData: () => {}
});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [setupStep, setSetupStep] = useState<number>(0);
  const [firmaData, setFirmaData] = useState<FirmaDataType>(defaultFirmaData);
  const [anaKullaniciData, setAnaKullaniciData] = useState<AnaKullaniciDataType>(defaultAnaKullaniciData);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  /** Kiracı için sunucuda onboarding tamamlandıysa, istemci form snapshot'ı eksik olsa bile adımı düşürme */
  const [tenantOnboardingDone, setTenantOnboardingDone] = useState<boolean>(false);

  async function saveOnboardingStep(key: string, completed: boolean, data?: unknown) {
    await fetchJsonSafe("/api/v1/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, completed, data }),
    });
  }

  function isFirmaComplete(data: FirmaDataType): boolean {
    const f = data.formData;
    const reqFText = [
      f?.vergiNo,
      f?.firmaUnvani,
      f?.sektor,
      f?.calisanSayisi,
      f?.subeSayisi,
      f?.il,
      f?.ilce,
      f?.mahalle,
      f?.adres,
      f?.postaKodu,
      f?.telefon,
      f?.ePosta,
    ];
    const reqFFiles = [data.files?.vergiLevhasi, data.files?.imzaSirkuleri];
    return reqFText.every((v) => v?.trim()?.length > 0) && reqFFiles.every((v) => v !== null);
  }

  function isAnaComplete(data: AnaKullaniciDataType): boolean {
    const a = data.formData;
    const c = data.contractsStatus;
    const reqAText = [a?.adSoyad, a?.tckn, a?.unvan, a?.telefon, a?.email];
    const reqAFiles = [data.files?.kimlikOn, data.files?.kimlikArka, data.files?.vekaletname];
    const reqACont = [c?.kvkk, c?.hizmet, c?.iletisim, c?.veri];
    return (
      reqAText.every((v) => v?.trim()?.length > 0) &&
      reqAFiles.every((v) => v !== null) &&
      reqACont.every((v) => v?.approved)
    );
  }

  useEffect(() => {
    void (async () => {
      const [firmaApi, onboardingApi] = await Promise.all([
        fetchJsonSafe<any>("/api/v1/firma"),
        fetchJsonSafe<{ completed: boolean; steps: Array<{ key: string; completed: boolean; payload?: unknown }> }>(
          "/api/v1/onboarding",
        ),
      ]);

      let nextFirma: FirmaDataType = defaultFirmaData;
      let nextAna: AnaKullaniciDataType = defaultAnaKullaniciData;

      if (firmaApi) {
        nextFirma = {
          ...nextFirma,
          formData: {
            ...nextFirma.formData,
            vergiNo: firmaApi.vergiNo ?? "",
            firmaUnvani: firmaApi.firmaUnvani ?? "",
            sektor: firmaApi.sektor ?? "",
            calisanSayisi: firmaApi.calisanSayisi?.toString?.() ?? "0",
            subeSayisi: firmaApi.subeSayisi?.toString?.() ?? "0",
            il: firmaApi.il ?? "",
            ilce: firmaApi.ilce ?? "",
            mahalle: firmaApi.mahalle ?? "",
            adres: firmaApi.adres ?? "",
            postaKodu: firmaApi.postaKodu ?? "",
            telefon: firmaApi.telefon ?? "",
            ePosta: firmaApi.ePosta ?? "",
            webSitesi: firmaApi.webSitesi ?? "",
          },
        };
      }

      if (onboardingApi?.steps?.length) {
        const firmaStep = onboardingApi.steps.find((s) => s.key === "firma-data");
        const anaStep = onboardingApi.steps.find((s) => s.key === "ana-kullanici-data");
        if (firmaStep?.payload && typeof firmaStep.payload === "object") {
          nextFirma = firmaStep.payload as FirmaDataType;
        }
        if (anaStep?.payload && typeof anaStep.payload === "object") {
          nextAna = anaStep.payload as AnaKullaniciDataType;
        }
      }

      const serverDone = Boolean(onboardingApi?.completed);
      setTenantOnboardingDone(serverDone);

      setFirmaData(nextFirma);
      setAnaKullaniciData(nextAna);

      if (serverDone) {
        setSetupStep(2);
      } else {
        const step = isFirmaComplete(nextFirma) ? (isAnaComplete(nextAna) ? 2 : 1) : 0;
        setSetupStep(step);
      }

      setIsLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (tenantOnboardingDone) {
      setSetupStep((s) => (s < 2 ? 2 : s));
      return;
    }
    const firmaOk = isFirmaComplete(firmaData);
    const anaOk = isAnaComplete(anaKullaniciData);
    const newStep = !firmaOk ? 0 : !anaOk ? 1 : 2;
    setSetupStep((s) => (s !== newStep ? newStep : s));

    void saveOnboardingStep("firma-data", firmaOk, firmaData);
    void saveOnboardingStep("ana-kullanici-data", anaOk, anaKullaniciData);
  }, [firmaData, anaKullaniciData, isLoaded, tenantOnboardingDone]);

  useEffect(() => {
    if (!isLoaded) return;
    void fetchJsonSafe("/api/v1/firma", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firmaData.formData),
    });
  }, [firmaData.formData, isLoaded]);

  const completeFirmaSetup = () => {
    setSetupStep(1);
    void saveOnboardingStep("firma-data", true, firmaData);
  };

  const completeAnaKullaniciSetup = () => {
    setSetupStep(2);
    void saveOnboardingStep("ana-kullanici-data", true, anaKullaniciData);
  };

  const completeSetup = () => {
    setSetupStep(2);
    void saveOnboardingStep("firma-data", true, firmaData);
    void saveOnboardingStep("ana-kullanici-data", true, anaKullaniciData);
  };

  const isSetupComplete = setupStep >= 2;

  return (
    <OnboardingContext.Provider value={{ 
      isSetupComplete, setupStep, completeFirmaSetup, completeAnaKullaniciSetup, completeSetup,
      firmaData, setFirmaData, anaKullaniciData, setAnaKullaniciData
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
