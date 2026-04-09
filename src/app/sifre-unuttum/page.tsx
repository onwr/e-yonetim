"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, Building2, Phone, CheckCircle2, ArrowLeft, Key, MessageSquare } from "lucide-react";
import LoginLeftPanel from "@/components/auth/LoginLeftPanel";
import { AuthService } from "@/services/auth.service";
import { toast } from "sonner";
import SmsVerificationForm from "@/components/auth/SmsVerificationForm";

export default function SifreUnuttum() {
  const router = useRouter();
  const [tab, setTab] = useState<"sifre" | "firma">("sifre");
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Info Form, 2: SMS Verify, 3: Yeni Sifre

  const [tckn, setTckn] = useState("");
  const [telefon, setTelefon] = useState("");
  const [firmaKodu, setFirmaKodu] = useState("");
  
  const [yeniSifre, setYeniSifre] = useState("");
  const [smsKodu, setSmsKodu] = useState(""); // SMS formdan donecek olan kod veya ayrica tutulabilen
  
  const [isLoading, setIsLoading] = useState(false);

  const handleTcChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 11) setTckn(val);
  };
  const handleTelChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 11) setTelefon(val);
  };
  const handleFirmaKoduChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 5) setFirmaKodu(val);
  };

  const isFirmaKoduFormValid = tckn.length === 11 && telefon.length >= 10;
  const isSifreFormValid = firmaKodu.length === 5 && tckn.length === 11 && telefon.length >= 10;
  const isYeniSifreValid = yeniSifre.length >= 8;

  const handleFirmaKoduSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFirmaKoduFormValid || isLoading) return;
    setIsLoading(true);
    try {
      await AuthService.forgotFirmaKodu({ tckn, telefon });
      toast.success("Firma kodunuz kayıtlı telefonunuza SMS olarak gönderildi.");
      setTimeout(() => router.push("/giris"), 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "İşlem başarısız.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSifreUnuttumSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isSifreFormValid || isLoading) return;
    setIsLoading(true);
    try {
      await AuthService.sendForgotPasswordSms({ firmaKodu, tckn, telefon });
      toast.success("Şifre sıfırlama kodunuz SMS olarak gönderildi.");
      setStep(2);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "İşlem başarısız.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleYeniSifreKaydet = async (e: FormEvent) => {
    e.preventDefault();
    if (!isYeniSifreValid || isLoading) return;
    setIsLoading(true);
    try {
      await AuthService.resetPassword({ telefon, yeniSifre });
      toast.success("Şifreniz başarıyla değiştirildi. Giriş yapabilirsiniz.");
      setTimeout(() => router.push("/giris"), 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Şifre yenileme başarısız.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-full flex bg-white font-sans text-[#172b4d] overflow-hidden relative">
      <LoginLeftPanel />
      <div className="w-full lg:w-[45%] xl:w-[40%] h-full overflow-x-hidden overflow-y-auto flex flex-col items-center p-6 sm:p-12 scroll-smooth">
        <div className="w-full max-w-md mx-auto relative mt-16 pb-8 text-[#172b4d]">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image src="/analogo.svg" alt="e-Yönetim" width={180} height={70} className="h-[72px] w-auto" />
            </div>
            <h2 className="text-[26px] font-extrabold mb-2 tracking-tight text-[#172b4d]">Hesap Kurtarma</h2>
            <p className="text-[14.5px] text-[#6b778c] font-medium">Lütfen yapmak istediğiniz işlemi seçin</p>
          </div>

          {step === 1 && (
            <div className="mb-8 flex p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setTab("sifre")}
                className={`flex-1 py-2.5 text-[14px] font-bold rounded-lg transition-all ${tab === "sifre" ? "bg-white text-[#ef5a28] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Şifremi Unuttum
              </button>
              <button
                onClick={() => setTab("firma")}
                className={`flex-1 py-2.5 text-[14px] font-bold rounded-lg transition-all ${tab === "firma" ? "bg-white text-[#ef5a28] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Firma Kodumu Öğren
              </button>
            </div>
          )}

          {step === 1 && tab === "firma" && (
            <form className="space-y-4 animate-slide-left w-full" onSubmit={handleFirmaKoduSubmit}>
              <div className="p-4 bg-blue-50 text-blue-800 text-[13.5px] rounded-xl mb-4 font-medium border border-blue-100">
                Firma kodunuzu SMS olarak almak için güvenlik bilgilerinizi giriniz.
              </div>
              <div className="group">
                <label className="block text-[13.5px] font-bold text-[#42526e] mb-2 tracking-wide transition-colors group-focus-within:text-[#ef5a28]">
                  T.C. Kimlik Numaranız
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
                    className="block w-full pl-10 pr-4 py-[14px] border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#ef5a28]/15 focus:border-[#ef5a28] text-[15px] outline-none transition-all duration-300 shadow-sm hover:border-gray-300 focus:bg-white bg-gray-50/50"
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-[13.5px] font-bold text-[#42526e] mb-2 tracking-wide transition-colors group-focus-within:text-[#ef5a28]">
                  Kayıtlı Telefon Numaranız
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-[#ef5a28] transition-colors" />
                  </div>
                  <input
                    type="text"
                    maxLength={11}
                    value={telefon}
                    onChange={handleTelChange}
                    placeholder="05551234567"
                    className="block w-full pl-10 pr-4 py-[14px] border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#ef5a28]/15 focus:border-[#ef5a28] text-[15px] outline-none transition-all duration-300 shadow-sm hover:border-gray-300 focus:bg-white bg-gray-50/50"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!isFirmaKoduFormValid || isLoading}
                  className="w-full bg-[#ef5a28] hover:bg-[#d94a1d] text-white font-extrabold text-[16.5px] py-[18px] px-4 rounded-xl transition-all duration-300 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isLoading ? "Gönderiliyor..." : "Firma Kodumu SMS Gönder"}
                </button>
              </div>
            </form>
          )}

          {step === 1 && tab === "sifre" && (
            <form className="space-y-4 animate-slide-left w-full" onSubmit={handleSifreUnuttumSubmit}>
              <div className="group">
                <label className="block text-[13.5px] font-bold text-[#42526e] mb-2 tracking-wide transition-colors group-focus-within:text-[#ef5a28]">
                  Firma Kodunuz
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
                    className="block w-full pl-10 pr-4 py-[14px] border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#ef5a28]/15 focus:border-[#ef5a28] text-[15px] outline-none transition-all duration-300 shadow-sm hover:border-gray-300 focus:bg-white bg-gray-50/50"
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-[13.5px] font-bold text-[#42526e] mb-2 tracking-wide transition-colors group-focus-within:text-[#ef5a28]">
                  T.C. Kimlik Numaranız
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
                    className="block w-full pl-10 pr-4 py-[14px] border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#ef5a28]/15 focus:border-[#ef5a28] text-[15px] outline-none transition-all duration-300 shadow-sm hover:border-gray-300 focus:bg-white bg-gray-50/50"
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-[13.5px] font-bold text-[#42526e] mb-2 tracking-wide transition-colors group-focus-within:text-[#ef5a28]">
                  Kayıtlı Telefon Numaranız
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-[#ef5a28] transition-colors" />
                  </div>
                  <input
                    type="text"
                    maxLength={11}
                    value={telefon}
                    onChange={handleTelChange}
                    placeholder="05551234567"
                    className="block w-full pl-10 pr-4 py-[14px] border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#ef5a28]/15 focus:border-[#ef5a28] text-[15px] outline-none transition-all duration-300 shadow-sm hover:border-gray-300 focus:bg-white bg-gray-50/50"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!isSifreFormValid || isLoading}
                  className="w-full bg-[#ef5a28] hover:bg-[#d94a1d] text-white font-extrabold text-[16.5px] py-[18px] px-4 rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? "Devam Ediliyor..." : "Devam Et"}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <SmsVerificationForm
              telefon={telefon}
              type="forgot_password"
              onBack={() => setStep(1)}
              onSuccess={() => {
                setStep(3);
                toast.success("Doğrulama başarılı, yeni şifrenizi belirleyebilirsiniz.");
              }}
            />
          )}

          {step === 3 && (
            <form className="space-y-4 animate-slide-left w-full" onSubmit={handleYeniSifreKaydet}>
              <div className="p-4 bg-green-50 text-green-800 text-[13.5px] rounded-xl mb-4 font-medium border border-green-100 flex gap-2">
                <CheckCircle2 className="w-5 h-5" /> Şifrenizi sıfırlayabilirsiniz.
              </div>
              <div className="group">
                <label className="block text-[13.5px] font-bold text-[#42526e] mb-2 tracking-wide transition-colors group-focus-within:text-green-600">
                  Yeni Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-green-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={yeniSifre}
                    onChange={(e) => setYeniSifre(e.target.value)}
                    placeholder="En az 8 karakter"
                    className="block w-full pl-10 pr-4 py-[14px] border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-600/15 focus:border-green-600 text-[15px] outline-none transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!isYeniSifreValid || isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-extrabold text-[16.5px] py-[18px] px-4 rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? "Kaydediliyor..." : "Yeni Şifreyi Kaydet"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link href="/giris" className="inline-flex items-center gap-2 text-[14px] font-bold text-[#6b778c] hover:text-[#172b4d] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Giriş Sayfasına Dön
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
