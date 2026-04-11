import Link from 'next/link';
import {
  ArrowRight, Users, FileText, Package, Wallet, ShieldCheck,
  MapPin, CheckCircle2, MonitorPlay, Activity, BarChart4,
  Building, Phone, Mail, Map, ChevronRight, Layers, Workflow
} from 'lucide-react';
import ScrollToTop from '@/components/ScrollToTop';
import MobileMenu from '@/components/MobileMenu';

/* ==============================================================
   MAIN PAGE
   ============================================================== */
export default function EYonetimLandingPage() {
  const primaryModules = [
    { title: 'e-Puantaj', desc: 'Şube bazlı puantaj, vardiya ve personel devam takibi.', icon: Activity },
    { title: 'e-İK', desc: 'Merkez onaylı insan kaynakları ve personel süreç yönetimi.', icon: Users },
  ];

  const businessModules = [
    { title: 'e-Finans', desc: 'Gelir, gider ve finansal kontrol süreçleri.', icon: Wallet },
    { title: 'e-Evrak', desc: 'Dijital belge, doküman ve evrak akışı yönetimi.', icon: FileText },
    { title: 'e-Lojistik', desc: 'Sevkiyat, saha ve operasyon takibi.', icon: MapPin },
    { title: 'e-Depo', desc: 'Stok, ürün ve envanter kontrolü.', icon: Package },
    { title: 'e-Kasa', desc: 'Kasa, tahsilat ve nakit akışı yönetimi.', icon: BarChart4 },
    { title: 'e-İSG', desc: 'İş sağlığı ve güvenliği süreç takibi.', icon: ShieldCheck },
  ];

  const highlights = [
    'Tek panel yönetim',
    '10+ modüler yapı',
    'Şube → merkez akışı',
    '7/24 bulut erişim',
  ];

  const features = [
    {
      title: 'Tek giriş, tam kontrol',
      desc: 'Şubelerden gelen tüm kayıtları farklı dosyalarla uğraşmadan merkez panelde yönetin.',
      icon: MonitorPlay
    },
    {
      title: 'Gerçek zamanlı görünürlük',
      desc: 'Puantaj, personel ve SGK kayıtlarını anlık görün, onaylayın ve toplu kontrol sağlayın.',
      icon: Activity
    },
    {
      title: 'Onay mekanizması',
      desc: 'Şube işlem başlatır, merkez kontrol eder, onaylar ve resmî süreci yönetir.',
      icon: ShieldCheck
    },
    {
      title: 'Kurumsal ve ölçeklenebilir',
      desc: 'Büyüyen şirketler ve çok şubeli yapılar için düzenli, sade ve sürdürülebilir yapı sunar.',
      icon: Building
    },
  ];

  const steps = [
    { no: '01', title: 'Hesabınızı oluşturun', desc: 'Kurumsal yapınızı tanımlayın ve ilk kullanıcıları sisteme ekleyin.' },
    { no: '02', title: 'Şubeleri ve modülleri tanımlayın', desc: 'İK ile başlayın, ihtiyaç duyduğunuz modülleri sisteme dahil edin.' },
    { no: '03', title: 'Merkezden yönetin', desc: 'Şubelerden gelen kayıtları tek panelden kontrol edin ve süreci yönetin.' },
  ];

  const useCases = [
    { title: 'KOBİ’ler için', desc: 'Dağınık süreçleri tek merkezde toplayarak operasyonel düzen oluşturur.', icon: Building },
    { title: 'Çok şubeli şirketler için', desc: 'Farklı lokasyonlardan gelen verileri standartlaştırır ve merkezde toplar.', icon: Layers },
    { title: 'Hizmet ve üretim firmaları için', desc: 'Personel, depo, evrak ve operasyon akışlarını bir araya getirir.', icon: Package },
  ];

  const branchFlow = [
    { title: 'Şube veri girişi', desc: 'Her şube puantaj, personel hareketi, SGK giriş-çıkış ve talep kayıtlarını kendi ekranından açar.' },
    { title: 'Merkez kontrol havuzu', desc: 'Tüm şubelerden gelen veriler tek merkez panelinde toplanır, filtrelenir ve önceliklendirilir.' },
    { title: 'Onay ve resmî işlem', desc: 'Merkez yönetim kayıtları kontrol eder, onaylar ve resmî süreci standart şekilde ilerletir.' },
  ];

  const approvalItems = [
    'Bekleyen SGK giriş işlemleri',
    'Onay bekleyen çıkış kayıtları',
    'Şube bazlı puantaj kontrolleri',
    'Eksik veya hatalı personel bilgileri',
  ];

  const references = [
    'ABank', 'ABB', 'alBaraka', 'Alternatif Bank', 'Amerikan Hastanesi',
    'Anadolu Etap', 'Anadolu Hayat', 'arvato', 'Arçelik', 'ASAŞ',
    'Assan Alüminyum', 'Axa Sigorta', 'Azercell', 'Barilla', 'Bauhaus',
  ];

  const scenarioSteps = [
    { title: 'Şube kayıt açar', desc: 'Örneğin 20 şubeli bir yapıda her şube kendi puantajını ve SGK işlem kaydını oluşturur.' },
    { title: 'Merkez toplar', desc: 'Admin paneli tüm kayıtları tarih, şube ve işlem tipine göre tek listede toplar.' },
    { title: 'Kontrol eder', desc: 'Eksik girişler, hatalı kayıtlar ve bekleyen onaylar merkez tarafından anında görülür.' },
    { title: 'İşlemi tamamlar', desc: 'Onaylanan kayıtlar resmî süreç için hazırlanır ve standart operasyon akışına alınır.' },
  ];

  const footerCols = {
    kurumsal: ['Hakkımızda', 'Kariyer', 'Blog', 'Basında Biz'],
    urunler: ['Özellikler', 'Fiyatlandırma', 'Entegrasyonlar', 'API Sistemi'],
    destek: ['Yardım Merkezi', 'İletişim', 'Gizlilik Politikası', 'Kullanım Şartları'],
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans selection:bg-[#ef5a28]/20 selection:text-[#ef5a28] overflow-x-hidden relative">
      <ScrollToTop />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl transition-all shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
            <img src="/analogo.svg" alt="E-Yönetim Logo" className="relative h-10 w-auto" />
          </Link>

          <nav className="hidden items-center gap-8 text-[14px] font-bold text-slate-600 md:flex">
            <Link href="#moduller" className="transition hover:text-[#ef5a28] uppercase tracking-wide">Modüller</Link>
            <Link href="#akis" className="transition hover:text-[#ef5a28] uppercase tracking-wide">Akış</Link>
            {/* <Link href="#referanslar" className="transition hover:text-[#ef5a28] uppercase tracking-wide">Referanslar</Link> */}
            <Link href="#iletisim-form" className="transition hover:text-[#ef5a28] uppercase tracking-wide">İletişim</Link>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/uye-ol"
              className="hidden rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#ef5a28]/30 hover:text-[#ef5a28] md:inline-flex"
            >
              Hesap Oluştur
            </Link>
            <Link
              href="/giris"
              className="hidden sm:inline-flex group rounded-full bg-gradient-to-r from-[#ef5a28] to-[#FA4A0C] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-[#ef5a28]/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ef5a28]/30 active:scale-95 border border-[#ef5a28]"
            >
              Giriş Yap
            </Link>
            <MobileMenu />
          </div>
        </div>
      </header>

      <main>
        {/* EXACT HERO SECTION */}
        <section className="relative mx-auto grid max-w-[1400px] gap-8 px-6 pt-16 pb-20 lg:grid-cols-2 lg:px-10 lg:pt-24 lg:pb-32 items-center bg-[#fbfcfb] overflow-hidden">

          {/* Aesthetic SVG Grid & Glow for Hero */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <svg className="absolute w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ef5a28" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridPattern)" />
            </svg>
            {/* Massive Right Top Tech Ring */}
            <svg className="absolute right-0 top-0 opacity-10 translate-x-1/3 -translate-y-1/4" width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="400" cy="400" r="300" stroke="#ef5a28" strokeWidth="60" strokeDasharray="100 50" strokeLinecap="round" />
              <circle cx="400" cy="400" r="380" stroke="#1A1A1A" strokeWidth="10" strokeDasharray="20 40" />
              <circle cx="400" cy="400" r="200" stroke="#00d65b" strokeWidth="2" strokeDasharray="5 5" />
            </svg>
          </div>
          <div className="absolute top-[10%] inset-x-0 -z-10 h-[600px] w-full rounded-full bg-gradient-to-b from-[#ef5a28]/10 to-transparent blur-[80px] pointer-events-none" />

          {/* Hero Content */}
          <div className="flex flex-col justify-center relative z-10 max-w-3xl pr-4">

            <div className="mb-6 inline-flex rounded-full border border-[#ef5a28]/20 bg-[#ef5a28]/5 px-4 py-1.5 text-[12px] font-bold tracking-wide text-[#ef5a28] w-fit">
              Şubeden merkeze tek akışla çalışan işletme yönetim platformu
            </div>

            <h1 className="text-[38px] sm:text-[48px] font-black leading-[1.05] tracking-tight text-[#1a1a1a] md:text-[64px] lg:text-[72px] pb-2">
              Şubeler veriyi girsin. <span className="text-[#ef5a28]">Merkez <br className="hidden lg:block" />tek panelden</span> toplasın, kontrol <br className="hidden lg:block" />etsin ve yönetsin.
            </h1>

            <p className="mt-5 max-w-2xl text-[15px] sm:text-[16.5px] leading-[1.6] text-gray-500 font-medium tracking-tight">
              Şubeler puantaj, personel ve SGK işlem kayıtlarını sisteme girsin; <br className="hidden lg:block" />merkez yönetim tüm verileri tek ekranda toplasın, kontrol etsin, <br className="hidden lg:block" />onaylasın ve resmî süreci yönetsin.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Link
                href="/uye-ol"
                className="group flex justify-center items-center gap-2 rounded-full bg-[#ef5a28] px-8 py-3.5 text-[15px] font-bold text-white shadow-[0_16px_34px_rgba(250,74,12,0.28)] transition-all hover:bg-[#de4f20] hover:-translate-y-1 active:scale-95"
              >
                Ücretsiz Başla
              </Link>
              <Link
                href="#iletisim-form"
                className="flex justify-center items-center rounded-full border border-gray-200 bg-white px-8 py-3.5 text-[15px] font-bold text-gray-800 shadow-sm transition-all hover:bg-gray-50 hover:-translate-y-1 active:scale-95"
              >
                Demo Talep Et
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-[13px] font-bold text-slate-700 shadow-sm text-center">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-12 lg:pt-0 pl-0 lg:pl-4">
            {/* SaaS Dashboard Mockup */}
            <div className="rounded-[24px] bg-white p-3 md:p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.1)] border border-gray-100/80 flex flex-col mx-auto max-w-3xl transform transition-transform hover:-translate-y-1">

              <div className="rounded-[20px] bg-[#1a1a1a] flex flex-col text-white px-6 pt-6 pb-8 shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="text-[11px] text-gray-400 font-bold tracking-wide">Dashboard</div>
                    <div className="text-[18px] md:text-[22px] font-bold tracking-tight text-white mt-1">Merkezi Yönetim Paneli</div>
                  </div>
                  <div className="rounded-full bg-[#ef5a28] px-5 py-2 text-[12px] font-bold text-white shadow-md">
                    Canlı Sistem
                  </div>
                </div>

                <div className="grid gap-4 md:gap-6 md:grid-cols-12 min-h-[340px]">
                  {/* Mockup Sidebar */}
                  <div className="md:col-span-4 flex flex-col gap-2.5">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[#777] mb-1">MODÜLLER</div>
                    {['e-Puantaj', 'e-İK', 'e-Talep', 'e-Evrak', 'e-Finans'].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-2xl px-5 py-3.5 text-[13.5px] font-bold transition-colors ${index === 0 ? 'bg-[#ef5a28] text-white shadow-lg shadow-[#ef5a28]/20' : 'bg-[#2a2a2a] text-[#888] hover:bg-[#333]'
                          }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* Mockup Main Content */}
                  <div className="grid gap-3 md:gap-4 md:col-span-8">
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                      {[
                        ['Açık Talep', '128'],
                        ['Aktif Personel', '452'],
                        ['Bekleyen Onay', '19'],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl bg-white p-4 text-center shadow-sm flex flex-col justify-center min-h-[110px]">
                          <div className="text-[11px] md:text-[12px] font-bold text-gray-500 mb-1 leading-tight">{label}</div>
                          <div className="text-[26px] md:text-[32px] font-black text-slate-900">{value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 md:gap-4 mt-1 md:mt-0 items-stretch">
                      {/* Operasyon Akışı Card */}
                      <div className="rounded-2xl bg-white px-5 py-5 flex flex-col sm:col-span-3">
                        <div className="text-[11px] font-bold text-gray-400 mb-2.5 tracking-wide">Operasyon Akışı</div>
                        <div className="text-[14px] font-bold text-slate-800 leading-snug mb-5">
                          Talep <span className="text-gray-300 mx-1">→</span> Onay <span className="text-gray-300 mx-1">→</span> İşlem <span className="text-gray-300 mx-1">→</span> Rapor
                        </div>
                        <div className="mt-auto bg-[#ef5a28]/10 text-[#ef5a28] rounded-xl px-4 py-3 text-[12px] font-bold w-fit">
                          Tek ekranda kontrol
                        </div>
                      </div>

                      {/* Yetki Alanları Card */}
                      <div className="rounded-2xl bg-[#2a2a2a] p-4 flex flex-col sm:col-span-2 shadow-inner">
                        <div className="text-[11px] font-bold text-gray-400 mb-4 tracking-wide text-center">Yetkili Alanları</div>
                        <div className="grid grid-cols-2 gap-2 text-center h-full">
                          <div className="bg-[#333] rounded-xl flex items-center justify-center text-[11px] font-bold text-gray-200">Yönetici</div>
                          <div className="bg-[#333] rounded-xl flex items-center justify-center text-[11px] font-bold text-gray-200">İK</div>
                          <div className="bg-[#333] rounded-xl flex items-center justify-center text-[11px] font-bold text-gray-200">Operasyon</div>
                          <div className="bg-[#333] rounded-xl flex items-center justify-center text-[11px] font-bold text-gray-200">Rapor</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 md:mt-4 text-center px-2">
                <div className="text-[11px] md:text-[13px] font-bold text-gray-600 rounded-full py-3 px-4 md:px-6 inline-block bg-slate-50 border border-gray-200">
                  Şube verisi • Merkez kontrolü • Resmî süreç yönetimi • Ölçeklenebilir yapı
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BİLGİ KARTLARI (Şubeleri tek merkeze bağlayın vb.) */}
        <section className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10 relative overflow-hidden">
          {/* Decorative Corner SVG */}
          <div className="absolute -left-32 top-10 opacity-[0.06] pointer-events-none rotate-[15deg]">
            <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="200" r="180" fill="none" stroke="#ef5a28" strokeWidth="40" strokeLinecap="round" strokeDasharray="50 100" />
              <circle cx="200" cy="200" r="100" fill="none" stroke="#00d65b" strokeWidth="20" strokeLinecap="round" strokeDasharray="30 80" />
            </svg>
          </div>
          <div className="mx-auto max-w-7xl grid gap-4 md:grid-cols-3 relative z-10">
            {[
              {
                title: 'Şubeleri tek merkeze bağlayın',
                desc: 'Her şubenin ayrı takip yapması yerine tüm kayıtları ortak sistemde toplayın.',
                icon: Layers,
                color: 'text-blue-500',
                bg: 'bg-blue-500/10 border-blue-500/20'
              },
              {
                title: 'Şube kayıtlarını merkezde toplayın',
                desc: 'Puantaj, SGK giriş-çıkış ve personel hareketlerini merkez yönetimin kontrol edebileceği düzene taşıyın.',
                icon: Activity,
                color: 'text-[#ef5a28]',
                bg: 'bg-[#ef5a28]/10 border-[#ef5a28]/20'
              },
              {
                title: 'Sonra tüm operasyonu genişletin',
                desc: 'Finans, evrak, lojistik ve operasyon modüllerini ihtiyaca göre ekleyin.',
                icon: Package,
                color: 'text-[#00d65b]',
                bg: 'bg-[#00d65b]/10 border-[#00d65b]/20'
              },
            ].map((card) => (
              <div key={card.title} className="group rounded-[1.75rem] border border-gray-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-[#ef5a28]/30">
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                  <card.icon className="h-5 w-5 stroke-[2]" />
                </div>
                <h3 className="text-[18px] font-black tracking-tight text-slate-800">{card.title}</h3>
                <p className="mt-2 text-[14px] leading-6 text-slate-600 font-medium">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AKIŞ SECTION */}
        <section id="akis" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 relative">
          <div className="absolute top-10 left-0 w-64 h-64 bg-[#ef5a28]/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="rounded-[2.5rem] bg-white border border-gray-200 shadow-xl p-8 md:p-10 lg:p-14 relative overflow-hidden">

            {/* SVG Modern Dots & Curves */}
            <svg className="absolute top-0 right-0 opacity-[0.03] pointer-events-none" width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="300" cy="100" r="150" stroke="#ef5a28" strokeWidth="40" />
              <path d="M 200 400 Q 300 300 400 200" stroke="#ef5a28" strokeWidth="20" strokeLinecap="round" />
            </svg>

            <div className="max-w-4xl mb-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ef5a28]/10 bg-[#ef5a28]/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#ef5a28]">
                Şube → Merkez Akışı
              </div>
              <h2 className="text-[40px] font-black leading-[1.05] tracking-tight md:text-[54px] text-slate-900">
                Veriyi şubeler girsin, süreci merkez yönetsin.
              </h2>
              <p className="mt-5 max-w-3xl text-[16px] leading-[1.6] text-slate-600 font-medium">
                e-Yönetim’in temel yapısı; dağınık şube operasyonlarını tek merkezde toplamak, kontrol etmek ve resmî işleme hazır hale getirmektir.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3 mb-10">
              {branchFlow.map((item, index) => (
                <div key={item.title} className="rounded-[1.75rem] bg-slate-50 border border-slate-100 p-6 hover:-translate-y-1 transition-transform">
                  <div className="text-[14px] font-black text-[#ef5a28] bg-white w-10 h-10 flex items-center justify-center rounded-xl shadow-sm">0{index + 1}</div>
                  <h3 className="mt-4 text-[18px] font-black tracking-tight text-slate-800">{item.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-slate-600 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Visual Process Flow */}
            <div className="rounded-[2rem] bg-[#1a1a1a] p-6 text-white md:p-8 shadow-xl">
              <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-3">
                  <div className="rounded-[1.5rem] bg-white/5 border border-white/10 p-5">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Şubeler</div>
                    <div className="mt-4 space-y-3 text-[13px] font-bold">
                      <div className="rounded-xl bg-white/10 px-4 py-3 shadow-inner">Şube A</div>
                      <div className="rounded-xl bg-white/10 px-4 py-3 shadow-inner">Şube B</div>
                      <div className="rounded-xl bg-white/10 px-4 py-3 shadow-inner">Şube C</div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="rounded-[1.5rem] bg-gradient-to-r from-[#ef5a28] to-[#FA4A0C] px-4 py-5 text-center text-[14px] font-black text-white shadow-lg shadow-[#ef5a28]/20">
                    Puantaj<br />SGK<br />Personel Kayıtları
                  </div>
                </div>
                <div className="lg:col-span-4">
                  <div className="rounded-[1.5rem] bg-white px-5 py-5 text-slate-900 shadow-[0_10px_30px_rgba(255,255,255,0.1)] border border-gray-100">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Merkez Panel</div>
                    <div className="mt-2 text-[20px] font-black tracking-tight">Kontrol • Onay • Rapor</div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-[12px] font-bold flex items-center justify-center text-center leading-snug">Şube bazlı filtreleme</div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-[12px] font-bold flex items-center justify-center text-center leading-snug">Toplu kontrol ekranı</div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-[12px] font-bold flex items-center justify-center text-center leading-snug">Eksik veri uyarıları</div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-[12px] font-bold flex items-center justify-center text-center leading-snug">Onay geçmişi</div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <div className="rounded-[1.5rem] bg-white/5 border border-white/10 p-5 h-full flex flex-col justify-center">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Çıktı</div>
                    <div className="mt-3 rounded-xl bg-[#00d65b]/20 border border-[#00d65b]/30 px-4 py-4 text-[13px] leading-[1.6] font-bold text-[#00d65b]">
                      Resmî işlemler, standart operasyon akışı ve merkez tarafından yönetilen denetlenebilir süreç yapısı.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BAŞLANGIÇ MODULLERİ SECTION */}
        <section id="moduller" className="relative mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-10 lg:py-32 overflow-hidden">
          {/* Massive Abstract Wave SVG Behind Moduller */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]">
            <svg className="absolute w-full h-full text-[#ef5a28]" preserveAspectRatio="none" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,150 C300,300 600,0 1200,150 L1200,400 L0,400 Z" fill="currentColor" />
              <path d="M0,100 C400,300 800,-50 1200,100" stroke="currentColor" strokeWidth="4" strokeDasharray="10 15" />
              <circle cx="200" cy="150" r="100" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
              <circle cx="1000" cy="250" r="200" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          <div className="mx-auto max-w-7xl grid gap-10 lg:grid-cols-12 items-center relative z-10">
            <div className="max-w-3xl lg:col-span-5">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ef5a28]/20 bg-[#ef5a28]/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ef5a28]">
                Başlangıç Modülleri
              </div>
              <h2 className="text-[32px] sm:text-[40px] font-black leading-[1.1] tracking-tight md:text-[48px] text-slate-800">
                İlk adımı şube-personel akışını merkezileştirerek atın.
              </h2>
              <p className="mt-5 text-[16px] leading-[1.6] text-slate-600 font-medium">
                Şubelerin personel verilerini standart biçimde girdiği, merkezin ise tüm kayıtları tek panelde topladığı çekirdek yapıyla başlayın.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:col-span-7 justify-center">
              {primaryModules.map((module, i) => (
                <div key={module.title} className="group relative rounded-[2rem] border border-gray-200 bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] hover:border-[#ef5a28]/30 overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, rgba(239,90,40,0.05), transparent 60%)' }} />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="rounded-2xl bg-[#ef5a28]/10 px-3 py-2 text-[14px] font-black text-[#ef5a28]">0{i + 1}</div>
                    <div className="rounded-full border border-gray-200 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 bg-white">
                      Çekirdek
                    </div>
                  </div>
                  <h3 className="mt-8 text-[24px] font-black tracking-tight text-slate-800 relative z-10">{module.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-slate-600 font-medium relative z-10">{module.desc}</p>
                  <div className="mt-8 border-t border-gray-100 pt-4 text-[13px] font-bold text-slate-800 flex items-center gap-1 group-hover:text-[#ef5a28] transition-colors relative z-10 w-fit cursor-pointer">
                    Modülü incele <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NEDEN E-YÖNETİM */}
        <section className="bg-[#1a1a1a] py-20 text-white relative overflow-hidden">
          {/* Subtle bg art */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent pointer-events-none"></div>

          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12 lg:px-10 relative z-10">
            <div className="lg:col-span-5">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ef5a28]/20 bg-[#ef5a28]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ef5a28]">
                Neden E-Yönetim
              </div>
              <h2 className="text-[32px] sm:text-[40px] font-black leading-[1.1] tracking-tight md:text-[48px]">
                İş akışını sadeleştiren güçlü yapı.
              </h2>
              <p className="mt-5 max-w-lg text-[16px] leading-[1.6] text-white/70 font-medium">
                Karışık paneller yerine hızlı karar almayı destekleyen, okunabilir ve ölçülebilir bir yönetim deneyimi sunar.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md hover:bg-white/10 transition-colors">
                  <div className="inline-flex rounded-full bg-gradient-to-r from-[#ef5a28] to-[#FA4A0C] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm mb-4">
                    Öne çıkan yapı
                  </div>
                  <h3 className="mt-2 text-[20px] font-black tracking-tight text-white">{feature.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-white/60 font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ONAY MEKANIZMASI */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ef5a28]/20 bg-[#ef5a28]/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ef5a28]">Onay Mekanizması</div>
              <h2 className="text-[32px] sm:text-[40px] font-black leading-[1.1] tracking-tight md:text-[48px]">
                Şubelerin açtığı işlemler merkez onayıyla ilerlesin.
              </h2>
              <p className="mt-5 text-[16px] leading-[1.6] text-slate-600 font-medium">
                e-Yönetim yalnızca veri toplamaz; işlem başlatma, kontrol etme, onaylama ve resmî sürece hazırlama akışını da standartlaştırır.
              </p>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 md:grid-cols-2 h-full">
                  <div className="rounded-[1.5rem] bg-slate-50 border border-slate-100 p-6 flex flex-col">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Merkez işlem havuzu</div>
                    <div className="mt-5 space-y-3 flex-1 flex flex-col justify-center">
                      {approvalItems.map((item) => (
                        <div key={item} className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[13px] font-bold text-slate-800 shadow-sm flex items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#ef5a28] mr-3"></div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] bg-[#1a1a1a] p-6 text-white flex flex-col shadow-inner">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Onay akışı</div>
                    <div className="mt-5 space-y-3 text-[13px] font-bold flex-1 flex flex-col justify-center">
                      <div className="rounded-xl bg-white/10 px-4 py-3 border border-white/5">1. Şube kaydı oluşturur</div>
                      <div className="rounded-xl bg-white/10 px-4 py-3 border border-white/5">2. Merkez kaydı inceler</div>
                      <div className="rounded-xl bg-[#ef5a28] px-4 py-3 text-white shadow-[0_5px_15px_rgba(239,90,40,0.3)]">3. Onaylar veya düzeltme ister</div>
                      <div className="rounded-xl bg-white/10 px-4 py-3 border border-white/5">4. Resmî işlem süreci başlar</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OPERASYON MODÜLLERI */}
        <section className="bg-slate-50 py-20 border-y border-gray-200/50">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12 lg:px-10">
            <div className="lg:col-span-5">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ef5a28]/20 bg-[#ef5a28]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ef5a28] bg-white">Operasyon Modülleri</div>
              <h2 className="text-[32px] sm:text-[40px] font-black leading-[1.1] tracking-tight md:text-[48px] text-slate-900">
                İhtiyacınız arttıkça sisteme yeni katmanlar ekleyin.
              </h2>
              <p className="mt-5 text-[16px] leading-[1.6] text-slate-600 font-medium">
                e-Yönetim yalnızca İK ile sınırlı değildir. Finans, belge, depo ve lojistik akışlarını tek çatı altında toplar.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
              {businessModules.map((module) => (
                <div key={module.title} className="rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-[#ef5a28]/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[18px] font-black tracking-tight text-slate-800">{module.title}</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Modül
                    </span>
                  </div>
                  <p className="text-[14px] leading-6 text-slate-600 font-medium">{module.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REFERANSLAR (Geçici olarak gizlendi)
        <section id="referanslar" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-4 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ef5a28] bg-[#ef5a28]/5 border border-[#ef5a28]/20">Referanslarımız</div>
            <h2 className="text-[32px] sm:text-[40px] font-black leading-[1.1] tracking-tight md:text-[48px] text-slate-900">
              Bizi tercih eden firmalar
            </h2>
            <p className="mt-5 max-w-2xl text-[16px] leading-[1.6] text-slate-600 font-medium">
              Çok şubeli yapılar, merkez operasyon ekipleri ve büyüyen işletmeler için geliştirilen yönetim deneyimi sunuyoruz.
            </p>
          </div>

          <div className="mt-10 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {references.map((item) => (
              <div
                key={item}
                className="flex min-h-[110px] items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-[#ef5a28]/30"
              >
                <span className="text-[16px] font-black tracking-wide text-gray-400 transition-colors hover:text-gray-600">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>
        */}


        {/* NASIL ÇALISIR SECTİON */}
        <section id="nasil" className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="rounded-[2.5rem] bg-white border border-gray-200 shadow-sm p-8 md:p-10 lg:p-14 relative overflow-hidden">
            <svg className="absolute right-0 bottom-0 opacity-5" width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="200" r="150" stroke="#ef5a28" strokeWidth="40" />
              <circle cx="200" cy="200" r="100" stroke="#ef5a28" strokeWidth="20" />
            </svg>

            <div className="max-w-3xl relative z-10">
              <div className="mb-4 inline-block text-[11px] font-bold uppercase tracking-widest text-[#ef5a28] bg-[#ef5a28]/5 border border-[#ef5a28]/20 px-3 py-1 rounded-full">Nasıl Çalışır</div>
              <h2 className="text-[32px] sm:text-[36px] md:text-[48px] font-black leading-[1.1] text-slate-900 tracking-tight">
                Dakikalar içinde başlayın.
              </h2>
              <p className="mt-5 text-[16px] leading-[1.6] text-slate-600 font-medium">
                Şubelerin veri girişi yaptığı, merkezin tüm kayıtları kontrol ettiği yapıyı hızlıca kurun ve süreçleri tek panelde toplamaya başlayın.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 relative z-10 mt-10">
              {steps.map((step) => (
                <div key={step.no} className="rounded-[1.75rem] bg-slate-50 border border-slate-100 p-8 hover:-translate-y-1 transition-transform">
                  <div className="text-[14px] font-black text-[#ef5a28] mb-4 bg-white shadow-sm w-12 h-12 rounded-xl flex items-center justify-center border border-gray-100">{step.no}</div>
                  <h3 className="text-[18px] font-black tracking-tight text-slate-800">{step.title}</h3>
                  <p className="mt-3 text-[14px] leading-[1.6] text-slate-600 font-medium">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GERÇEK KULLANIM SENARYOSU */}
        <section className="relative mx-auto max-w-[1400px] px-6 py-16 lg:px-10 overflow-hidden">
          {/* Tech Dots Background */}
          <div className="absolute top-10 right-10 w-[500px] h-[500px] opacity-[0.08] pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="3" fill="#ef5a28" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#dotGrid)" />
            </svg>
          </div>

          <div className="mx-auto max-w-7xl relative z-10 rounded-[2.5rem] border border-gray-200 bg-white/95 backdrop-blur-xl p-8 md:p-10 lg:p-14 shadow-2xl">
            <div className="max-w-4xl">
              <div className="mb-4 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#ef5a28] bg-[#ef5a28]/5 border border-[#ef5a28]/10 px-3 py-1 rounded-full">Gerçek Kullanım Senaryosu</div>
              <h2 className="text-[32px] sm:text-[36px] md:text-[48px] font-black leading-[1.1] tracking-tight text-slate-900">
                20 şubeli bir yapı için merkezileştirilmiş operasyon akışı.
              </h2>
              <p className="mt-5 text-[16px] leading-[1.6] text-slate-600 font-medium max-w-3xl">
                Çok şubeli firmalarda en büyük sorun verinin farklı kişilerde, farklı dosyalarda ve farklı standartlarda ilerlemesidir. e-Yönetim bunu tek bir merkez akışına dönüştürür.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {scenarioSteps.map((step, index) => (
                <div key={step.title} className="rounded-[1.75rem] bg-slate-50 border border-slate-100 p-6 relative hover:shadow-md transition-shadow">
                  <div className="text-[13px] font-black text-[#ef5a28] mb-4 flex">
                    0{index + 1}
                  </div>
                  <h3 className="text-[16px] font-black tracking-tight text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-[13.5px] leading-[1.6] text-slate-600 font-medium">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HAZIRSANIZ (CTA SECTION) */}
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-10">
          <div className="rounded-[2.5rem] bg-gradient-to-r from-[#ef5a28] to-[#FA4A0C] px-8 py-10 shadow-[0_30px_80px_rgba(250,74,12,0.25)] md:px-12 md:py-16 text-white overflow-hidden relative">
            {/* Abstract pattern inside the card */}
            <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, white 2px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <div className="grid gap-8 lg:grid-cols-12 lg:items-center relative z-10">
              <div className="lg:col-span-8">
                <div className="mb-4 inline-flex px-3 py-1 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm border border-white/20">Hazırsanız</div>
                <h2 className="max-w-3xl text-[32px] sm:text-[36px] font-black leading-[1.1] tracking-tight md:text-[48px]">
                  Şirketinizi tek panelden yönetmeye başlayın.
                </h2>
                <p className="mt-5 max-w-2xl text-[16px] leading-[1.6] text-white/90 font-medium">
                  Şubeler veriyi girsin, merkez yönetsin. İşiniz büyüdükçe e-Yönetim sizinle birlikte büyüsün.
                </p>
              </div>
              <div className="flex flex-col gap-4 lg:col-span-4 lg:items-end">
                <button className="w-full rounded-2xl bg-white px-8 py-4 text-[14px] font-bold text-[#ef5a28] shadow-xl hover:bg-slate-50 transition-all active:scale-95 lg:w-auto">
                  Ücretsiz Başla
                </button>
                <button className="w-full rounded-2xl border-2 border-white/60 px-8 py-4 text-[14px] font-bold text-white hover:bg-white/10 transition-colors lg:w-auto">
                  Demo Talep Et
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* İLETİSİM FORMU EXACT MATCH */}
        <section id="iletisim-form" className="relative border-t border-gray-200 bg-[#f8f9fc] overflow-hidden">
          {/* Massive Tech Data Flow Lines SVG in Background */}
          <div className="absolute top-0 right-[-100px] w-[800px] h-[800px] pointer-events-none opacity-[0.04]">
            <svg viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 800 C400 800, 400 0, 800 0" stroke="#1A1A1A" strokeWidth="8" />
              <path d="M0 600 C400 600, 400 200, 800 200" stroke="#1A1A1A" strokeWidth="12" strokeDasharray="30 30" />
              <path d="M0 400 C400 400, 400 400, 800 400" stroke="#1A1A1A" strokeWidth="4" />
              <circle cx="400" cy="400" r="300" stroke="#1A1A1A" strokeWidth="4" strokeDasharray="15 25" />
              <circle cx="400" cy="400" r="200" stroke="#1A1A1A" strokeWidth="2" />
            </svg>
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-10">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-[32px] sm:text-[40px] font-black leading-[1.1] tracking-tight md:text-[48px]">
                İletişime Geçin
              </h2>
              <p className="mt-5 text-[16px] leading-[1.6] text-slate-600 font-medium">
                Sorularınız için buradayız. Size nasıl yardımcı olabiliriz?
              </p>
            </div>

            <div className="mt-16 grid gap-12 lg:grid-cols-12 bg-white rounded-[2.5rem] border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 sm:p-10 lg:p-12">
              <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-10 lg:pb-0 lg:pr-10">
                <h3 className="text-[24px] font-black tracking-tight text-slate-800">Bizimle İletişime Geçin</h3>
                <div className="mt-10 space-y-10 text-slate-700">
                  <div className="flex gap-4">
                    <div className="bg-[#ef5a28]/10 text-[#ef5a28] shrink-0 p-3 rounded-xl h-fit">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold uppercase tracking-widest text-slate-400">Telefon</div>
                      <div className="mt-1 text-[16px] font-bold text-slate-900">+90 543 713 08 57</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-[#ef5a28]/10 text-[#ef5a28] shrink-0 p-3 rounded-xl h-fit">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold uppercase tracking-widest text-slate-400">E-Posta</div>
                      <div className="mt-1 text-[16px] font-bold text-slate-900">kurumsal@heda.tr</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-[#ef5a28]/10 text-[#ef5a28] shrink-0 p-3 rounded-xl h-fit">
                      <Map className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold uppercase tracking-widest text-slate-400">Adres</div>
                      <div className="mt-1 text-[15px] leading-7 font-bold text-slate-900">
                        Ankara, Türkiye<br />
                        Merkez ofis ve operasyon yönetimi
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 lg:pl-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[13px] font-bold text-slate-600">Ad Soyad</label>
                    <input
                      type="text"
                      placeholder="Adınızı ve soyadınızı giriniz"
                      className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4 text-[14px] font-medium text-slate-900 outline-none transition focus:border-[#ef5a28] focus:bg-white focus:ring-4 focus:ring-[#ef5a28]/10 shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[13px] font-bold text-slate-600">E-Postanız</label>
                    <input
                      type="email"
                      placeholder="E-Posta adresinizi giriniz"
                      className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4 text-[14px] font-medium text-slate-900 outline-none transition focus:border-[#ef5a28] focus:bg-white focus:ring-4 focus:ring-[#ef5a28]/10 shadow-inner"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="mb-2 block text-[13px] font-bold text-slate-600">Konu</label>
                  <input
                    type="text"
                    placeholder="Mesaj konunuzu giriniz"
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4 text-[14px] font-medium text-slate-900 outline-none transition focus:border-[#ef5a28] focus:bg-white focus:ring-4 focus:ring-[#ef5a28]/10 shadow-inner"
                  />
                </div>

                <div className="mt-6">
                  <label className="mb-2 block text-[13px] font-bold text-slate-600">Mesaj</label>
                  <textarea
                    rows={6}
                    placeholder="Mesajınızı yazınız"
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4 text-[14px] font-medium text-slate-900 outline-none transition focus:border-[#ef5a28] focus:bg-white focus:ring-4 focus:ring-[#ef5a28]/10 shadow-inner"
                  />
                </div>

                <div className="mt-8 flex justify-end">
                  <button className="rounded-full bg-[#ef5a28] px-8 py-3.5 text-[14px] font-bold text-white shadow-[0_12px_30px_rgba(250,74,12,0.25)] hover:bg-[#de4f20] hover:-translate-y-0.5 transition-all">
                    Mesaj Gönder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="iletisim" className="bg-[#1a1a1a] text-white relative">
        {/* Footer Abstract Top Border */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-0 transform -translate-y-full">
          <svg className="block w-full h-[30px] md:h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C52.16,105.3,105.21,114.7,158.4,113.8,211.59,112.9,264.78,89.54,321.39,56.44Z" fill="#1a1a1a" />
          </svg>
        </div>

        {/* Subtle Glow */}
        <div className="absolute bottom-0 left-[20%] w-[60%] h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#ef5a28]/10 via-transparent to-transparent pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 relative z-10">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3">
                <img
                  src="/analogo.svg"
                  alt="E-Yönetim beyaz logo"
                  className="h-14 w-auto brightness-0 invert"
                />
              </div>
              <p className="mt-6 max-w-sm text-[16px] leading-7 text-white/70 font-medium">
                Modern insan kaynakları ve merkez operasyon yönetimini tek panelde birleştiren modüler yapı.
              </p>
              <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-5 text-[13px] font-medium leading-6 text-white/50">
                © {new Date().getFullYear()} HEDA Teknoloji Bilişim A.Ş. Tüm hakları saklıdır.
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <div className="text-[14px] font-bold tracking-widest uppercase text-[#ef5a28]">Kurumsal</div>
                  <div className="mt-6 flex flex-col space-y-3">
                    {footerCols.kurumsal.map((item) => (
                      <Link key={item} href="#" className="text-[14px] font-bold text-white/80 hover:text-white transition-colors py-1">
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[14px] font-bold tracking-widest uppercase text-[#ef5a28]">Ürün ve Hizmetlerimiz</div>
                  <div className="mt-6 flex flex-col space-y-3">
                    {footerCols.urunler.map((item) => (
                      <Link key={item} href="#" className="text-[14px] font-bold text-white/80 hover:text-white transition-colors py-1">
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <div className="text-[14px] font-bold tracking-widest uppercase text-[#ef5a28]">Destek</div>
                  <div className="mt-6 flex flex-col space-y-3">
                    {footerCols.destek.map((item) => (
                      <Link key={item} href="#" className="text-[14px] font-bold text-white/80 hover:text-white transition-colors py-1">
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
