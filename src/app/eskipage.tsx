export default function EYonetimLandingPage() {
    const primaryModules = [
        { title: 'e-Puantaj', desc: 'Şube bazlı puantaj, vardiya ve personel devam takibi.' },
        { title: 'e-İK', desc: 'Merkez onaylı insan kaynakları ve personel süreç yönetimi.' },
    ];

    const businessModules = [
        { title: 'e-Finans', desc: 'Gelir, gider ve finansal kontrol süreçleri.' },
        { title: 'e-Evrak', desc: 'Dijital belge, doküman ve evrak akışı yönetimi.' },
        { title: 'e-Lojistik', desc: 'Sevkiyat, saha ve operasyon takibi.' },
        { title: 'e-Depo', desc: 'Stok, ürün ve envanter kontrolü.' },
        { title: 'e-Kasa', desc: 'Kasa, tahsilat ve nakit akışı yönetimi.' },
        { title: 'e-İSG', desc: 'İş sağlığı ve güvenliği süreç takibi.' },
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
        },
        {
            title: 'Gerçek zamanlı görünürlük',
            desc: 'Puantaj, personel ve SGK kayıtlarını anlık görün, onaylayın ve toplu kontrol sağlayın.',
        },
        {
            title: 'Onay mekanizması',
            desc: 'Şube işlem başlatır, merkez kontrol eder, onaylar ve resmî süreci yönetir.',
        },
        {
            title: 'Kurumsal ve ölçeklenebilir',
            desc: 'Büyüyen şirketler ve çok şubeli yapılar için düzenli, sade ve sürdürülebilir yapı sunar.',
        },
    ];

    const steps = [
        { no: '01', title: 'Hesabınızı oluşturun', desc: 'Kurumsal yapınızı tanımlayın ve ilk kullanıcıları sisteme ekleyin.' },
        { no: '02', title: 'Şubeleri ve modülleri tanımlayın', desc: 'İK ile başlayın, ihtiyaç duyduğunuz modülleri sisteme dahil edin.' },
        { no: '03', title: 'Merkezden yönetin', desc: 'Şubelerden gelen kayıtları tek panelden kontrol edin ve süreci yönetin.' },
    ];

    const useCases = [
        { title: 'KOBİ’ler için', desc: 'Dağınık süreçleri tek merkezde toplayarak operasyonel düzen oluşturur.' },
        { title: 'Çok şubeli şirketler için', desc: 'Farklı lokasyonlardan gelen verileri standartlaştırır ve merkezde toplar.' },
        { title: 'Hizmet ve üretim firmaları için', desc: 'Personel, depo, evrak ve operasyon akışlarını bir araya getirir.' },
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
        'ABank',
        'ABB',
        'alBaraka',
        'Alternatif Bank',
        'Amerikan Hastanesi',
        'Anadolu Etap',
        'Anadolu Hayat',
        'arvato',
        'Arçelik',
        'ASAŞ',
        'Assan Alüminyum',
        'Axa Sigorta',
        'Azercell',
        'Barilla',
        'Bauhaus',
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
        <div
            className="min-h-screen bg-[#f6f4f1] text-neutral-950"
            style={{ fontFamily: "'Inter Tight', Inter, ui-sans-serif, system-ui, sans-serif" }}
        >
            <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f6f4f1]/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
                    <div className="flex items-center gap-3">
                        <img
                            src="/mnt/data/e-Yönetim Turuncu SVG Logo.svg"
                            alt="E-Yönetim logo"
                            className="h-11 w-auto"
                        />
                    </div>

                    <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
                        <a href="#moduller" className="transition hover:text-neutral-950">Modüller</a>
                        <a href="#akis" className="transition hover:text-neutral-950">Akış</a>
                        <a href="#referanslar" className="transition hover:text-neutral-950">Referanslar</a>
                        <a href="#iletisim-form" className="transition hover:text-neutral-950">İletişim</a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <button className="hidden rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#1F2A7A] shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 md:inline-flex">
                            Hesap Oluştur
                        </button>
                        <button className="rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#1F2A7A] shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5">
                            Giriş
                        </button>
                    </div>
                </div>
            </header>

            <main>
                <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-12 lg:px-10 lg:py-24">
                    <div className="lg:col-span-6 lg:pr-8">
                        <div className="mb-6 inline-flex rounded-full border border-[#FA4A0C]/20 bg-[#FA4A0C]/5 px-4 py-2 text-xs font-semibold text-[#FA4A0C]">
                            Şubeden merkeze tek akışla çalışan işletme yönetim platformu
                        </div>
                        <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.01em] md:text-6xl lg:text-7xl">
                            Şubeler veriyi girsin. <span className="text-[#FA4A0C]">Merkez tek panelden</span> toplasın, kontrol etsin ve yönetsin.
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-7 text-neutral-600 md:text-lg">
                            Şubeler puantaj, personel ve SGK işlem kayıtlarını sisteme girsin; merkez yönetim tüm verileri tek ekranda toplasın, kontrol etsin, onaylasın ve resmî süreci yönetsin.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <button className="rounded-full bg-[#FA4A0C] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(250,74,12,0.28)] transition hover:-translate-y-0.5">
                                Ücretsiz Başla
                            </button>
                            <button className="rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50">
                                Demo Talep Et
                            </button>
                        </div>

                        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {highlights.map((item) => (
                                <div key={item} className="rounded-2xl border border-black/8 bg-white px-4 py-4 text-sm font-medium text-neutral-700 shadow-sm">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-6">
                        <div className="rounded-[2rem] border border-black/10 bg-white p-4 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
                            <div className="overflow-hidden rounded-[1.75rem] bg-[#0a0a0d] p-4 text-white">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-white/50">Dashboard</div>
                                        <div className="text-2xl font-semibold tracking-normal">Merkezi Yönetim Paneli</div>
                                    </div>
                                    <div className="rounded-full bg-[#FA4A0C] px-3 py-1 text-xs font-semibold">Canlı Sistem</div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-12">
                                    <div className="rounded-[1.5rem] bg-white/5 p-4 md:col-span-5">
                                        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Modüller</div>
                                        <div className="space-y-3">
                                            {['e-Puantaj', 'e-İK', 'e-Talep', 'e-Evrak', 'e-Finans'].map((item, index) => (
                                                <div
                                                    key={item}
                                                    className={`rounded-2xl px-4 py-3 text-sm font-medium ${index === 0 ? 'bg-[#FA4A0C] text-white' : 'bg-white/8 text-white/75'
                                                        }`}
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:col-span-7">
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                ['Açık Talep', '128'],
                                                ['Aktif Personel', '452'],
                                                ['Bekleyen Onay', '19'],
                                            ].map(([label, value]) => (
                                                <div key={label} className="rounded-[1.5rem] bg-white px-4 py-4 text-neutral-950">
                                                    <div className="text-xs text-neutral-500">{label}</div>
                                                    <div className="mt-2 text-3xl font-semibold tracking-normal">{value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-5">
                                            <div className="rounded-[1.5rem] bg-white px-4 py-4 text-neutral-950 md:col-span-3">
                                                <div className="text-xs text-neutral-500">Operasyon Akışı</div>
                                                <div className="mt-3 space-y-2 text-sm font-medium">
                                                    <div>Talep → Onay → İşlem → Rapor</div>
                                                    <div className="rounded-xl bg-[#FA4A0C]/10 px-3 py-2 text-[#FA4A0C]">Tek ekranda kontrol</div>
                                                </div>
                                            </div>
                                            <div className="rounded-[1.5rem] bg-white/8 px-4 py-4 md:col-span-2">
                                                <div className="text-xs text-white/45">Yetkili Alanları</div>
                                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/70">
                                                    <div className="rounded-xl bg-white/8 px-3 py-3">Yönetici</div>
                                                    <div className="rounded-xl bg-white/8 px-3 py-3">İK</div>
                                                    <div className="rounded-xl bg-white/8 px-3 py-3">Operasyon</div>
                                                    <div className="rounded-xl bg-white/8 px-3 py-3">Rapor</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 inline-flex rounded-2xl border border-black/8 bg-[#f8f6f3] px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm">
                                Şube verisi • Merkez kontrolü • Resmî süreç yönetimi • Ölçeklenebilir yapı
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            {
                                title: 'Şubeleri tek merkeze bağlayın',
                                desc: 'Her şubenin ayrı takip yapması yerine tüm kayıtları ortak sistemde toplayın.',
                            },
                            {
                                title: 'Şube kayıtlarını merkezde toplayın',
                                desc: 'Puantaj, SGK giriş-çıkış ve personel hareketlerini merkez yönetimin kontrol edebileceği düzene taşıyın.',
                            },
                            {
                                title: 'Sonra tüm operasyonu genişletin',
                                desc: 'Finans, evrak, lojistik ve operasyon modüllerini ihtiyaca göre ekleyin.',
                            },
                        ].map((card) => (
                            <div key={card.title} className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-sm">
                                <h3 className="text-xl font-semibold tracking-normal">{card.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-neutral-600">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="akis" className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
                    <div className="rounded-[2.5rem] border border-black/8 bg-white p-8 shadow-sm md:p-10 lg:p-12">
                        <div className="max-w-4xl">
                            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#FA4A0C]">Şube → Merkez Akışı</div>
                            <h2 className="text-5xl font-semibold leading-[1.05] tracking-[-0.01em] md:text-6xl">
                                Veriyi şubeler girsin, süreci merkez yönetsin.
                            </h2>
                            <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-600">
                                e-Yönetim’in temel yapısı; dağınık şube operasyonlarını tek merkezde toplamak, kontrol etmek ve resmî işleme hazır hale getirmektir.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-5 lg:grid-cols-3">
                            {branchFlow.map((item, index) => (
                                <div key={item.title} className="rounded-[1.75rem] bg-[#f8f6f3] p-6">
                                    <div className="text-sm font-semibold text-[#FA4A0C]">0{index + 1}</div>
                                    <h3 className="mt-4 text-xl font-semibold tracking-normal">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-neutral-600">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 rounded-[2rem] bg-[#0a0a0d] p-6 text-white md:p-8">
                            <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
                                <div className="lg:col-span-3">
                                    <div className="rounded-[1.5rem] bg-white/6 p-5">
                                        <div className="text-xs uppercase tracking-[0.18em] text-white/45">Şubeler</div>
                                        <div className="mt-4 space-y-3 text-sm">
                                            <div className="rounded-xl bg-white/8 px-4 py-3">Şube A</div>
                                            <div className="rounded-xl bg-white/8 px-4 py-3">Şube B</div>
                                            <div className="rounded-xl bg-white/8 px-4 py-3">Şube C</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-2">
                                    <div className="rounded-[1.5rem] bg-[#FA4A0C] px-4 py-5 text-center text-sm font-semibold text-white">
                                        Puantaj<br />SGK<br />Personel Kayıtları
                                    </div>
                                </div>
                                <div className="lg:col-span-4">
                                    <div className="rounded-[1.5rem] bg-white px-5 py-5 text-neutral-950">
                                        <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">Merkez Panel</div>
                                        <div className="mt-3 text-2xl font-semibold tracking-normal">Kontrol • Onay • Rapor</div>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-xl bg-neutral-100 px-4 py-3 text-sm">Şube bazlı filtreleme</div>
                                            <div className="rounded-xl bg-neutral-100 px-4 py-3 text-sm">Toplu kontrol ekranı</div>
                                            <div className="rounded-xl bg-neutral-100 px-4 py-3 text-sm">Eksik veri uyarıları</div>
                                            <div className="rounded-xl bg-neutral-100 px-4 py-3 text-sm">Onay geçmişi</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-3">
                                    <div className="rounded-[1.5rem] bg-white/6 p-5">
                                        <div className="text-xs uppercase tracking-[0.18em] text-white/45">Çıktı</div>
                                        <div className="mt-4 rounded-xl bg-white/8 px-4 py-4 text-sm leading-6 text-white/80">
                                            Resmî işlemler, standart operasyon akışı ve merkez tarafından yönetilen denetlenebilir süreç yapısı.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="moduller" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
                    <div className="grid gap-10 lg:grid-cols-12">
                        <div className="max-w-3xl lg:col-span-5">
                            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#FA4A0C]">Başlangıç Modülleri</div>
                            <h2 className="text-4xl font-semibold leading-none tracking-normal md:text-5xl">
                                İlk adımı şube-personel akışını merkezileştirerek atın.
                            </h2>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
                                Şubelerin personel verilerini standart biçimde girdiği, merkezin ise tüm kayıtları tek panelde topladığı çekirdek yapıyla başlayın.
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:col-span-7 justify-center">
                            {primaryModules.map((module, i) => (
                                <div key={module.title} className="group relative rounded-[2rem] border border-black/12 bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(0,0,0,0.14)]">
                                    <div className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, rgba(250,74,12,0.08), transparent 60%)' }} />
                                    <div className="flex items-center justify-between">
                                        <div className="rounded-2xl bg-[#FA4A0C]/8 px-3 py-2 text-sm font-semibold text-[#FA4A0C]">0{i + 1}</div>
                                        <div className="rounded-full border border-black/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                            Çekirdek
                                        </div>
                                    </div>
                                    <h3 className="mt-8 text-2xl font-semibold tracking-normal">{module.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-neutral-600">{module.desc}</p>
                                    <div className="mt-10 border-t border-black/8 pt-4 text-sm font-medium text-neutral-900">
                                        Modülü incele →
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-[#0a0a0d] py-20 text-white">
                    <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12 lg:px-10">
                        <div className="lg:col-span-5">
                            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#FA4A0C]">Neden E-Yönetim</div>
                            <h2 className="text-4xl font-semibold leading-none tracking-normal md:text-5xl">
                                İş akışını sadeleştiren güçlü yapı.
                            </h2>
                            <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
                                Karışık paneller yerine hızlı karar almayı destekleyen, okunabilir ve ölçülebilir bir yönetim deneyimi sunar.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
                            {features.map((feature) => (
                                <div key={feature.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                                    <div className="inline-flex rounded-full bg-[#FA4A0C] px-3 py-1 text-xs font-semibold text-white">
                                        Öne çıkan yapı
                                    </div>
                                    <h3 className="mt-5 text-xl font-semibold tracking-normal">{feature.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-white/65">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
                    <div className="grid gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#FA4A0C]">Onay Mekanizması</div>
                            <h2 className="text-4xl font-semibold leading-none tracking-normal md:text-5xl">
                                Şubelerin açtığı işlemler merkez onayıyla ilerlesin.
                            </h2>
                            <p className="mt-5 text-base leading-7 text-neutral-600">
                                e-Yönetim yalnızca veri toplamaz; işlem başlatma, kontrol etme, onaylama ve resmî sürece hazırlama akışını da standartlaştırır.
                            </p>
                        </div>
                        <div className="lg:col-span-7">
                            <div className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-[1.5rem] bg-[#f8f6f3] p-5">
                                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Merkez işlem havuzu</div>
                                        <div className="mt-4 space-y-3">
                                            {approvalItems.map((item) => (
                                                <div key={item} className="rounded-xl border border-black/8 bg-white px-4 py-3 text-sm font-medium text-neutral-800">
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="rounded-[1.5rem] bg-[#0a0a0d] p-5 text-white">
                                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Onay akışı</div>
                                        <div className="mt-4 space-y-3 text-sm">
                                            <div className="rounded-xl bg-white/8 px-4 py-3">1. Şube kaydı oluşturur</div>
                                            <div className="rounded-xl bg-white/8 px-4 py-3">2. Merkez kaydı inceler</div>
                                            <div className="rounded-xl bg-[#FA4A0C] px-4 py-3 font-semibold text-white">3. Onaylar veya düzeltme ister</div>
                                            <div className="rounded-xl bg-white/8 px-4 py-3">4. Resmî işlem süreci başlar</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
                    <div className="grid gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#FA4A0C]">Operasyon Modülleri</div>
                            <h2 className="text-4xl font-semibold leading-none tracking-normal md:text-5xl">
                                İhtiyacınız arttıkça sisteme yeni katmanlar ekleyin.
                            </h2>
                            <p className="mt-5 text-base leading-7 text-neutral-600">
                                e-Yönetim yalnızca İK ile sınırlı değildir. Finans, belge, depo ve lojistik akışlarını tek çatı altında toplar.
                            </p>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
                            {businessModules.map((module) => (
                                <div key={module.title} className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-semibold tracking-normal">{module.title}</h3>
                                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                            Modül
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm leading-6 text-neutral-600">{module.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="referanslar" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
                    <div className="max-w-3xl">
                        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#FA4A0C]">Referanslarımız</div>
                        <h2 className="text-4xl font-semibold leading-none tracking-normal md:text-5xl">
                            Bizi tercih eden firmalar
                        </h2>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
                            Çok şubeli yapılar, merkez operasyon ekipleri ve büyüyen işletmeler için geliştirilen yönetim deneyimi sunuyoruz.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {references.map((item) => (
                            <div
                                key={item}
                                className="flex min-h-[136px] items-center justify-center rounded-[1.75rem] border border-black/6 bg-white px-6 py-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >
                                <span className="text-2xl font-semibold tracking-normal text-neutral-500">
                                    {item}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="nasil" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
                    <div className="rounded-[2.5rem] border border-black/8 bg-white p-8 shadow-sm md:p-10 lg:p-12">
                        <div className="max-w-3xl">
                            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#FA4A0C]">Nasıl Çalışır</div>
                            <h2 className="text-4xl font-semibold leading-none tracking-normal md:text-5xl">
                                Dakikalar içinde başlayın.
                            </h2>
                            <p className="mt-5 text-base leading-7 text-neutral-600">
                                Şubelerin veri girişi yaptığı, merkezin tüm kayıtları kontrol ettiği yapıyı hızlıca kurun ve süreçleri tek panelde toplamaya başlayın.
                            </p>
                        </div>
                        <div className="mt-10 grid gap-5 md:grid-cols-3">
                            {steps.map((step) => (
                                <div key={step.no} className="rounded-[1.75rem] bg-[#f8f6f3] p-6">
                                    <div className="text-sm font-semibold text-[#FA4A0C]">{step.no}</div>
                                    <h3 className="mt-4 text-xl font-semibold tracking-normal">{step.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-neutral-600">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
                    <div className="rounded-[2.5rem] border border-black/8 bg-white p-8 shadow-sm md:p-10 lg:p-12">
                        <div className="max-w-3xl">
                            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#FA4A0C]">Gerçek Kullanım Senaryosu</div>
                            <h2 className="text-4xl font-semibold leading-none tracking-normal md:text-5xl">
                                20 şubeli bir yapı için merkezileştirilmiş operasyon akışı.
                            </h2>
                            <p className="mt-5 text-base leading-7 text-neutral-600">
                                Çok şubeli firmalarda en büyük sorun verinin farklı kişilerde, farklı dosyalarda ve farklı standartlarda ilerlemesidir. e-Yönetim bunu tek bir merkez akışına dönüştürür.
                            </p>
                        </div>
                        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            {scenarioSteps.map((step, index) => (
                                <div key={step.title} className="rounded-[1.75rem] bg-[#f8f6f3] p-6">
                                    <div className="text-sm font-semibold text-[#FA4A0C]">0{index + 1}</div>
                                    <h3 className="mt-4 text-xl font-semibold tracking-normal">{step.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-neutral-600">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 pb-16 pt-20 lg:px-10">
                    <div className="rounded-[2.5rem] bg-[#FA4A0C] px-8 py-10 text-white shadow-[0_30px_80px_rgba(250,74,12,0.3)] md:px-12 md:py-14">
                        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                            <div className="lg:col-span-8">
                                <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">Hazırsanız</div>
                                <h2 className="max-w-3xl text-4xl font-semibold leading-none tracking-normal md:text-5xl">
                                    Şirketinizi tek panelden yönetmeye başlayın.
                                </h2>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-white/80">
                                    Şubeler veriyi girsin, merkez yönetsin. İşiniz büyüdükçe e-Yönetim sizinle birlikte büyüsün.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
                                <button className="w-full rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#FA4A0C] shadow-sm lg:w-auto">
                                    Ücretsiz Başla
                                </button>
                                <button className="w-full rounded-full border border-white/35 px-6 py-3.5 text-sm font-semibold text-white lg:w-auto">
                                    Demo Talep Et
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="iletisim-form" className="border-t border-black/6 bg-[#eeeff2]">
                    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="text-4xl font-semibold leading-none tracking-normal md:text-5xl">
                                İletişime Geçin
                            </h2>
                            <p className="mt-5 text-base leading-7 text-neutral-600">
                                Sorularınız için buradayız. Size nasıl yardımcı olabiliriz?
                            </p>
                        </div>

                        <div className="mt-14 grid gap-12 lg:grid-cols-12">
                            <div className="lg:col-span-4">
                                <h3 className="text-2xl font-semibold tracking-normal">Bizimle İletişime Geçin</h3>
                                <div className="mt-8 space-y-8 text-neutral-700">
                                    <div>
                                        <div className="text-sm font-semibold text-neutral-900">Telefon</div>
                                        <div className="mt-2 text-base">+90 543 713 08 57</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-neutral-900">E-Posta</div>
                                        <div className="mt-2 text-base">kurumsal@heda.tr</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-neutral-900">Adres</div>
                                        <div className="mt-2 text-base leading-7">
                                            Ankara, Türkiye<br />
                                            Merkez ofis ve operasyon yönetimi
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-8">
                                <div className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm md:p-8">
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-neutral-700">Ad Soyad</label>
                                            <input
                                                type="text"
                                                placeholder="Adınızı ve soyadınızı giriniz"
                                                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#FA4A0C]"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-neutral-700">E-Postanız</label>
                                            <input
                                                type="email"
                                                placeholder="E-Posta adresinizi giriniz"
                                                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#FA4A0C]"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        <label className="mb-2 block text-sm font-medium text-neutral-700">Konu</label>
                                        <input
                                            type="text"
                                            placeholder="Mesaj konunuzu giriniz"
                                            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#FA4A0C]"
                                        />
                                    </div>

                                    <div className="mt-5">
                                        <label className="mb-2 block text-sm font-medium text-neutral-700">Mesaj</label>
                                        <textarea
                                            rows={6}
                                            placeholder="Mesajınızı yazınız"
                                            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#FA4A0C]"
                                        />
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button className="rounded-full bg-[#FA4A0C] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(250,74,12,0.22)]">
                                            Mesaj Gönder
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer id="iletisim" className="bg-[#FA4A0C] text-white">
                <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
                    <div className="grid gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-3">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/mnt/data/e-Yönetim Beyaz SVG Logo.svg"
                                    alt="E-Yönetim beyaz logo"
                                    className="h-14 w-auto"
                                />
                            </div>
                            <p className="mt-6 max-w-xs text-base leading-7 text-white/90">
                                Modern insan kaynakları ve merkez operasyon yönetimini tek panelde birleştiren modüler yapı.
                            </p>
                            <div className="mt-8 rounded-[1.5rem] bg-white/12 p-5 text-sm leading-6 text-white/85">
                                © 2025 HEDA Teknoloji Bilişim A.Ş. Tüm hakları saklıdır.
                            </div>
                        </div>

                        <div className="lg:col-span-3">
                            <div className="text-lg font-semibold tracking-normal">Kurumsal</div>
                            <div className="mt-6 space-y-3">
                                {footerCols.kurumsal.map((item) => (
                                    <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#FA4A0C] shadow-sm">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-3">
                            <div className="text-lg font-semibold tracking-normal">Ürün ve Hizmetlerimiz</div>
                            <div className="mt-6 space-y-3">
                                {footerCols.urunler.map((item) => (
                                    <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#FA4A0C] shadow-sm">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-3">
                            <div className="text-lg font-semibold tracking-normal">Destek</div>
                            <div className="mt-6 space-y-3">
                                {footerCols.destek.map((item) => (
                                    <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#FA4A0C] shadow-sm">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
