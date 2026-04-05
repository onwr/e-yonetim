"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Building2, 
  MapPin, 
  Users, 
  Search, 
  ChevronDown, 
  Trash2, 
  Edit2, 
  ArrowLeft,
  UserPlus,
  Mail,
  Phone
} from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { fetchJsonWithError, getApiErrorMessage } from "@/lib/fetchJsonWithError";
import { ApiErrorBanner } from "@/components/common/ApiStatus";

type PermissionItem = { id: string; name: string };
type PermissionModule = { id: string; order: string; title: string; items: PermissionItem[] };

type PermissionMap = {
  [key: string]: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    verify: boolean;
    export: boolean;
  };
};

const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: "operasyon",
    order: "01",
    title: "Operasyon Merkezi Yetki ve Rolleri",
    items: [
      { id: "op_1", name: "Kontrol Paneli" },
      { id: "op_2", name: "Gelen Talepler" }
    ]
  },
  {
    id: "yonetim",
    order: "02",
    title: "E-Yönetim Yetki ve Rolleri",
    items: [
      { id: "yo_1", name: "Günlük Puantaj Giriş İşlemleri" },
      { id: "yo_2", name: "Puantaj Onay İşlemleri" }
    ]
  },
  {
    id: "ik",
    order: "03",
    title: "E-İK Yetki ve Rolleri",
    items: [
      { id: "ik_1", name: "Personel Yönetimi → Personel Listesi" },
      { id: "ik_2", name: "Personel Yönetimi → Yeni Personel Ekleme" },
      { id: "ik_3", name: "SGK Giriş Talebi → Yeni SGK Giriş Talebi" },
      { id: "ik_4", name: "SGK Giriş Talebi → SGK Giriş Talebi Listesi" },
      { id: "ik_5", name: "SGK Çıkış Talebi → Yeni SGK Çıkış Talebi" },
      { id: "ik_6", name: "Personel Yönetimi → Kısıtlı Personel İşlemleri" },
    ]
  },
  {
    id: "kurum",
    order: "04",
    title: "E-Kurum Yetki ve Rolleri",
    items: [
      { id: "ku_1", name: "İşveren & Yetkili İşlemleri → İşveren Bilgileri" },
      { id: "ku_2", name: "Firma İşlemleri → Firma Listesi" },
      { id: "ku_3", name: "Şube İşlemleri → Şube Listesi" },
      { id: "ku_4", name: "Departman İşlemleri → Departman Listesi" },
    ]
  }
];

const DEPARTMAN_LISTESI_FALLBACK = ["İnsan Kaynakları", "Operasyon", "Muhasebe", "Yönetim", "Pazarlama", "Bilgi Teknolojileri"];

function buildDefaultPermissions(active: boolean): PermissionMap {
  const defaultPerms: PermissionMap = {};
  PERMISSION_MODULES.forEach((mod: PermissionModule) => {
    mod.items.forEach((item: PermissionItem) => {
      defaultPerms[item.id] = {
        view: active,
        create: active,
        edit: active,
        delete: active,
        verify: active,
        export: active,
      };
    });
  });
  return defaultPerms;
}

function buildPermissionsForYetkili(yetkiliRow: any): PermissionMap {
  const isAdmin = Boolean(yetkiliRow?.isAnaKullanici);
  const base = buildDefaultPermissions(isAdmin);

  // Admin arayüzde her zaman tüm yetkiler aktif görünsün.
  if (isAdmin) return base;

  const stored = yetkiliRow?.yetkiMatrix;
  if (!stored || typeof stored !== "object") return base;

  const out: PermissionMap = { ...base };
  for (const [permId, permVal] of Object.entries(stored as Record<string, any>)) {
    if (!out[permId] || !permVal || typeof permVal !== "object") continue;

    const pv = permVal as Record<string, any>;
    out[permId] = {
      view: typeof pv.view === "boolean" ? pv.view : out[permId].view,
      create: typeof pv.create === "boolean" ? pv.create : out[permId].create,
      edit: typeof pv.edit === "boolean" ? pv.edit : out[permId].edit,
      delete: typeof pv.delete === "boolean" ? pv.delete : out[permId].delete,
      verify: typeof pv.verify === "boolean" ? pv.verify : out[permId].verify,
      export: typeof pv.export === "boolean" ? pv.export : out[permId].export,
    };

    // Tutarlılık: View kapalıysa diğerleri de kapalı kabul edilir.
    if (!out[permId].view) {
      out[permId].create = false;
      out[permId].edit = false;
      out[permId].delete = false;
      out[permId].verify = false;
      out[permId].export = false;
    }
  }

  return out;
}


