const fs = require('fs');
const path = require('path');

const routes = [
  { p: "gelen-talepler/sgk-giris", id: "sgk", icon: "UserPlus", title: "SGK Giriş Talepleri", c1: "SGK GİRİŞ", c2: "SGK ÇIKIŞ", c3: "İŞ KAZASI", c4: "SİCİL ONAY" },
  { p: "gelen-talepler/sgk-cikis", id: "sgkout", icon: "UserMinus", title: "SGK Çıkış Talepleri", c1: "SGK ÇIKIŞ", c2: "SGK GİRİŞ", c3: "İŞ KAZASI", c4: "İHTARNAME" },
  { p: "puantaj", id: "pua", icon: "CalendarDays", title: "Günlük Puantaj Girişi", c1: "PUANTAJ", c2: "DEVAMSIZ", c3: "MESAİ", c4: "İZİNLİ" },
  { p: "personel/liste", id: "per", icon: "Users", title: "Personel Listesi", c1: "TÜM PERSONEL", c2: "YENİ BAŞLAYAN", c3: "AYRILAN", c4: "RAPORLU" },
  { p: "personel/kisitli", id: "perK", icon: "UserX", title: "Kısıtlı Personeller", c1: "KISITLI", c2: "İZLENEN", c3: "KARALİSTE", c4: "ASKIDA" },
  { p: "sgk-giris/yeni", id: "sgy", icon: "PlusCircle", title: "Yeni SGK Giriş Talebi", c1: "TASLAKLAR", c2: "BEKLEYEN", c3: "ONAYDA", c4: "TAMAMLANAN" },
  { p: "sgk-giris/liste", id: "sgl", icon: "List", title: "Giriş Taleplerim", c1: "TÜM TALEPLER", c2: "BEKLEYEN", c3: "ONAYDA", c4: "TAMAMLANAN" },
  { p: "sgk-giris/ayarlar", id: "sga", icon: "Settings", title: "Giriş Talep Ayarları", c1: "BİLDİRİMLER", c2: "ONAY YOLU", c3: "ŞABLONLAR", c4: "METRİKLER" },
  { p: "sgk-cikis/yeni", id: "scy", icon: "MinusCircle", title: "Yeni SGK Çıkış Talebi", c1: "TASLAKLAR", c2: "BEKLEYEN", c3: "ONAYDA", c4: "TAMAMLANAN" },
  { p: "sgk-cikis/liste", id: "scl", icon: "List", title: "Çıkış Taleplerim", c1: "TÜM TALEPLER", c2: "BEKLEYEN", c3: "ONAYDA", c4: "TAMAMLANAN" },
  { p: "sgk-cikis/ayarlar", id: "sca", icon: "Settings", title: "Çıkış Talep Ayarları", c1: "BİLDİRİMLER", c2: "ONAY YOLU", c3: "ŞABLONLAR", c4: "METRİKLER" },
  { p: "yetkililer/ana", id: "ya", icon: "UserCheck", title: "Ana Kullanıcı Bilgileri", c1: "SÜPER ADMİN", c2: "LOGLAR", c3: "YETKİLER", c4: "ALT USER" },
  { p: "yetkililer/liste", id: "yl", icon: "UsersRound", title: "Yetkili Listesi", c1: "TÜM YETKİLİLER", c2: "AKTİF", c3: "PASİF", c4: "DONDURULMUŞ" },
  { p: "yetkililer/yeni", id: "yy", icon: "UserCog", title: "Yeni Yetkili Ekle", c1: "TASLAKLAR", c2: "BEKLEYEN", c3: "ONAYDA", c4: "TAMAMLANAN" },
  { p: "firma/bilgiler", id: "fb", icon: "Building2", title: "Firma Bilgileri", c1: "MERKEZ", c2: "VERGİ", c3: "MERSİS", c4: "EVRAKLAR" },
  { p: "sube/bilgiler", id: "sb", icon: "Store", title: "Şube Bilgileri", c1: "AKTİF ŞUBE", c2: "KAPALI ŞUBE", c3: "DENETİM", c4: "EVRAKLAR" },
  { p: "sube/yeni", id: "sy", icon: "Store", title: "Yeni Şube Ekle", c1: "TASLAKLAR", c2: "BEKLEYEN", c3: "ONAYDA", c4: "TAMAMLANAN" },
  { p: "sube/istatistik", id: "si", icon: "AreaChart", title: "Şube İstatistikleri", c1: "CİRO", c2: "PERSONEL", c3: "MALİYET", c4: "BÜYÜME" },
  { p: "departman/liste", id: "dl", icon: "Briefcase", title: "Departman Listesi", c1: "TÜM DEPARTMAN", c2: "AKTİF", c3: "YENİ", c4: "MERGE" },
  { p: "departman/yeni", id: "dy", icon: "Briefcase", title: "Yeni Departman Ekle", c1: "TASLAKLAR", c2: "BEKLEYEN", c3: "ONAYDA", c4: "TAMAMLANAN" }
];

routes.forEach(r => {
  const dir = path.join(__dirname, '..', 'src', 'app', 'panel', r.p);
  fs.mkdirSync(dir, { recursive: true });

  const iconsToImport = Array.from(new Set([r.icon, "Clock", "CheckCircle2", "AlertTriangle", "FileText", "Activity", "PieChart"])).join(", ");

  const content = `"use client";\n
import { ${iconsToImport} } from "lucide-react";
import DataGridTemplate from "@/components/dashboard/DataGridTemplate";
import { useState } from "react";

export default function Page() {
  const [activeTab, setActiveTab] = useState("1");

  return (
    <DataGridTemplate
      title="${r.title}"
      badge="KONTROL PANELİ"
      icon={${r.icon}}
      description="${r.title} sistem metriklerini ve dökümlerini bu ekrandan yönetebilir, yetki seviyenize göre işlemleri onaylayabilirsiniz."
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      topCards={[
        { id: "c1", title: "${r.c1}", value: "0", icon: ${r.icon}, isActive: true },
        { id: "c2", title: "${r.c2}", value: "0", icon: FileText },
        { id: "c3", title: "${r.c3}", value: "0", icon: Activity },
        { id: "c4", title: "${r.c4}", value: "0", icon: PieChart }
      ]}
      tabs={[
        { id: "1", label: "BEKLEYEN İŞLEMLER", icon: Clock, count: 0 },
        { id: "2", label: "TAMAMLANANLAR", icon: CheckCircle2, count: 0 },
        { id: "3", label: "RED/İPTAL", icon: AlertTriangle, count: 0 }
      ]}
    />
  );
}`;

  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
});

console.log("All routes rewritten with DataGridTemplate.");
