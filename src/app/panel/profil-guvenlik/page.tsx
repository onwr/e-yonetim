"use client";
import React, { useState, useEffect } from "react";
import { Shield, Key, Bell, ShieldCheck, Lock, Eye, EyeOff, X, Check, RefreshCw, SlidersHorizontal } from "lucide-react";
import { fetchJsonWithError } from "@/lib/fetchJsonWithError";

function RuleItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-[12.5px] ${met ? "text-green-500 font-bold" : "text-gray-500 font-medium"}`}>
      {met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      {text}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button 
      onClick={onChange}
      className={`w-[44px] h-[24px] rounded-full relative transition-colors duration-300 ${checked ? 'bg-[#00cca7]' : 'bg-gray-200'} mx-auto block`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${checked ? 'left-[24px]' : 'left-1'}`} />
    </button>
  );
}

type BildirimTip = { id: number; konu: string; eposta: boolean; sms: boolean; push: boolean };

export default function ProfilGuvenlikPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [ikiAdimliSms, setIkiAdimliSms] = useState(true);
  const [view, setView] = useState<"main" | "sifre-yenile" | "bildirim">("main");
  const [mevcutSifre, setMevcutSifre] = useState("");
  const [yeniSifre, setYeniSifre] = useState("");
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState("");
  const [showMevcut, setShowMevcut] = useState(false);
  const [showYeni, setShowYeni] = useState(false);
  const [showYeniTekrar, setShowYeniTekrar] = useState(false);
  const [smsKodu, setSmsKodu] = useState("");

  const [bildirimler, setBildirimler] = useState<BildirimTip[]>([
    { id: 1, konu: "Abonelik yenileme zamanı geldiğinde", eposta: true, sms: true, push: true },
    { id: 2, konu: "Ödeme başarısız olduğunda", eposta: true, sms: true, push: true },
    { id: 3, konu: "Yeni şube açıldığında", eposta: true, sms: false, push: true },
    { id: 4, konu: "Şube kapatıldığında", eposta: true, sms: false, push: true },
    { id: 5, konu: "Yeni yetkili eklendiğinde", eposta: true, sms: true, push: true },
    { id: 6, konu: "Şube yetkilisi değiştirildiğinde", eposta: true, sms: true, push: true },
    { id: 7, konu: "Ana kullanıcı parolası değiştirildiğinde", eposta: true, sms: true, push: true },
    { id: 8, konu: "Tehlikeli işlem (hesap silme, abonelik iptali) talebi olduğunda", eposta: true, sms: true, push: true },
    { id: 9, konu: "Yeni SGK Giriş talebi oluşturulduğunda", eposta: true, sms: false, push: true },
    { id: 10, konu: "Yeni SGK Çıkış talebi oluşturulduğunda", eposta: true, sms: false, push: true },
    { id: 11, konu: "SGK talebi onaylandığında veya reddedildiğinde", eposta: true, sms: false, push: true },
  ]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetchJsonWithError<{
          preferences?: { twoFactorSms?: boolean; bildirimler?: BildirimTip[] };
        }>("/api/v1/me/security");
        if (res?.preferences?.twoFactorSms !== undefined) setIkiAdimliSms(res.preferences.twoFactorSms);
        if (Array.isArray(res?.preferences?.bildirimler) && res.preferences.bildirimler.length > 0) {
          setBildirimler(res.preferences.bildirimler);
        }
      } catch {
        /* varsayilan state */
      }
      setIsLoaded(true);
    })();
  }, []);

  const triggerToast = () => {
    setShowToast(false);
    setTimeout(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }, 50);
  };

  const persistSecurity = async (nextIki: boolean, nextBildirimler: BildirimTip[]) => {
    await fetchJsonWithError("/api/v1/me/security", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ twoFactorSms: nextIki, bildirimler: nextBildirimler }),
    });
  };

  const handleIkiAdimliToggle = () => {
    const newValue = !ikiAdimliSms;
    setIkiAdimliSms(newValue);
    void persistSecurity(newValue, bildirimler).then(() => triggerToast());
  };

  const toggleBildirim = (id: number, type: 'eposta' | 'sms' | 'push') => {
    setBildirimler((prev: BildirimTip[]) => {
      const next = prev.map((b: BildirimTip) => b.id === id ? { ...b, [type]: !b[type] } : b);
      void persistSecurity(ikiAdimliSms, next).then(() => triggerToast());
      return next;
    });
  };

  const toggleAll = (type: 'eposta' | 'sms' | 'push', value: boolean) => {
    setBildirimler((prev: BildirimTip[]) => {
      const next = prev.map((b: BildirimTip) => ({ ...b, [type]: value }));
      void persistSecurity(ikiAdimliSms, next).then(() => triggerToast());
      return next;
    });
  };

  const rules = {
    length: yeniSifre.length >= 8,
    lowercase: /[a-zıöçşğü]/.test(yeniSifre),
    special: /[@$!%*?&._-]/.test(yeniSifre),
    uppercase: /[A-ZİÖÇŞĞÜ]/.test(yeniSifre),
    number: /[0-9]/.test(yeniSifre)
  };
  const allRulesMet = rules.length && rules.lowercase && rules.special && rules.uppercase && rules.number;

  const [sifreHata, setSifreHata] = useState("");
  const [sifreSuccess, setSifreSuccess] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [smsSending, setSmsGonderiliyor] = useState(false);
  const [sifreGuncelleniyor, setSifreGuncelleniyor] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Adım 1: SMS Gönder
  const handleSmsSend = async () => {
    setSifreHata("");
    if (!mevcutSifre || !yeniSifre || yeniSifre !== yeniSifreTekrar) {
      setSifreHata("Şifre alanlarını eksiksiz ve doğru doldurunuz.");
      return;
    }
    if (!allRulesMet) {
      setSifreHata("Şifre tüm kuralları karşılamalıdır.");
      return;
    }
    setSmsGonderiliyor(true);
    try {
      await fetchJsonWithError("/api/v1/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: mevcutSifre, newPassword: yeniSifre }),
      });
      setSmsSent(true);
      setSmsKodu("");
      setCountdown(300); // 5 dakika geri sayım
    } catch (e) {
      setSifreHata(e instanceof Error ? e.message : "SMS gönderilemedi.");
    } finally {
      setSmsGonderiliyor(false);
    }
  };

  // Adım 2: Kodu doğrula + şifreyi değiştir
  const handleGuncelle = async () => {
    setSifreHata("");
    setSifreSuccess(false);
    if (!smsKodu || smsKodu.length < 6) {
      setSifreHata("Lütfen 6 haneli SMS kodunu giriniz.");
      return;
    }
    setSifreGuncelleniyor(true);
    try {
      await fetchJsonWithError("/api/v1/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smsKodu }),
      });
      setSifreSuccess(true);
      setTimeout(() => {
        setView("main");
        setMevcutSifre(""); setYeniSifre(""); setYeniSifreTekrar(""); setSmsKodu("");
        setSifreSuccess(false); setSmsSent(false); setCountdown(0);
      }, 1500);
    } catch (e) {
      setSifreHata(e instanceof Error ? e.message : "Şifre güncellenemedi.");
    } finally {
      setSifreGuncelleniyor(false);
    }
  };

  if (!isLoaded) return (
    <div className="w-full h-[calc(100vh-140px)] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-gray-100 border-t-[#0052cc] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6">
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes scaleIn { 0%{opacity:0;transform:scale(0.97)} 100%{opacity:1;transform:scale(1)} }
        .animate-scale-in { animation: scaleIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}} />
      <div className={`w-full ${view === 'bildirim' ? 'max-w-[1000px]' : 'max-w-[900px]'} transition-all animate-scale-in`}>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          
          {view === "main" ? (
            <>
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 bg-[#172b4d] rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-[18px] font-extrabold text-[#172b4d] mb-1">Güvenlik Ayarları</h1>
                  <p className="text-[13px] font-medium text-gray-500 leading-relaxed max-w-[600px]">
                    Hesabınızın güvenliğini artırmak için 2 adımlı doğrulamayı yönetin. Ayrıca şifre yenileme ve bildirim tercihleri alanlarına bu ekrandan hızlıca erişebilirsiniz.
                  </p>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between mb-4 ${ikiAdimliSms ? 'border-[#ef5a28] bg-orange-50/30' : 'border-gray-200 bg-gray-50/50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${ikiAdimliSms ? 'bg-[#ef5a28]' : 'bg-gray-300'}`}>
                    <ShieldCheck className="w-[22px] h-[22px] text-white stroke-[2]" />
                  </div>
                  <div>
                    <div className="text-[15px] font-extrabold text-[#172b4d] tracking-tight">2 Adımlı SMS Doğrulama</div>
                    <div className="text-[13px] font-medium text-gray-500 mt-0.5">Her girişte SMS kodu ile doğrulama yapılmaktadır.</div>
                  </div>
                </div>
                <button 
                  onClick={() => setIkiAdimliSms(!ikiAdimliSms)}
                  className={`w-[52px] h-[28px] rounded-full relative transition-colors duration-300 shrink-0 ${ikiAdimliSms ? 'bg-[#ef5a28]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${ikiAdimliSms ? 'left-[28px]' : 'left-1'}`} />
                </button>
              </div>

              {!ikiAdimliSms && (
                <div className="bg-[#f0f5ff] rounded-xl p-4 mb-8 border border-[#d6e4ff]">
                  <p className="text-[12px] font-bold text-[#0052cc]">
                    <span className="font-extrabold">Bilgi:</span> 2 adımlı doğrulama kapalıyken hesabınıza sadece şifrenizle giriş yapılabilir. Güvenliğiniz için bu özelliği açık tutmanızı öneririz.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
                <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-start gap-3.5 mb-5">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                      <Key className="w-5 h-5 text-[#ef5a28] stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-extrabold text-[#172b4d]">Şifre Yenileme</h3>
                      <p className="text-[12.5px] font-medium text-gray-500 mt-1">Parolanızı güncelleyin ve hesap güvenliğinizi güçlendirin.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setView("sifre-yenile")}
                    className="bg-[#172b4d] hover:bg-[#091e42] text-white text-[12.5px] font-extrabold px-5 py-2.5 rounded-xl transition-colors active:scale-95 shadow-sm"
                  >
                    Şifreyi Yenile
                  </button>
                </div>

                <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-start gap-3.5 mb-5">
                    <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5 text-cyan-500 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-extrabold text-[#172b4d]">Bildirim Tercihleri</h3>
                      <p className="text-[12.5px] font-medium text-gray-500 mt-1">E-posta, SMS ve push bildirim tercihlerinizi yönetin.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setView("bildirim")}
                    className="bg-[#172b4d] hover:bg-[#091e42] text-white text-[12.5px] font-extrabold px-5 py-2.5 rounded-xl transition-colors active:scale-95 shadow-sm"
                  >
                    Bildirimleri Yönet
                  </button>
                </div>
              </div>
            </>
          ) : view === "sifre-yenile" ? (
            <div className="relative animate-scale-in">
              <button 
                onClick={() => setView("main")} 
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors border border-gray-200"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
              
              <div className="flex items-start gap-4 mb-8">
                <div className="w-14 h-14 bg-[#172b4d] rounded-3xl flex items-center justify-center shrink-0 shadow-sm">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-[19px] font-extrabold text-[#172b4d] mb-1">Parolanızı Güncelleyin</h1>
                  <p className="text-[13px] font-medium text-gray-500 leading-relaxed max-w-[700px]">
                    Güvenliğiniz için şifrenizi düzenli aralıklarla güncellemeniz önerilir. Parola yenileme işlemi, hesabınızın yetkisiz erişimlere karşı korunmasına yardımcı olur. 
                    <br/>Yeni parolanız, aşağıdaki kuralların tamamını sağlamalıdır.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-extrabold text-[#172b4d]">Mevcut Şifre</label>
                  <div className="relative">
                    <input 
                      type={showMevcut ? "text" : "password"} 
                      value={mevcutSifre} onChange={e => setMevcutSifre(e.target.value)}
                      placeholder="Mevcut şifrenizi giriniz"
                      className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-[13px] font-medium text-[#172b4d] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"
                    />
                    <button type="button" onClick={() => setShowMevcut(!showMevcut)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showMevcut ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-extrabold text-[#172b4d]">Yeni Şifre</label>
                  <div className="relative">
                    <input 
                      type={showYeni ? "text" : "password"} 
                      value={yeniSifre} onChange={e => setYeniSifre(e.target.value)}
                      placeholder="Güçlü şifrenizi giriniz"
                      className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-[13px] font-medium text-[#172b4d] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"
                    />
                    <button type="button" onClick={() => setShowYeni(!showYeni)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showYeni ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-extrabold text-[#172b4d]">Yeni Şifreyi Tekrarla</label>
                  <div className="relative">
                    <input 
                      type={showYeniTekrar ? "text" : "password"} 
                      value={yeniSifreTekrar} onChange={e => setYeniSifreTekrar(e.target.value)}
                      placeholder="Yeni şifrenizi tekrar giriniz"
                      className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-[13px] font-medium text-[#172b4d] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"
                    />
                    <button type="button" onClick={() => setShowYeniTekrar(!showYeniTekrar)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showYeniTekrar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-100 mb-8">
                <span className="text-[10.5px] font-extrabold text-gray-400 uppercase tracking-widest block mb-4">ŞİFRE KURALLARI</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                  <RuleItem met={rules.length} text="En az 8 karakter" />
                  <RuleItem met={rules.uppercase} text="Büyük harf" />
                  <RuleItem met={rules.lowercase} text="Küçük harf" />
                  <RuleItem met={rules.number} text="Rakam" />
                  <RuleItem met={rules.special} text="Özel karakter (@$!%*?& vb.)" />
                </div>
              </div>

              {/* SMS Doğrulama Bölümü */}
              <div className="flex flex-col gap-3">
                {!smsSent ? (
                  /* Adım 1: SMS gönder butonu */
                  <button
                    onClick={() => void handleSmsSend()}
                    disabled={!allRulesMet || !mevcutSifre || yeniSifre !== yeniSifreTekrar || smsSending}
                    className="w-full py-3 rounded-xl font-extrabold text-[13px] flex items-center justify-center gap-2 transition-all shadow-sm disabled:cursor-not-allowed"
                    style={allRulesMet && mevcutSifre && yeniSifre === yeniSifreTekrar && !smsSending
                      ? { backgroundColor: "#0052cc", color: "white", boxShadow: "0 2px 10px rgba(0,82,204,0.3)" }
                      : { backgroundColor: "#e2e6ea", color: "#8993a4" }}
                  >
                    {smsSending ? (
                      <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />SMS Gönderiliyor...</>
                    ) : (
                      <><Bell className="w-4 h-4" />SMS Doğrulama Kodu Gönder</>
                    )}
                  </button>
                ) : (
                  /* Adım 2: Kod girişi + doğrula */
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                      <Bell className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <p className="text-[12.5px] font-semibold text-blue-700">
                        Kayıtlı telefon numaranıza 6 haneli doğrulama kodu gönderildi.
                        {countdown > 0 && <span className="ml-1 font-extrabold text-blue-900">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")} kaldı</span>}
                      </p>
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap gap-3">
                      <div className="relative flex-1 min-w-[200px]">
                        <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#172b4d]" />
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={smsKodu}
                          onChange={e => setSmsKodu(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="6 Haneli Kod"
                          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-[14px] font-extrabold text-[#172b4d] outline-none focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/10 transition-all placeholder-gray-400 tracking-[0.2em]"
                        />
                      </div>
                      <button
                        onClick={() => void handleGuncelle()}
                        disabled={smsKodu.length < 6 || sifreGuncelleniyor}
                        className="flex-1 min-w-[160px] py-3 rounded-xl font-extrabold text-[13px] flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
                        style={smsKodu.length === 6 && !sifreGuncelleniyor
                          ? { backgroundColor: "#22c55e", color: "white", boxShadow: "0 2px 10px rgba(34,197,94,0.3)" }
                          : { backgroundColor: "#e2e6ea", color: "#8993a4" }}
                      >
                        {sifreGuncelleniyor ? (
                          <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Güncelleniyor...</>
                        ) : sifreSuccess ? (
                          <><Check className="w-4 h-4" />Güncellendi ✓</>
                        ) : (
                          <><Check className="w-4 h-4" />Şifreyi Güncelle</>
                        )}
                      </button>
                      <button
                        onClick={() => { setSmsSent(false); setCountdown(0); setSmsKodu(""); }}
                        disabled={countdown > 270}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 font-extrabold text-[12px] rounded-xl transition-colors flex items-center gap-2 flex-shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />Tekrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {sifreHata && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] font-semibold text-red-600">{sifreHata}</div>
              )}
              {sifreSuccess && (
                <div className="mt-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-[13px] font-semibold text-green-600">✓ Şifreniz başarıyla güncellendi. Ana sayfaya yönlendiriliyorsunuz...</div>
              )}
            </div>

          ) : (
            <div className="relative animate-scale-in">
              <button 
                onClick={() => setView("main")} 
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors border border-gray-200"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
              
              <div className="flex items-start gap-4 mb-8">
                <div className="w-14 h-14 bg-[#172b4d] rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <SlidersHorizontal className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-[19px] font-extrabold text-[#172b4d] mb-1">Bildirim Tercihleri</h1>
                  <p className="text-[13px] font-medium text-gray-500 leading-relaxed">
                    Hesabınızla ilgili önemli gelişmelerden zamanında haberdar olabilmeniz için bildirim tercihlerinizi özelleştirebilirsiniz. E-posta, SMS ve push bildirimleri aracılığıyla abonelik işlemleri, güvenlik uyarıları ve sistem duyuruları hakkında bilgilendirme alabilirsiniz.
                    <br/><span className="inline-block mt-0.5">Tercihleriniz değiştirildiği anda <strong className="font-extrabold text-[#172b4d]">otomatik olarak kaydedilir.</strong></span>
                  </p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm mt-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f4f5f7]">
                      <th className="py-4 px-6 text-[13px] font-bold text-[#172b4d] w-[60px] text-center border-b border-gray-200">#</th>
                      <th className="py-4 px-6 text-[13px] font-bold text-[#172b4d] border-b border-gray-200">Bildirim Konusu</th>
                      <th className="py-4 px-6 text-[13px] font-bold text-[#172b4d] w-[140px] text-center border-b border-gray-200">E-Posta</th>
                      <th className="py-4 px-6 text-[13px] font-bold text-[#172b4d] w-[140px] text-center border-b border-gray-200">SMS</th>
                      <th className="py-4 px-6 text-[13px] font-bold text-[#172b4d] w-[140px] text-center border-b border-gray-200">Push</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bildirimler.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-5 px-6 text-[13px] font-extrabold text-[#172b4d] text-center">{b.id}</td>
                        <td className="py-5 px-6 text-[13.5px] font-semibold text-[#253858]">{b.konu}</td>
                        <td className="py-5 px-6 text-center">
                          <ToggleSwitch checked={b.eposta} onChange={() => toggleBildirim(b.id, 'eposta')} />
                        </td>
                        <td className="py-5 px-6 text-center">
                          <ToggleSwitch checked={b.sms} onChange={() => toggleBildirim(b.id, 'sms')} />
                        </td>
                        <td className="py-5 px-6 text-center">
                          <ToggleSwitch checked={b.push} onChange={() => toggleBildirim(b.id, 'push')} />
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#fafbfc] border-t-2 border-gray-100">
                      <td colSpan={2} className="py-5 px-6 border-r border-gray-100">
                        <span className="text-[12px] font-bold text-red-500">* Değişiklikler anında kaydedilir. Kanalları buralardan topluca açıp kapatabilirsiniz.</span>
                      </td>
                      <td className="py-5 px-6 text-center border-r border-gray-100">
                        <ToggleSwitch 
                          checked={bildirimler.every(b => b.eposta)} 
                          onChange={() => {
                            const isAllEposta = bildirimler.every(b => b.eposta);
                            toggleAll('eposta', !isAllEposta);
                          }}
                        />
                      </td>
                      <td className="py-5 px-6 text-center border-r border-gray-100">
                        <ToggleSwitch 
                          checked={bildirimler.every(b => b.sms)} 
                          onChange={() => {
                            const isAllSms = bildirimler.every(b => b.sms);
                            toggleAll('sms', !isAllSms);
                          }}
                        />
                      </td>
                      <td className="py-5 px-6 text-center">
                        <ToggleSwitch 
                          checked={bildirimler.every(b => b.push)} 
                          onChange={() => {
                            const isAllPush = bildirimler.every(b => b.push);
                            toggleAll('push', !isAllPush);
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-8 right-8 bg-[#172b4d] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3.5 border border-white/10 z-[100] animate-scale-in">
          <div className="w-7 h-7 bg-[#00cca7] rounded-full flex items-center justify-center shrink-0 shadow-sm">
            <Check className="w-4 h-4 text-white stroke-[3]" />
          </div>
          <div>
            <div className="text-[13px] font-extrabold text-white leading-tight">Tercihler Kaydedildi</div>
            <div className="text-[11.5px] font-medium text-gray-400 mt-0.5">Değişiklik anında sayfaya uygulandı.</div>
          </div>
        </div>
      )}

    </div>
  );
}
