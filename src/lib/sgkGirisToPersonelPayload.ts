import type { EvrakDurumu, SgkGirisFormState } from "@/types";

/** SGK formundaki Evet/Hayır → sicil kartındaki Aktif/Pasif gösterimi */
function evetHayirToAktifPasif(v: string | undefined): string | undefined {
  if (v == null || String(v).trim() === "") return undefined;
  const t = String(v).trim().toLowerCase();
  if (t === "evet" || t === "var") return "Aktif";
  if (t === "hayır" || t === "hayir" || t === "yok") return "Pasif";
  return v;
}

function yemekYolOdemeTipi(tutar: string | undefined): string {
  if (tutar == null || String(tutar).trim() === "") return "Yok";
  const x = String(tutar).trim().toLowerCase();
  if (x === "yok" || x === "hayır" || x === "hayir") return "Yok";
  return "Var";
}

function hesaplaYas(dogumTarihi: string | undefined): string {
  if (!dogumTarihi?.trim()) return "";
  const s = dogumTarihi.trim();
  const m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  let d: Date;
  if (m) {
    d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  } else {
    d = new Date(s);
  }
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const md = today.getMonth() - d.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < d.getDate())) age--;
  return age >= 0 ? String(age) : "";
}

function stripByIdPrefix<T extends { id?: unknown }>(arr: T[] | undefined, prefix: string): T[] {
  return (arr ?? []).filter((x) => !String(x?.id ?? "").startsWith(prefix));
}

function mapSgkEvraklarToOzluk(evraklar: EvrakDurumu[]) {
  return evraklar
    .filter((e) => e.durum === "yuklendi")
    .map((e) => ({
      id: `sgk-evrak-${e.id}`,
      ad: e.isim,
      dosyaAdi: "SGK giriş talebi ile yüklendi",
      boyut: "-",
      yuklemeTarihi: new Date().toLocaleDateString("tr-TR"),
      dosyaUrl: e.dosyaUrl,
    }));
}

function buildSgkZimmetRows(form: SgkGirisFormState) {
  const evet = (v: string | undefined) => String(v ?? "").trim() === "Evet";
  const talepTarih = form.iseBaslamaTarihi?.trim() ? form.iseBaslamaTarihi : "-";
  const not = "SGK giriş formu özet kaydı; ürün/seri bilgisi sonradan güncellenebilir.";
  const rows: Array<Record<string, string>> = [];
  if (evet(form.isgEkipman)) {
    rows.push({
      id: "sgk-zimmet-isg",
      demirbasAdi: "İSG Ekipmanları",
      markaModel: `Zimmet türü: İSG | Teslim eden: — | Açıklama: ${not}`,
      seriNo: "-",
      depoKodu: "-",
      adet: "1",
      teslimTarihi: talepTarih,
      iadeTarihi: "-",
      durum: "SGK özeti",
    });
  }
  if (evet(form.demirbas)) {
    rows.push({
      id: "sgk-zimmet-demirbas",
      demirbasAdi: "Demirbaş / Ekipman (genel)",
      markaModel: `Zimmet türü: Demirbaş | Teslim eden: — | Açıklama: ${not}`,
      seriNo: "-",
      depoKodu: "-",
      adet: "1",
      teslimTarihi: talepTarih,
      iadeTarihi: "-",
      durum: "SGK özeti",
    });
  }
  return rows;
}

export type BuildPersonelFromSgkOptions = {
  /** Mevcut personelJson; SGK önekli zimmet/evrak satırları yenilenir, diğerleri korunur */
  prevPersonelJson?: Record<string, unknown> | null;
};

/**
 * SGK Giriş talebi form verisini personel sicil kartının kullandığı alan adlarına dönüştürür.
 */
