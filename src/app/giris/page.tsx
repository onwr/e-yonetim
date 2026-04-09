"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, CheckCircle2, Building2, Loader2 } from "lucide-react";
import LoginLeftPanel from "@/components/auth/LoginLeftPanel";
import SmsVerificationForm from "@/components/auth/SmsVerificationForm";
import { AuthService } from "@/services/auth.service";
import { toast } from "sonner";
export default function Giris() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [firmaKodu, setFirmaKodu] = useState("");
  const [tckn, settckn] = useState("");
  const [telefon, setTelefon] = useState("");         // masked - display only
  const [rawTelefon, setRawTelefon] = useState("");   // real - used for verify API
  const [sifre, setSifre] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleTcChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 11) {
      settckn(val);
    }
  };
  const handleFirmaKoduChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 5) {
      setFirmaKodu(val);
    }
  };
  const isFormValid = firmaKodu.length === 5 && tckn.length === 11 && sifre.length >= 6;
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;
    setIsLoading(true);
    try {
      const response = await AuthService.login({ firmaKodu, tckn, sifre });
      if (response.success && response.telefon) {
        if (response.smsBypassed) {
          toast.success("Giriş başarılı.");
          setIsSuccess(true);
          setTimeout(() => {
            router.push("/panel");
          }, 800);
          return;
        }
        toast.success("Bilgiler doğru. SMS doğrulaması gerekiyor.");
        setTelefon(response.telefon);         // masked - for display
        setRawTelefon(response.rawTelefon ?? response.telefon ?? ""); // real - for verify
        setStep(2);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Giriş başarısız oldu.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSmsSuccess = () => {
    toast.success("Giriş başarılı! Sisteme yönlendiriliyorsunuz...");
    setIsSuccess(true);
    setTimeout(() => {
      router.push("/panel");
    }, 1200);
  };
  return (
    <main className="h-screen w-full flex bg-white font-sans text-[#172b4d] overflow-hidden relative">
      {isSuccess && <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-40 transition-all duration-500 ease-in-out" />}
      <LoginLeftPanel />
      <div className="w-full lg:w-[45%] xl:w-[40%] h-full overflow-x-hidden overflow-y-auto flex flex-col items-center p-6 sm:p-12 scroll-smooth">
        <div className="w-full max-w-md mx-auto relative my-auto py-8 text-[#172b4d]">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-8">
              <Image src="/analogo.svg" alt="e-Yönetim" width={180} height={70} className="h-[72px] w-auto" />
            </div>
            <h2 className="text-[26px] font-extrabold mb-2 tracking-tight text-[#172b4d]">Hoş Geldiniz - Giriş Yap</h2>
            <p className="text-[14.5px] text-[#6b778c] font-medium">Hesabınıza güvenle giriş yapın</p>
          </div>
          {step === 1 ? (
            <form className="space-y-4 animate-slide-left w-full" onSubmit={handleLoginSubmit}>
              <div className="group">
                <label className="block text-[13.5px] font-bold text-[#42526e] mb-2 tracking-wide transition-colors group-focus-within:text-[#ef5a28]">
                  Firma Kodu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Building2 className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-[#ef5a28] transition-colors" />
                  </div>
                  <input
                    type="text"
                    maxLength={5}
                    value={firmaKodu}
                    onChange={handleFirmaKoduChange}
                    placeholder="12345"
                    className="block w-full pl-10 pr-4 py-[14px] border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#ef5a28]/15 focus:border-[#ef5a28] text-[15px] outline-none transition-all duration-300 shadow-sm hover:border-gray-300 focus:bg-white bg-gray-50/50 text-[#172b4d] font-semibold tracking-wider"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400 font-medium">Zorunlu Alan</p>
              </div>
              <div className="group">
                <label className="block text-[13.5px] font-bold text-[#42526e] mb-2 tracking-wide transition-colors group-focus-within:text-[#ef5a28]">
                  T.C. Kimlik Numaranız <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-[#ef5a28] transition-colors" />
                  </div>
                  <input
                    type="text"
                    maxLength={11}
                    value={tckn}
                    onChange={handleTcChange}
                    placeholder="12345678901"
                    className="block w-full pl-10 pr-4 py-[14px] border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#ef5a28]/15 focus:border-[#ef5a28] text-[15px] outline-none transition-all duration-300 shadow-sm hover:border-gray-300 focus:bg-white bg-gray-50/50 text-[#172b4d]"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400 font-medium">Zorunlu Alan</p>
              </div>
              <div className="group">
                <label className="block text-[13.5px] font-bold text-[#42526e] mb-2 tracking-wide transition-colors group-focus-within:text-[#ef5a28]">
                  Şifre <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-[#ef5a28] transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={sifre}
                    onChange={(e) => setSifre(e.target.value)}
                    placeholder="********"
                    className="block w-full pl-10 pr-12 py-[14px] border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#ef5a28]/15 focus:border-[#ef5a28] text-[15px] outline-none transition-all duration-300 shadow-sm hover:border-gray-300 focus:bg-white bg-gray-50/50 text-[#172b4d]"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                    <div className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                      {showPassword ? <EyeOff className="h-[18px] w-[18px] text-gray-500" /> : <Eye className="h-[18px] w-[18px] text-gray-500" />}
                    </div>
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-gray-400 font-medium">Zorunlu Alan</p>
              </div>
              <div className="flex justify-end pt-2 pb-4">
                <Link href="/sifre-unuttum" className="text-[12.5px] font-bold text-[#6b778c] hover:text-[#0052cc] transition-colors">
                  Şifremi veya Firma Kodumu Unuttum
                </Link>
              </div>
              <div className="flex flex-col gap-4 w-full">
                <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="w-full bg-[rgb(0,214,91)] hover:bg-[#00c050] text-white font-extrabold text-[16.5px] py-[18px] px-4 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center gap-2.5 shadow-[0_8px_20px_-6px_rgba(0,214,91,0.5)] disabled:opacity-50 disabled:shadow-none disabled:hover:-translate-y-0 disabled:cursor-not-allowed hover:-translate-y-1 hover:shadow-[0_12px_24px_-6px_rgba(0,214,91,0.7)] active:scale-95 active:translate-y-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-6 w-6 stroke-[2.5] animate-spin" />
                      Giriş Yapılıyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
                      Giriş Yap
                    </>
                  )}
                </button>
              </div>
              <div className="text-center pt-5">
                <p className="text-[13.5px] font-semibold text-[#6b778c]">
                  Hesabınız yok mu? <Link href="/uye-ol" className="text-[#0052cc] hover:underline hover:text-[#0747a6] transition-colors ml-1 font-bold">Hemen Üye Ol</Link>
                </p>
              </div>
            </form>
          ) : (
            <SmsVerificationForm
              telefon={telefon}
              verifyTelefon={rawTelefon}
              onBack={() => setStep(1)}
              onSuccess={handleSmsSuccess}
              type="login"
            />
          )}
        </div>
      </div>
    </main>
  );
}
