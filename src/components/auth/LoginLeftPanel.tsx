import { User, Building2, Globe, ShieldCheck, Blocks } from "lucide-react";
export default function LoginLeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] h-full bg-gradient-to-br from-[#ef5a28] to-[#d94a1d] text-white flex-col items-center justify-between p-12 relative overflow-hidden">
      <div className="z-10 mt-16 flex flex-col items-center text-center animate-slide-left">
        <div className="bg-white/20 p-6 rounded-[2rem] inline-block mb-6 shadow-2xl shadow-[#b13c18]/40 animate-float border border-white/30 backdrop-blur-md">
          <User size={64} className="text-white drop-shadow-md" />
        </div>
        <h1 className="text-[2.75rem] font-extrabold mb-2 tracking-tight drop-shadow-sm">E-Yönetim</h1>
        <p className="text-lg opacity-90 font-medium tracking-wide">Kurumsal Yönetim Paneli</p>
      </div>
      <div className="z-10 grid grid-cols-2 gap-6 w-full max-w-xl mx-auto my-12 animate-slide-left" style={{ animationDelay: "100ms" }}>
        <div className="border border-white/30 rounded-2xl p-6 bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] cursor-default group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-[17px] group-hover:text-white transition-colors text-white/95">Merkezi Yönetim</h3>
          </div>
          <p className="text-[13px] opacity-80 leading-relaxed group-hover:opacity-100 transition-opacity">Şubelerden ve departmanlardan gelen tüm verileri tek merkezden güvenle yönetin.</p>
        </div>
        <div className="border border-white/30 rounded-2xl p-6 bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] cursor-default group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-[17px] group-hover:text-white transition-colors text-white/95">Hızlı Erişim</h3>
          </div>
          <p className="text-[13px] opacity-80 leading-relaxed group-hover:opacity-100 transition-opacity">Personel verilerine ve raporlara dilediğiniz yerden anında erişim sağlayın.</p>
        </div>
        <div className="border border-white/30 rounded-2xl p-6 bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] cursor-default group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-[17px] group-hover:text-white transition-colors text-white/95">Güvenli Altyapı</h3>
          </div>
          <p className="text-[13px] opacity-80 leading-relaxed group-hover:opacity-100 transition-opacity">Verileriniz uçtan uca şifreleme ve güvenlik protokolleri ile korunur.</p>
        </div>
        <div className="border border-white/30 rounded-2xl p-6 bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] cursor-default group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Blocks className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-[17px] group-hover:text-white transition-colors text-white/95">Kolay Entegrasyon</h3>
          </div>
          <p className="text-[13px] opacity-80 leading-relaxed group-hover:opacity-100 transition-opacity">Mevcut sistemlerinizle uyumlu, hızlı ve sorunsuz çalışan yapı.</p>
        </div>
      </div>
      <div className="z-10 border-t border-white/20 w-full max-w-xl pt-6 text-center text-[13px] opacity-70 animate-slide-left" style={{ animationDelay: "200ms" }}>
        <p className="mb-1">E-Yönetim, HEDA Teknoloji Bilişim A.Ş.&apos;nin tescilli ürünüdür.</p>
        <p>© 2025 HEDA Teknoloji Bilişim A.Ş. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}