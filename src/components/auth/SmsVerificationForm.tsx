"use client";
import { useState, useEffect, FormEvent } from "react";
import { MessageSquare, Check, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { toast } from "sonner";
export default function SmsVerificationForm({ 
  telefon, 
  verifyTelefon,
  onBack, 
  onSuccess,
  type = "register"
}: { 
  telefon: string,          // display only (can be masked)
  verifyTelefon?: string,   // actual phone for API calls (optional, falls back to telefon)
  onBack: () => void, 
  onSuccess: (kodu: string) => void,
  type?: "register" | "login" | "forgot_password"
}) {
  const apiTelefon = verifyTelefon || telefon; // real phone for API
  const [smsKodu, setSmsKodu] = useState("");
  const [timeLeft, setTimeLeft] = useState(270);
  const [isWrongCode, setIsWrongCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };
  const handleSmsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (smsKodu.length !== 6 || isLoading) return;
    setIsLoading(true);
    setIsWrongCode(false);
    try {
      const response = await AuthService.verifySms({ telefon: apiTelefon, smsKodu, type });
      if (response.success) onSuccess(response.firmaKodu || "");
    } catch (error) {
      console.error(error);
      setIsWrongCode(true);
      const msg = error instanceof Error ? error.message : "SMS doğrulama başarısız.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };
  const isSmsTimeout = timeLeft === 0;
  const isSmsLengthError = smsKodu.length > 0 && smsKodu.length < 6;
  const hasSmsError = isSmsTimeout || isSmsLengthError || isWrongCode;
  return (
    <div className="animate-slide-right text-center flex flex-col items-center w-full">
      <p className="text-[14px] font-semibold text-[#0052cc] mb-8 px-2 leading-relaxed tracking-wide">
        <span className="font-extrabold">{telefon}</span> numaralı telefonunuza gönderilen kodu girin{type === "register" ? " ve üyeliğinizi tamamlayın" : "."}
      </p>
      <form className="w-full space-y-6 text-left relative" onSubmit={handleSmsSubmit}>
        <div className="group">
          <label className="block text-[13px] font-bold text-[#42526e] mb-2 tracking-wide">
            SMS Doğrulama Kodu
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <MessageSquare className={`h-[18px] w-[18px] transition-colors ${hasSmsError ? 'text-red-500' : 'text-gray-400 group-focus-within:text-[#ef5a28]'}`} />
              </div>
              <input 
                type="text" 
                maxLength={6}
                value={smsKodu} 
                onChange={(e) => {
                  setSmsKodu(e.target.value.replace(/\D/g, ""));
                  setIsWrongCode(false);
                }} 
                placeholder="6 Haneli Kod (Örn: 123456)"
                disabled={isSmsTimeout || isLoading}
                className={`block w-full pl-10 pr-10 py-3.5 border rounded-xl text-[15px] outline-none transition-all duration-300 shadow-sm font-semibold tracking-wider ${hasSmsError ? 'border-red-500 bg-red-50/80 text-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-gray-200 text-[#172b4d] hover:border-gray-300 focus:bg-white bg-gray-50/50 focus:ring-4 focus:ring-[#ef5a28]/15 focus:border-[#ef5a28]'}`}
              />
              {smsKodu.length === 6 && !hasSmsError && (
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none animate-zoom-in-spin">
                  <Check className="h-5 w-5 text-green-500 stroke-[3]" />
                </div>
              )}
            </div>
            <div className={`flex items-center justify-center border font-bold px-5 rounded-xl text-[16px] min-w-[76px] shadow-sm transition-colors ${isSmsTimeout ? 'bg-red-50/80 border-red-500 text-red-500' : 'bg-[#f4f5f7] border-gray-200 text-[#172b4d]'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          <p className={`mt-2 text-[12px] font-medium ${hasSmsError ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
            {isSmsTimeout ? "Doğrulama süresi doldu. Lütfen yeni bir kod isteyiniz." :
             isWrongCode ? "Girdiğiniz kod hatalı. Lütfen tekrar deneyiniz." :
             isSmsLengthError ? "Lütfen 6 haneli kodu eksiksiz giriniz." :
             "Telefonunuza gelen 6 haneli kodu giriniz"}
          </p>
        </div>
        <div className="flex flex-col gap-3.5 w-full mt-8 pb-6">
          <button
            type="submit"
            disabled={smsKodu.length !== 6 || isSmsTimeout || isLoading}
            className={`w-full font-extrabold text-[15px] py-[16.5px] px-4 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center gap-2.5 shadow-sm 
              ${isLoading 
                ? 'bg-[#0052cc] text-white cursor-wait opacity-90' 
                : 'bg-[#0052cc] hover:bg-[#0747a6] text-white disabled:bg-[#d2d7df] disabled:text-white/90 disabled:cursor-not-allowed hover:-translate-y-1 hover:shadow-[0_8px_20px_-6px_rgba(0,82,204,0.6)] active:scale-95 disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-none'}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 stroke-[2.5] animate-spin text-white/90" />
                {type === "login" ? "Giriş Yapılıyor..." : "Kayıt Yapılıyor..."}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                {type === "login" ? "Doğrula ve Giriş Yap" : "Doğrula ve Üyeliği Tamamla"}
              </>
            )}
          </button>
          <button
            type="button"
            disabled={!isSmsTimeout || isLoading || isResending}
            onClick={() => {
              void (async () => {
                try {
                  setIsResending(true);
                  await AuthService.resendSms({ telefon: apiTelefon, type });
                  toast.success("Yeni SMS kodu gönderildi.");
                  setTimeLeft(270);
                  setSmsKodu("");
                  setIsWrongCode(false);
                } catch (e) {
                  console.error(e);
                  toast.error(e instanceof Error ? e.message : "SMS gönderilemedi.");
                } finally {
                  setIsResending(false);
                }
              })();
            }}
            className={`w-full font-extrabold text-[15px] py-[16.5px] px-4 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center gap-2.5 shadow-sm 
              ${isSmsTimeout && !isLoading && !isResending
                ? "bg-[#ef5a28] hover:bg-[#d94a1d] text-white hover:-translate-y-1 hover:shadow-[0_8px_20px_-6px_rgba(239,90,40,0.6)] active:scale-95" 
                : "bg-[#d2d7df] text-[#6b778c] cursor-not-allowed hover:translate-y-0"}`}
          >
            <MessageSquare className="h-5 w-5 stroke-[2.5]" />
            {isResending ? "SMS Gönderiliyor..." : "Yeni SMS Kodu Gönder"}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onBack}
            className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-[#42526e] hover:text-[#172b4d] font-bold text-[15px] py-[16.5px] px-4 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center gap-2.5 hover:-translate-y-0.5 active:scale-95 shadow-sm mt-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
            Geri Dön
          </button>
        </div>
      </form>
    </div>
  );
}