export default function YetkiliListesiPage() {
  const { firmaData } = useOnboarding();
  const [isEditing, setIsEditing] = useState(false);
  const [editingYetkiliId, setEditingYetkiliId] = useState<string | null>(null);

  const [permissions, setPermissions] = useState<PermissionMap>(() => buildDefaultPermissions(false));
  const [matrixUserId, setMatrixUserId] = useState<string | null>(null);
  const [listError, setListError] = useState("");
  const [subeOptions, setSubeOptions] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubeDept, setFilterSubeDept] = useState("Tümü");
  const [filterYetkiDurumu, setFilterYetkiDurumu] = useState("Tümü");
  const [filterYetkiAlani, setFilterYetkiAlani] = useState("Tümü");
  const [mounted, setMounted] = useState(false);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState<any>(null);


  useEffect(() => {
    setMounted(true);
  }, []);

  const firmaUnvani = firmaData?.formData?.firmaUnvani || "";

  const handleToggleAllRow = (rowId: string, value: boolean) => {
    setPermissions((prev: PermissionMap) => ({
      ...prev,
      [rowId]: {
        view: value,
        create: value,
        edit: value,
        delete: value,
        verify: value,
        export: value
      }
    }));
  };

  const handleToggleItem = (rowId: string, field: keyof PermissionMap[string], value: boolean) => {
    setPermissions((prev: PermissionMap) => {
      const current = { ...prev[rowId] };
      current[field] = value;
      
      // Locked logic: if view is explicitly turned off, everything else turns off
      if (field === 'view' && !value) {
        current.create = false;
        current.edit = false;
        current.delete = false;
        current.verify = false;
        current.export = false;
      }
      return { ...prev, [rowId]: current };
    });
  };

  const handleSavePermissions = () => {
    if (!matrixUserId) return;
    void (async () => {
      try {
        await fetchJsonWithError(`/api/v1/yetkililer/${matrixUserId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ yetkiMatrix: permissions }),
        });
        setIsEditing(false);
      } catch (e) {
        setListError(getApiErrorMessage(e, "Yetkiler kaydedilemedi."));
      }
    })();
  };

  const [subeVeDepartmanListesi, setSubeVeDepartmanListesi] = useState<{ id: string; text: string }[]>([]);

  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        setListError("");
        const [yetkililer, subeler, departmanlar] = await Promise.all([
          fetchJsonWithError<any[]>("/api/v1/yetkililer"),
          fetchJsonWithError<any[]>("/api/v1/subeler?page=1&pageSize=200"),
          fetchJsonWithError<any[]>("/api/v1/departmanlar?page=1&pageSize=200"),
        ]);
        const snames = (Array.isArray(subeler) ? subeler : []).map((s: any) => s.name).filter(Boolean);
        setSubeOptions(snames.length ? snames : []);
        const rawList = Array.isArray(yetkililer) ? yetkililer : [];
        const rows = rawList.map((u: any) => {
          const prefs =
            u.preferences && typeof u.preferences === "object"
              ? (u.preferences as Record<string, unknown>)
              : {};
          const yetkiMatrix =
            prefs.yetkiMatrix && typeof prefs.yetkiMatrix === "object"
              ? (prefs.yetkiMatrix as any)
              : undefined;
          return {
            id: u.id,
            adSoyad: u.adSoyad,
            unvan: (prefs.unvan as string) || "-",
            email: u.eposta,
            telefon: u.telefon,
            sube: (prefs.sube as string) || "-",
            departman: (prefs.departman as string) || "-",
            status: u.status === "ACTIVE" ? "Aktif" : "Pasif",
            isAnaKullanici: Boolean(u.isAnaKullanici),
            yetkiMatrix,
          };
        });
        setUsersList(rows);
        const ana = rows.find((r) => r.isAnaKullanici) ?? rows[0];
        if (ana) {
          setMatrixUserId(ana.id);
          setPermissions(buildPermissionsForYetkili(ana));
        }
        const combosFromUsers = rows
          .filter((r) => r.sube && r.departman && r.sube !== "-" && r.departman !== "-")
          .map((r, i) => ({ id: `u-${i}`, text: `${firmaUnvani} - ${r.sube} - ${r.departman}` }));

        const depRows = Array.isArray(departmanlar) ? departmanlar : [];
        const combosFromDb = depRows.map((d: any) => {
          const depAd = d.name ?? d.departmanAdi ?? "—";
          const subAd = d.branch?.name ?? "—";
          return { id: `d-${d.id}`, text: `${firmaUnvani} - ${subAd} - ${depAd}` };
        });

        const seen = new Set<string>();
        const merged: { id: string; text: string }[] = [];
        for (const c of [...combosFromDb, ...combosFromUsers]) {
          if (seen.has(c.text)) continue;
          seen.add(c.text);
          merged.push(c);
        }
        setSubeVeDepartmanListesi(merged);
      } catch (e) {
        setListError(getApiErrorMessage(e, "Yetkili listesi yuklenemedi."));
      }
    })();
  }, [firmaUnvani]);

  const anaRow = usersList.find((u) => u.isAnaKullanici) ?? usersList[0];
  const activeRow =
    (editingYetkiliId ? usersList.find((u) => u.id === editingYetkiliId) : null) ?? anaRow;

  const kullaniciSube = activeRow?.sube ?? "—";
  const kullaniciDepartman = activeRow?.departman ?? "—";

  const activeAdSoyad = activeRow?.adSoyad ?? "Belirtilmedi";
  const activeUnvan = activeRow?.unvan ?? "-";
  const activeEmail = activeRow?.email ?? "Belirtilmedi";
  const activeTelefon = activeRow?.telefon ?? "Belirtilmedi";

  const filteredUsers = usersList.filter(u => {
    let match = true;
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      match = match && (
        u.adSoyad.toLowerCase().includes(s) || 
        u.email.toLowerCase().includes(s) ||
        (u.unvan || "").toLowerCase().includes(s) ||
        u.sube.toLowerCase().includes(s) ||
        u.departman.toLowerCase().includes(s) ||
        u.telefon.includes(s)
      );
    }
    if (filterSubeDept !== "Tümü") {
       match = match && (`${firmaUnvani} - ${u.sube} - ${u.departman}`.includes(filterSubeDept) || u.sube.includes(filterSubeDept) || u.departman.includes(filterSubeDept));
    }
    if (filterYetkiDurumu === "Aktif") match = match && u.status === "Aktif";
    if (filterYetkiDurumu === "Pasif") match = match && u.status === "Pasif";
    return match;
  });
  
  const handleDeleteConfirm = () => {
    if (!deletingUser) return;
    const userToDelete = deletingUser;
    setDeletingUser(null);
    void (async () => {
      try {
        await fetchJsonWithError(`/api/v1/yetkililer/${userToDelete.id}`, { method: "DELETE" });
        setUsersList((prev) => prev.filter((u) => u.id !== userToDelete.id));
      } catch (e) {
        setListError(getApiErrorMessage(e, "Kullanici silinirken hata olustu."));
      }
    })();
  };

  const Switch = ({ 
    checked, 
    onChange, 
    disabled = false 
  }: { 
    checked: boolean, 
    onChange: (checked: boolean) => void,
    disabled?: boolean
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        height: '24px',
        width: '44px',
        flexShrink: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        alignItems: 'center',
        borderRadius: '9999px',
        border: 'none',
        outline: 'none',
        backgroundColor: checked ? '#0052cc' : '#d1d5db',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.3s ease',
        padding: '2px',
      }}
    >
      <span style={{
        display: 'inline-block',
        height: '20px',
        width: '20px',
        borderRadius: '9999px',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transform: checked ? 'translateX(20px)' : 'translateX(0px)',
        transition: 'transform 0.3s ease',
        pointerEvents: 'none',
      }} />
    </button>
  );

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProfile) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const adSoyad = (data.get("adSoyad") as string) || editingProfile.adSoyad;
    const eposta = (data.get("email") as string) || editingProfile.email;
    const telefon = (data.get("telefon") as string) || editingProfile.telefon;
    const sube = (data.get("sube") as string) || editingProfile.sube;
    const departman = (data.get("departman") as string) || editingProfile.departman;
    void (async () => {
      try {
        await fetchJsonWithError(`/api/v1/yetkililer/${editingProfile.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adSoyad,
            eposta,
            telefon,
            preferences: { sube, departman },
          }),
        });
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === editingProfile.id ? { ...u, adSoyad, email: eposta, telefon, sube, departman } : u,
          ),
        );
        setEditingProfile(null);
      } catch (err) {
        setListError(getApiErrorMessage(err, "Profil guncellenemedi."));
      }
    })();
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-6 w-full pb-12 animate-fade-in font-sans">
        <ApiErrorBanner message={listError} />
        {/* Edit Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[14px]">
            <span className="text-[#6b778c] font-semibold">İşveren & Yetkili İşlemleri /</span>
            <span className="text-[#ef5a28] font-bold">Yetkili Listesi</span>
          </div>
          <button 
            onClick={() => { setIsEditing(false); setEditingYetkiliId(null); setEditingProfile(null); }}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-[13.5px] font-extrabold text-[#172b4d] hover:bg-gray-50 hover:shadow-sm transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-[18px] h-[18px] stroke-[2.5]" />
            Geri
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm w-full">
          <div className="flex flex-col sm:flex-row items-start justify-between w-full gap-6">
            <div className="flex items-start gap-6 w-full sm:w-auto">
              <div className="w-[72px] h-[72px] rounded-full bg-[#f4f5f8] flex items-center justify-center border-4 border-white shadow-md relative">
                <Users className="w-8 h-8 text-[#a5adba] absolute" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-extrabold bg-[#ff5630]/10 text-[#ff5630] px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                  {activeUnvan}
                </span>
                <h2 className="text-[20px] font-black text-[#172b4d] tracking-tight mb-2">{activeAdSoyad}</h2>
                <div className="flex flex-wrap items-center gap-4 text-[13px] font-semibold text-[#6b778c]">
                  <div className="flex items-center gap-1.5 hover:text-[#0052cc] cursor-pointer transition-colors">
                    <span className="w-4 h-4 flex items-center justify-center"><Mail className="w-[14px] h-[14px]" /></span> {activeEmail}
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-[#0052cc] cursor-pointer transition-colors">
                    <span className="w-4 h-4 flex items-center justify-center"><Phone className="w-[14px] h-[14px]" /></span> {activeTelefon}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 w-full sm:w-auto mt-4 sm:mt-0">
               <div className="flex flex-col gap-3 min-w-[200px]">
                 <div className="flex items-center justify-between sm:justify-start gap-6 text-[13px] font-semibold">
                   <span className="w-20 text-gray-500">Firma:</span>
                   <span className="text-[#172b4d] font-bold truncate max-w-[140px]">{firmaUnvani}</span>
                 </div>
                 <div className="flex items-center justify-between sm:justify-start gap-6 text-[13px] font-semibold">
                   <span className="w-20 text-gray-500">Şube:</span>
                   <span className="text-[#42526e]">{kullaniciSube}</span>
                 </div>
                 <div className="flex items-center justify-between sm:justify-start gap-6 text-[13px] font-semibold">
                   <span className="w-20 text-gray-500">Departman:</span>
                   <span className="text-[#42526e]">{kullaniciDepartman}</span>
                 </div>
               </div>
               
               <button
                 type="button"
                onClick={() => activeRow && setEditingProfile(activeRow)}
                 className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-[#ef5a28] px-4 py-2 rounded-lg text-[13px] font-extrabold transition-colors shrink-0 whitespace-nowrap w-full sm:w-auto justify-center"
               >
                 <Edit2 className="w-4 h-4" /> Profili Düzenle
               </button>
            </div>
          </div>
        </div>

        {/* Permissions Lists */}
        <div className="flex flex-col gap-6">
          {PERMISSION_MODULES.map((module: PermissionModule) => (
            <div key={module.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden pb-4">
              <div className="flex items-center gap-3 p-5 border-b border-gray-100/60 pb-5">
                 <div className="w-[34px] h-[34px] bg-[#ef5a28] rounded-xl flex items-center justify-center text-white font-black text-[14px]">
                    {module.order}
                 </div>
                 <h3 className="text-[15px] font-extrabold text-[#ef5a28] pl-2">{module.title}</h3>
              </div>
              
              <div className="w-full">
                <div className="grid grid-cols-[36px_1fr_90px_90px_90px_90px_90px_100px_90px] gap-2 items-center px-6 py-4 text-[11px] font-extrabold text-[#172b4d] tracking-normal">
                  <div className="text-gray-400">#</div>
                  <div>Modül / İşlem Alanı</div>
                  <div className="text-center text-[#ef5a28]">Tümünü<br/>Aç/Kapa</div>
                  <div className="text-center">Görüntüle</div>
                  <div className="text-center">Oluştur</div>
                  <div className="text-center">Düzenle</div>
                  <div className="text-center">Sil</div>
                  <div className="text-center">Onayla / Reddet</div>
                  <div className="text-center">Dışa Aktar</div>
                </div>

                <div className="flex flex-col px-6 pb-2">
                  {module.items.map((item: PermissionItem, idx: number) => {
                     const perms = permissions[item.id];
                     const isAllChecked = perms.view && perms.create && perms.edit && perms.delete && perms.verify && perms.export;
                     const isLocked = !perms.view; // If viewing is disabled, others are locked
                     
                     return (
                       <div key={item.id} className="grid grid-cols-[36px_1fr_90px_90px_90px_90px_90px_100px_90px] gap-2 items-center py-4 border-t border-gray-50/80 hover:bg-gray-50/50 transition-colors rounded-xl px-2 -mx-2">
                         <div className="text-[12px] font-bold text-gray-400">{idx + 1}</div>
                         <div className="text-[12.5px] font-bold text-[#42526e] tracking-tight">{item.name}</div>
                         
                         <div className="text-center flex justify-center">
                           <Switch 
                              checked={isAllChecked} 
                              onChange={(val) => handleToggleAllRow(item.id, val)}
                           />
                         </div>
                         <div className="text-center flex justify-center">
                           <Switch 
                              checked={perms.view} 
                              onChange={(val) => handleToggleItem(item.id, 'view', val)}
                           />
                         </div>
                         <div className="text-center flex justify-center">
                           <Switch 
                              checked={perms.create} 
                              onChange={(val) => handleToggleItem(item.id, 'create', val)}
                              disabled={isLocked}
                           />
                         </div>
                         <div className="text-center flex justify-center">
                           <Switch 
                              checked={perms.edit} 
                              onChange={(val) => handleToggleItem(item.id, 'edit', val)}
                              disabled={isLocked}
                           />
                         </div>
                         <div className="text-center flex justify-center">
                           <Switch 
                              checked={perms.delete} 
                              onChange={(val) => handleToggleItem(item.id, 'delete', val)}
                              disabled={isLocked}
                           />
                         </div>
                         <div className="text-center flex justify-center">
                           <Switch 
                              checked={perms.verify} 
                              onChange={(val) => handleToggleItem(item.id, 'verify', val)}
                              disabled={isLocked}
                           />
                         </div>
                         <div className="text-center flex justify-center">
                           <Switch 
                              checked={perms.export} 
                              onChange={(val) => handleToggleItem(item.id, 'export', val)}
                              disabled={isLocked}
                           />
                         </div>
                       </div>
                     );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-4 px-2">
           <button 
              onClick={handleSavePermissions}
              className="bg-[#ff5630] hover:bg-[#de350b] text-white px-6 py-4 rounded-xl font-extrabold text-[15px] transition-all shadow-md active:scale-95 flex items-center gap-2.5 shadow-orange-500/20 hover:shadow-orange-500/40"
           >
             <Edit2 className="w-[18px] h-[18px]" />
             Yetkileri Kaydet
           </button>
        </div>

        {/* Profile Edit Modal */}
        {mounted && editingProfile && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0b1b42]/50 backdrop-blur-md">
            <div className="bg-white rounded-[2rem] w-full max-w-xl flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-[18px] font-black text-[#172b4d] flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-[#ff5630]" /> Profil Bilgilerini Düzenle
                </h2>
                <button onClick={() => setEditingProfile(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <span className="text-gray-500 font-bold text-lg leading-none">&times;</span>
                </button>
              </div>
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[11px] font-extrabold text-[#8a94a6] uppercase tracking-wide">Ad Soyad</label>
                    <input name="adSoyad" defaultValue={editingProfile.adSoyad} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-bold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-[#8a94a6] uppercase tracking-wide">E-posta</label>
                    <input name="email" type="email" defaultValue={editingProfile.email} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-bold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-[#8a94a6] uppercase tracking-wide">Telefon</label>
                    <input name="telefon" type="tel" defaultValue={editingProfile.telefon} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-bold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-[#8a94a6] uppercase tracking-wide">Şube</label>
                    <select name="sube" defaultValue={editingProfile.sube} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-bold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all appearance-none">
                      {(subeOptions.length ? subeOptions : ["—"]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-[#8a94a6] uppercase tracking-wide">Departman</label>
                    <select name="departman" defaultValue={editingProfile.departman} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] font-bold text-[#0b1b42] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all appearance-none">
                      {DEPARTMAN_LISTESI_FALLBACK.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setEditingProfile(null)} className="flex-1 py-3 rounded-xl font-bold text-[14px] text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors">İptal</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-[14px] text-white bg-[#0052cc] hover:bg-blue-700 transition-colors shadow-sm">Kaydet</button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="flex flex-col gap-6 w-full pb-12 animate-fade-in font-sans">
      <ApiErrorBanner message={listError} />
      {/* Top Breadcrumb & Button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[14px]">
          <span className="text-[#6b778c] font-semibold">İşveren & Yetkili İşlemleri /</span>
          <span className="text-[#ef5a28] font-bold">Yetkili Listesi</span>
        </div>
        <a href="/panel/yetkililer/yeni" className="flex items-center gap-2 bg-[#ff5630] hover:bg-[#de350b] text-white px-5 py-3 rounded-xl text-[14px] font-extrabold transition-all shadow-md hover:shadow-orange-500/20 active:scale-95">
          <UserPlus className="w-[18px] h-[18px]" />
          Yeni Yetkili Ekle
        </a>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 flex flex-wrap lg:flex-nowrap items-end gap-4 w-full">
         <div className="flex-1 min-w-[200px] flex flex-col gap-2">
            <label className="text-[12px] font-extrabold text-[#172b4d] ml-1">Hızlı Ara</label>
            <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <Search className="w-[18px] h-[18px] text-gray-400" />
               </div>
               <input 
                 type="text" 
                 placeholder="İsim, e-posta..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-[42px] pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-[14px] font-semibold text-[#172b4d] placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
               />
            </div>
         </div>
         <div className="flex-1 min-w-[200px] flex flex-col gap-2">
            <label className="text-[12px] font-extrabold text-[#172b4d] ml-1">Firma, Şube, Departman</label>
            <div className="relative">
               <select 
                 value={filterSubeDept}
                 onChange={(e) => setFilterSubeDept(e.target.value)}
                 className="w-full pl-4 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-[14px] font-semibold text-[#172b4d] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all hover:border-gray-300"
               >
                 <option value="Tümü">Tümü</option>
                 {subeVeDepartmanListesi.map((birim) => (
                   <option key={birim.id} value={birim.text}>{birim.text}</option>
                 ))}
               </select>
               <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                 <ChevronDown className="w-4 h-4 text-gray-500" />
               </div>
            </div>
         </div>
         <div className="flex-1 min-w-[200px] flex flex-col gap-2">
            <label className="text-[12px] font-extrabold text-[#172b4d] ml-1">Yetki Alanı</label>
            <div className="relative">
               <select 
                 value={filterYetkiAlani}
                 onChange={(e) => setFilterYetkiAlani(e.target.value)}
                 className="w-full pl-4 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-[14px] font-semibold text-[#172b4d] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all hover:border-gray-300"
               >
                 <option value="Tümü">Tümü</option>
                 <option value="Operasyon Merkezi Yetki ve Rolleri">Operasyon Merkezi Yetki ve Rolleri</option>
                 <option value="E-Yönetim Yetki ve Rolleri">E-Yönetim Yetki ve Rolleri</option>
                 <option value="E-İK Yetki ve Rolleri">E-İK Yetki ve Rolleri</option>
                 <option value="E-Kurum Yetki ve Rolleri">E-Kurum Yetki ve Rolleri</option>
               </select>
               <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                 <ChevronDown className="w-4 h-4 text-gray-500" />
               </div>
            </div>
         </div>
         <div className="flex-1 min-w-[150px] flex flex-col gap-2">
            <label className="text-[12px] font-extrabold text-[#172b4d] ml-1">Yetki Durumu</label>
            <div className="relative">
               <select 
                 value={filterYetkiDurumu}
                 onChange={(e) => setFilterYetkiDurumu(e.target.value)}
                 className="w-full pl-4 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-[14px] font-semibold text-[#172b4d] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all hover:border-gray-300"
               >
                 <option value="Tümü">Tümü</option>
                 <option value="Aktif">Aktif</option>
                 <option value="Pasif">Pasif</option>
               </select>
               <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                 <ChevronDown className="w-4 h-4 text-gray-500" />
               </div>
            </div>
         </div>
         <button type="button" onClick={() => anaRow && setEditingProfile(anaRow)} className="h-[52px] w-[52px] shrink-0 bg-[#f4f5f8] hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-2xl flex items-center justify-center transition-colors border border-gray-100">
           <Trash2 className="w-[20px] h-[20px]" />
         </button>
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-4">
        {/* Table Header */}
        <div className="bg-[#b3beeb] text-white rounded-2xl py-3.5 px-6 flex items-center font-extrabold text-[12px] shadow-sm tracking-wide">
           <div className="w-[60px] text-center pl-2">No</div>
           <div className="w-[300px]">Yetkili Bilgileri</div>
           <div className="flex-1">Firma, Şube, Departman</div>
           <div className="w-[180px] text-center">Durumu</div>
           <div className="w-[120px] text-center pr-4">İşlem</div>
        </div>

        {/* Table Items */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Search className="w-8 h-8 text-gray-400" />
             </div>
             <p className="text-[15px] font-bold text-[#172b4d] mb-1">Kullanıcı bulunamadı</p>
             <p className="text-[13px] font-medium text-gray-500">Arama kriterlerinize uygun bir sonuç yok.</p>
          </div>
        ) : (
          filteredUsers.map((user, index) => (
            <div key={user.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 flex items-center transition-all hover:border-blue-200 hover:shadow-md">
               <div className="w-[60px] text-center font-black text-[#172b4d] text-[15px] pl-2">{index < 9 ? `0${index + 1}` : index + 1}</div>
               <div className="w-[300px] flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#f4f5f8] flex items-center justify-center border-4 border-white shadow-sm shrink-0 relative overflow-hidden">
                    <Users className="w-6 h-6 text-[#a5adba] absolute" />
                  </div>
                  <div className="flex flex-col items-start gap-1 w-full overflow-hidden">
                     <span className="text-[9px] font-extrabold bg-[#ff5630]/10 text-[#ff5630] px-2 py-0.5 rounded-md uppercase tracking-wider">{user.unvan}</span>
                     <h4 className="text-[14px] font-black text-[#172b4d] truncate w-full">{user.adSoyad}</h4>
                     <div className="flex flex-col gap-0.5 text-[11px] font-semibold text-[#6b778c]">
                        <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {user.email}</div>
                        <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {user.telefon}</div>
                     </div>
                  </div>
               </div>
               
               <div className="flex-1 flex flex-col gap-2 pl-4">
                 <div className="flex items-center gap-2.5 text-[12px] font-bold text-[#172b4d]">
                   <Building2 className="w-[14px] h-[14px] text-blue-500" /> {firmaUnvani}
                 </div>
                 <div className="flex items-center gap-2.5 text-[12px] font-semibold text-[#6b778c]">
                   <MapPin className="w-[14px] h-[14px] text-red-500" /> {user.sube}
                 </div>
                 <div className="flex items-center gap-2.5 text-[12px] font-semibold text-[#6b778c]">
                   <Users className="w-[14px] h-[14px] text-gray-500" /> {user.departman}
                 </div>
               </div>

               <div className="w-[180px] flex flex-col items-center justify-center gap-3">
                  <div className="text-center">
                     <p className="text-[10px] font-bold text-gray-400 mb-0.5">Son Görülme</p>
                     <div className="bg-gray-50 px-4 py-1.5 rounded-lg text-[11px] font-extrabold text-[#172b4d]">7 Gün Önce</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 text-green-600 px-6 py-1.5 rounded-lg text-[12px] font-black flex items-center justify-center gap-2 tracking-wide w-full max-w-[120px]">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Aktif
                  </div>
               </div>

               <div className="w-[120px] flex items-center justify-center gap-3 pr-2 border-l border-gray-100 pl-4 h-16">
                  <button 
                    onClick={() => {
                      setEditingYetkiliId(user.id);
                      setMatrixUserId(user.id);
                      setPermissions(buildPermissionsForYetkili(user));
                      setIsEditing(true);
                    }}
                    className="w-10 h-10 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ff5630] flex items-center justify-center transition-colors shadow-sm"
                  >
                     <Edit2 className="w-[18px] h-[18px]" />
                  </button>
                  <button 
                    onClick={() => setDeletingUser(user)}
                    className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors shadow-sm"
                  >
                     <Trash2 className="w-[18px] h-[18px]" />
                  </button>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal using React Portal */}
      {mounted && deletingUser && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0b1b42]/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-sm flex flex-col shadow-2xl p-8 relative items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
               <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-[20px] font-black text-[#0b1b42] mb-2">
               Kullanıcıyı Sil
            </h2>
            <p className="text-[13px] font-semibold text-[#6b778c] mb-8 leading-relaxed">
              <strong className="text-[#172b4d]">{deletingUser.adSoyad}</strong> isimli kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve yetkileri sıfırlanır.
            </p>
            <div className="flex items-center gap-3 w-full">
               <button onClick={() => setDeletingUser(null)} className="flex-1 py-3.5 rounded-xl font-bold text-[14px] text-[#6b778c] bg-gray-50 hover:bg-gray-100 transition-colors">İptal Et</button>
               <button onClick={handleDeleteConfirm} className="flex-1 py-3.5 rounded-xl font-bold text-[14px] text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm">Evet, Sil</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