export function buildPersonelPayloadFromSgkGirisForm(
  form: SgkGirisFormState,
  adSoyad: string,
  options?: BuildPersonelFromSgkOptions,
): Record<string, unknown> {
  const e0 = form.egitimler?.[0];
  const prev = options?.prevPersonelJson ?? null;

  const cezaDetay =
    form.cezaeviGirisTarihi || form.cezaeviCikisTarihi
      ? `Cezaevi giriş: ${form.cezaeviGirisTarihi || "-"} / çıkış: ${form.cezaeviCikisTarihi || "-"}`
      : undefined;

  const yemekTip = yemekYolOdemeTipi(form.yemekUcreti);
  const yolTip = yemekYolOdemeTipi(form.yolUcreti);

  const ekOdemeVar = Boolean(form.sabitEkOdeme?.trim());
  const ekTutar = form.sabitEkOdeme?.trim() ?? "";

  const egitimlerOzeti =
    (form.egitimler ?? []).length > 0
      ? (form.egitimler ?? [])
          .map(
            (eg, i) =>
              `${i + 1}) ${eg.egitimDurumu || "-"} — ${eg.okulAdi || "-"} / ${eg.bolum || "-"} (${eg.mezuniyetYili || "-"})`,
          )
          .join("\n")
      : "";

  const prevZimmet = stripByIdPrefix(prev?.zimmetler as Array<{ id?: unknown }>, "sgk-zimmet-");
  const prevEvrak = stripByIdPrefix(prev?.evraklar as Array<{ id?: unknown }>, "sgk-evrak-");
  const zimmetler = [...prevZimmet, ...buildSgkZimmetRows(form)];
  const evraklar = [...prevEvrak, ...mapSgkEvraklarToOzluk(form.evraklar ?? [])];

  return {
    tckn: form.tckn,
    adSoyad,
    unvan: form.gorevi || "-",
    org: form.subeAdi || form.departman || "-",
    sicil: "-",
    statu: "Aktif",

    profilFotografi: form.profilFotografi,
    uyrugu: form.uyrugu,
    dogumTarihi: form.dogumTarihi,
    yas: hesaplaYas(form.dogumTarihi),
    dogumYeri: form.dogumYeri,
    cinsiyet: form.cinsiyet,
    medeniHal: form.medeniHal,
    anaAdi: form.anaAdi,
    babaAdi: form.babaAdi,
    adres: form.adres,
    il: form.il,
    ilce: form.ilce,
    cepTelefonu: form.cepTelefonu,
    eposta: form.eposta,
    acilDurumKisisi: form.acilDurumKisisi,
    yakinlik: form.yakinlik,
    acilDurumTelefon: form.acilDurumTelefon,

    firmaUnvani: form.firmaAdi,
    departman: form.departman,
    birim: form.birim,
    takimSinif: form.takimi,
    ekipSorumlusu: form.ekipSorumlusu,
    kadroStatusu: form.kadroStatusu,
    isyeriLokasyonu: form.isyeriLokasyonu,
    masrafMerkezi: form.masrafMerkezi,

    netUcret: form.netMaasi,
    brutUcret: form.brutMaasi,
    yemekDestekOdemesi: yemekTip,
    yemekDestekUcreti: yemekTip === "Var" ? form.yemekUcreti : "",
    yolDestekOdemesi: yolTip,
    yolDestekUcreti: yolTip === "Var" ? form.yolUcreti : "",
    servisKullanimDurumu: form.servisKullanimi,
    sabitEkOdeme1VarMi: ekOdemeVar ? "Var" : "Yok",
    sabitEkOdeme1Tutari: ekTutar,
    sabitEkOdeme1Aciklamasi: ekOdemeVar ? "SGK giriş talebi — sabit ek ödeme" : "",
    sabitEkOdeme2VarMi: "Yok",
    sabitEkOdeme2Tutari: "",
    sabitEkOdeme2Aciklamasi: "",

    istihdamTuru: form.istihdamTuru,
    calismaTuru: form.calismaTuru,
    iseBaslamaTarihi: form.iseBaslamaTarihi,
    iseAlimDurumu: form.iseAlimDurumu,
    mesaiBaslangic: form.mesaiBaslangic,
    mesaiBitis: form.mesaiBitis,

    kurumsalEposta: evetHayirToAktifPasif(form.epostaAcilacakMi),
    kurumsalTelefon: evetHayirToAktifPasif(form.telefonHattiAcilacakMi),
    erpProgramKullanimi: evetHayirToAktifPasif(form.erpAcilacakMi),
    manyetikKart: evetHayirToAktifPasif(form.manyetikKart),
    parmakIzi: evetHayirToAktifPasif(form.parmakIzi),
    otoparkYetkisi: evetHayirToAktifPasif(form.otopark),
    ziyaretciGirisYetki: evetHayirToAktifPasif(form.ziyaretci),
    kartvizit: evetHayirToAktifPasif(form.kartvizit),
    yuzTanima: evetHayirToAktifPasif(form.yuzTanima),

    kanGrubu: form.kanGrubu,
    surekliIlacKullanimi: form.surekliIlacKullanimi,
    kullanilanIlacTuru: form.kullanilanIlacTuru,
    engellilikDurumu: form.engellilikDurumu,
    engellilikTuru: form.engellilikTuru,
    engellilikOrani: form.engellilikOrani,
    protezOrtez: form.protezOrtez,
    protezOrtezTuru: form.protezOrtezTuru,

    askerlikDurumu: form.askerlikDurumu,
    terhisTarihi: form.tecilBitisTarihi || undefined,
    hizmetTuru: form.kalanSure || undefined,
    tecilBitisTarihi: form.tecilBitisTarihi,
    kalanSure: form.kalanSure,

    adliSicilKaydi: form.adliSicilKaydi,
    adliSicilNedeni: form.sabikaTuruAciklama,
    sabikaTuru: form.sabikaTuruAciklama,
    eskiHukumlu: form.eskiHukumlu,
    cezaNedeni: form.cezaNedeni,
    cezaNedeniDetayi: cezaDetay,
    denetimliSerbestlik: form.denetimliSerbestlik,
    icraDurumu: form.icraDurumu,
    aktifIcraDosyasiSayisi: form.aktifIcraDosyasiSayisi,
    nafakaDurumu: form.nafakaDurumu,
    cezaeviGirisTarihi: form.cezaeviGirisTarihi,
    cezaeviCikisTarihi: form.cezaeviCikisTarihi,

    mykBelgesi: form.mykBelgesi,
    meslekAdi: form.meslekAdi,
    mykSeviye: form.mykSeviye,
    mykBelgeNo: form.mykBelgeNo,
    mykBaslangicTarihi: form.mykBaslangicTarihi,
    mykBitisTarihi: form.mykBitisTarihi,

    egitimDurumu: e0?.egitimDurumu,
    okulAdi: e0?.okulAdi,
    bolum: e0?.bolum,
    mezuniyetYili: e0?.mezuniyetYili,
    egitimler: form.egitimler,
    egitimlerOzeti,

    ibanNo: form.ibanNo,
    iban: form.ibanNo,
    bankaAdi: form.bankaAdi,
    bankaSube: form.bankaSube,

    isgEkipman: form.isgEkipman,
    demirbas: form.demirbas,

    zimmetler,
    evraklar,
  };
}
