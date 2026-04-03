"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, MessageSquare, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthService } from "@/services/auth.service";
export default function RegistrationForm({ onSuccess }: { onSuccess: (data: { telefon: string, adSoyad: string, tckn: string, eposta: string, firmaKodu?: string, smsBypassed?: boolean }) => void }) {
  const router = useRouter();
  const [adSoyad, setAdSoyad] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tckn, settckn] = useState("");
  const [eposta, setEposta] = useState("");
  const [telefon, setTelefon] = useState("");
  const [sifre, setSifre] = useState("");
  const [kvkkOnay, setKvkkOnay] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleTcChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 11) {
      settckn(val);
    }
  };
  const handleTelefonChange = (e: ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 10) input = input.slice(0, 10);
    let formatted = "";
    if (input.length > 0) formatted += `(${input.slice(0, 3)}`;
    if (input.length >= 4) formatted += `) ${input.slice(3, 6)}`;
    if (input.length >= 7) formatted += ` ${input.slice(6, 8)}`;
    if (input.length >= 9) formatted += ` ${input.slice(8, 10)}`;
    setTelefon(formatted);
  };
  const minLength = sifre.length >= 8;
  const hasUpper = /[A-Z]/.test(sifre);
  const hasLower = /[a-z]/.test(sifre);
  const hasNumber = /[0-9]/.test(sifre);
  const hasSpecial = /[@$!%*?&]/.test(sifre);
  const isFormValid = adSoyad.trim().length > 0 && tckn.length === 11 && eposta.includes('@') && telefon.length === 15 && minLength && hasUpper && hasLower && hasNumber && hasSpecial && kvkkOnay;
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;
    setIsLoading(true);
    try {
      const response = await AuthService.register({ adSoyad, tckn, eposta, telefon, sifre, kvkkOnay });
      if (response.success) {
        toast.success("Kayıt başarılı. SMS doğrulama adımına geçiliyor.");
        onSuccess({ telefon: response.telefon, adSoyad, tckn, eposta, firmaKodu: response.firmaKodu, smsBypassed: response.smsBypassed });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Kayıt başarısız oldu.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form className="space-y-4 animate-slide-left w-full" onSubmit={handleSubmit}>
      <div className="group">
        <label className="block text-sm font-semibold text-[#42526e] mb-1.5 transition-colors group-focus-within:text-[#ef5a28]">
          Ad Soyad <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <User className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-[#ef5a28] transition-colors" />
          </div>
          <input 
            type="text" 
            value={adSoyad} 
            onChange={(e) => setAdSoyad(e.target.value)} 
            placeholder="Ad Soyad"
            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#ef5a28]/15 focus:border-[#ef5a28] text-[15px] outline-none transition-all duration-300 shadow-sm hover:border-gray-300 focus:bg-white bg-gray-50/50 text-[#172b4d]"
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-400 font-medium">Zorunlu Alan</p>
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-[#42526e] mb-1.5 transition-colors group-focus-within:text-[#ef5a28]">
          T.C. Kimlik No <span className="text-red-500">*</span>
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
            placeholder="11 Haneli TCKN"
            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#ef5a28]/15 focus:border-[#ef5a28] text-[15px] outline-none transition-all duration-300 shadow-sm hover:border-gray-300 focus:bg-white bg-gray-50/50 text-[#172b4d]"
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-400 font-medium">Zorunlu Alan</p>
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-[#42526e] mb-1.5 transition-colors group-focus-within:text-[#ef5a28]">
          E-Posta Adresi <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Mail className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-[#ef5a28] transition-colors" />
          </div>
          <input 
            type="email" 
            value={eposta} 
            onChange={(e) => setEposta(e.target.value)} 
            placeholder="ornek@mail.com"
            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#ef5a28]/15 focus:border-[#ef5a28] text-[15px] outline-none transition-all duration-300 shadow-sm hover:border-gray-300 focus:bg-white bg-gray-50/50 text-[#172b4d]"
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-400 font-medium">Zorunlu Alan</p>
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-[#42526e] mb-1.5 transition-colors group-focus-within:text-[#ef5a28]">
          Telefon No <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Phone className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-[#ef5a28] transition-colors" />
          </div>
          <input 
            type="tel" 
            value={telefon} 
            onChange={handleTelefonChange} 
            placeholder="(555) 555 55 55"
            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#ef5a28]/15 focus:border-[#ef5a28] text-[15px] outline-none transition-all duration-300 shadow-sm hover:border-gray-300 focus:bg-white bg-gray-50/50 text-[#172b4d]"
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-400 font-medium">Zorunlu Alan</p>
      </div>
      <div className="group">
        <label className="block text-sm font-semibold text-[#42526e] mb-1.5 transition-colors group-focus-within:text-[#ef5a28]">
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
            placeholder="Güçlü şifrenizi giriniz"
            className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#ef5a28]/15 focus:border-[#ef5a28] text-[15px] outline-none transition-all duration-300 shadow-sm hover:border-gray-300 focus:bg-white bg-gray-50/50 text-[#172b4d]"
          />
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
            <div className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
              {showPassword ? <EyeOff className="h-[18px] w-[18px] text-gray-500" /> : <Eye className="h-[18px] w-[18px] text-gray-500" />}
            </div>
          </div>
        </div>
        <p className="mt-1.5 text-xs text-gray-400 font-medium">Zorunlu Alan</p>
      </div>
      <div className="bg-[#f8f9fb] border border-gray-100 rounded-xl p-5 mt-2 transition-all duration-300 hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.03)] hover:border-gray-200 cursor-default group">
        <p className="text-[11px] font-bold text-[#42526e] mb-3 tracking-wider group-hover:text-[#ef5a28] transition-colors">ŞİFRE KURALLARI</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-2 text-[13px]">
          <div className={`flex items-center gap-2 transition-colors duration-300 ${minLength ? 'text-green-600' : 'text-[#8b9bb4]'}`}>
            {minLength ? <CheckCircle2 className="h-4 w-4 text-green-500 drop-shadow-sm" /> : <X className="h-4 w-4 stroke-[2.5]" />}
            <span className={minLength ? 'font-medium' : ''}>En az 8 karakter</span>
          </div>
          <div className={`flex items-center gap-2 transition-colors duration-300 ${hasUpper ? 'text-green-600' : 'text-[#8b9bb4]'}`}>
            {hasUpper ? <CheckCircle2 className="h-4 w-4 text-green-500 drop-shadow-sm" /> : <X className="h-4 w-4 stroke-[2.5]" />}
            <span className={hasUpper ? 'font-medium' : ''}>Büyük harf</span>
          </div>
          <div className={`flex items-center gap-2 transition-colors duration-300 ${hasLower ? 'text-green-600' : 'text-[#8b9bb4]'}`}>
            {hasLower ? <CheckCircle2 className="h-4 w-4 text-green-500 drop-shadow-sm" /> : <X className="h-4 w-4 stroke-[2.5]" />}
            <span className={hasLower ? 'font-medium' : ''}>Küçük harf</span>
          </div>
          <div className={`flex items-center gap-2 transition-colors duration-300 ${hasNumber ? 'text-green-600' : 'text-[#8b9bb4]'}`}>
            {hasNumber ? <CheckCircle2 className="h-4 w-4 text-green-500 drop-shadow-sm" /> : <X className="h-4 w-4 stroke-[2.5]" />}
            <span className={hasNumber ? 'font-medium' : ''}>Rakam</span>
          </div>
          <div className={`flex items-center gap-2 transition-colors duration-300 ${hasSpecial ? 'text-green-600' : 'text-[#8b9bb4]'}`}>
            {hasSpecial ? <CheckCircle2 className="h-4 w-4 text-green-500 drop-shadow-sm" /> : <X className="h-4 w-4 stroke-[2.5]" />}
            <span className={hasSpecial ? 'font-medium' : ''}>Özel karakter (@$!%*?& vb.)</span>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-4 mt-7 mb-4 group cursor-pointer" onClick={() => setKvkkOnay(!kvkkOnay)}>
        <div className="flex mt-0.5">
          <input 
            type="checkbox" 
            checked={kvkkOnay}
            onChange={(e) => setKvkkOnay(e.target.checked)}
            className="h-5 w-5 text-[#303f9f] focus:ring-[#303f9f] border-gray-400 rounded transition-all duration-300 cursor-pointer shadow-sm group-hover:border-[#303f9f]"
          />
        </div>
        <div className="text-[14px] leading-relaxed select-none">
          <p className="text-[#42526e]">
            <span className="font-semibold text-[#0a2f8c] group-hover:text-[#000080] transition-colors underline-offset-2 group-hover:underline">Kullanım Şartları</span> ve <span className="font-semibold text-[#0a2f8c] group-hover:text-[#000080] transition-colors underline-offset-2 group-hover:underline">KVKK Aydınlatma Metni</span>&apos;ni okudum ve kabul ediyorum.
          </p>
        </div>
      </div>
      <div className="pt-2"></div>
      <div className="flex flex-col gap-4 w-full mt-2 pb-6">
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full bg-[#0052cc] hover:bg-[#0747a6] text-white font-extrabold text-[17px] py-[18px] px-4 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center gap-2.5 disabled:bg-[#d2d7df] disabled:text-white/80 disabled:cursor-not-allowed hover:-translate-y-1 hover:shadow-[0_8px_20px_-6px_rgba(0,82,204,0.6)] active:scale-95 active:translate-y-0 disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-none shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-[22px] w-[22px] stroke-[2.5] animate-spin" />
              Kayıt Yapılıyor...
            </>
          ) : (
            <>
              <MessageSquare className="h-[22px] w-[22px] stroke-[2.5]" />
              Kayıt Ol
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push("/giris")}
          className="w-full bg-[rgb(0,214,91)] hover:bg-[#00c050] text-white font-extrabold text-[17px] py-[18px] px-4 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center gap-2.5 shadow-[0_8px_20px_-6px_rgba(0,214,91,0.4)] hover:-translate-y-1 hover:shadow-[0_12px_24px_-6px_rgba(0,214,91,0.6)] active:scale-95 active:translate-y-0"
        >
          <CheckCircle2 className="h-[22px] w-[22px] stroke-[2.5]" />
          Giriş Yap
        </button>
      </div>
    </form>
  );
}
