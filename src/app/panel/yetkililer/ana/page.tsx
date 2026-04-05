"use client";
import { UserCheck, Clock, CheckCircle2, AlertTriangle, FileText, Activity, PieChart } from "lucide-react";
import DataGridTemplate from "@/components/dashboard/DataGridTemplate";
import { useState } from "react";
export default function Page() {
  const [activeTab, setActiveTab] = useState("1");
  return (
    <DataGridTemplate
      title="Ana Kullanıcı Bilgileri"
      badge="KONTROL PANELİ"
      icon={UserCheck}
      description="Ana Kullanıcı Bilgileri sistem metriklerini ve dökümlerini bu ekrandan yönetebilir, yetki seviyenize göre işlemleri onaylayabilirsiniz."
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      topCards={[
        { id: "c1", title: "SÜPER ADMİN", value: "0", icon: UserCheck, isActive: true },
        { id: "c2", title: "LOGLAR", value: "0", icon: FileText },
        { id: "c3", title: "YETKİLER", value: "0", icon: Activity },
        { id: "c4", title: "ALT USER", value: "0", icon: PieChart }
      ]}
      tabs={[
        { id: "1", label: "BEKLEYEN İŞLEMLER", icon: Clock, count: 0 },
        { id: "2", label: "TAMAMLANANLAR", icon: CheckCircle2, count: 0 },
        { id: "3", label: "RED/İPTAL", icon: AlertTriangle, count: 0 }
      ]}
    />
  );
}