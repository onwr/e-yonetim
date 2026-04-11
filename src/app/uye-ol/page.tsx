"use client";
import { useState } from "react";
import Image from "next/image";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";
import RegistrationForm from "@/components/auth/RegistrationForm";
import SmsVerificationForm from "@/components/auth/SmsVerificationForm";
import SuccessModal from "@/components/auth/SuccessModal";
export default function UyeOl() {
  const [step, setStep] = useState(1);
  const [telefon, setTelefon] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [firmaKodu, setFirmaKodu] = useState("");

  const persistAnaKullaniciOnboarding = (data: any, tel: string) => {
    const targetAnaKullaniciData = {
      formData: {
        adSoyad: data.adSoyad,
        tckn: data.tckn,
        unvan: "",
        telefon: tel,
        email: data.eposta,
      },
      files: { kimlikOn: null, kimlikArka: null, vekaletname: null },
      contractsStatus: {
        kvkk: { read: false, approved: false },
        hizmet: { read: false, approved: false },
        iletisim: { read: false, approved: false },
        veri: { read: false, approved: false },
      },
    };
    void fetch("/api/v1/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        key: "ana-kullanici-data",
        completed: false,
        data: targetAnaKullaniciData,
      }),
    });
  };
  return (
    <>
      <main className="h-screen w-full flex bg-white font-sans text-[#172b4d] overflow-hidden relative">
        {isSuccess && <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-40 transition-all duration-500 ease-in-out" />}
        <AuthLeftPanel />
        <div className="w-full lg:w-[45%] xl:w-[40%] h-full overflow-x-hidden overflow-y-auto flex flex-col items-center p-6 sm:p-12 scroll-smooth">
          <div className="w-full max-w-md mx-auto relative my-auto py-8 text-[#172b4d]">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <Image src="/analogo.svg" alt="e-puantaj" width={160} height={60} className="h-16 w-auto" />
              </div>
              <h2 className="text-[26px] font-extrabold mb-2 tracking-tight">Hoş Geldiniz - Üye Ol</h2>
              <p className="text-sm text-[#6b778c] font-medium">Hesabınızı oluşturun ve hemen başlayın</p>
            </div>
            {step === 1 ? (
              <RegistrationForm
                onSuccess={(data: any) => {
                  setTelefon(data.telefon);
                  setUserData(data);
                  // NetGSM responseCode=30 bypass durumunda backend session acmis sayilir.
                  if (data.smsBypassed && data.firmaKodu) {
                    setFirmaKodu(data.firmaKodu);
                    setIsSuccess(true);
                    persistAnaKullaniciOnboarding(data, data.telefon);
                    return;
                  }
                  setStep(2);
                }}
              />
            ) : (
              <SmsVerificationForm
                telefon={telefon}
                type="register"
                onBack={() => setStep(1)}
                onSuccess={(kodu) => {
                  // kodu = firmaKodu returned from verifySmsAndCreateSession after real DB creation
                  setFirmaKodu(kodu);
                  setIsSuccess(true);
                  // Session cookie zaten sunucu tarafında ayarlandı, onboarding'i şimdi kaydedebiliriz
                  if (userData) persistAnaKullaniciOnboarding(userData, userData.telefon);
                }}
              />
            )}
          </div>
        </div>
      </main>
      {isSuccess && <SuccessModal firmaKodu={firmaKodu} />}
    </>
  );
}