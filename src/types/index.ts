export interface BaseEntity {
  id: number | string;
}

export interface BasePersonel extends BaseEntity {
  tckn: string;
  adSoyad: string;
}

export interface Zimmet {
  id: string | number;
  demirbasAdi: string;
  markaModel: string;
  seriNo: string;
  depoKodu: string;
  adet: string;
  teslimTarihi: string;
  iadeTarihi?: string;
  durum: string; // 'Aktif', 'Pasif', 'İade Edildi' vs.
}

export interface Evrak {
  id: string | number;
  ad: string;
  dosyaAdi: string;
  boyut: string;
  yuklemeTarihi: string;
}

export interface Personel extends BasePersonel {
  unvan: string;
  org: string;
  sicil: string;
  statu: 'Aktif' | 'Pasif' | string;
  /** API kayıt zamanı (dashboard aylık giriş sayımı için) */
  createdAt?: string;

  // Zimmet Bilgileri
  zimmetler?: Zimmet[];

  // Evrak Bilgileri
  evraklar?: Evrak[];

  // Temel Kimlik Bilgileri
  uyrugu?: string;
  dogumTarihi?: string;
  dogumYeri?: string;
  cinsiyet?: string;
  medeniHal?: string;
  anaAdi?: string;
  babaAdi?: string;
  adres?: string;
  ilce?: string;
  cepTelefonu?: string;
  eposta?: string;
  acilDurumKisisi?: string;
  yakinlik?: string;
  acilDurumTelefon?: string;
  
  // Kurum ve Kadro Bilgileri
  firmaUnvani?: string;
  departman?: string;
  birim?: string;
  takimSinif?: string;
  ekipSorumlusu?: string;
  isyeriLokasyonu?: string;
  masrafMerkezi?: string;
  kadroStatusu?: string;

  // SGK ve Statü Bilgileri
  sgkStatusu?: string;
  istihdamTuru?: string;
  calismaTuru?: string;
  iseBaslamaTarihi?: string;
  istenAyrilisTarihi?: string;

  // Ücret ve Yan Hak Bilgileri
  ucretTipi?: string;
  netUcret?: string;
  brutUcret?: string;
  yemekDestekOdemesi?: string;
  yemekDestekUcreti?: string;
  yolDestekOdemesi?: string;
  yolDestekUcreti?: string;
  sabitEkOdeme1VarMi?: string;
  sabitEkOdeme1Tutari?: string;
  sabitEkOdeme1Aciklamasi?: string;
  sabitEkOdeme2VarMi?: string;
  sabitEkOdeme2Tutari?: string;
  sabitEkOdeme2Aciklamasi?: string;
  servisKullanimDurumu?: string;
  servisNumarasi?: string;

  // Sağlık Durumu Bilgileri
  kanGrubu?: string;
  surekliIlacKullanimi?: string;
  kullanilanIlacTuru?: string;
  engellilikDurumu?: string;
  engellilikTuru?: string;
  engellilikOrani?: string;
  protezOrtez?: string;

  // Askerlik Durumu
  askerlikDurumu?: string;
  terhisTarihi?: string;
  hizmetTuru?: string;
  sinifBrans?: string;

  // MYK Mesleki Yeterlilik
  mykBelgesi?: string;
  meslekAdi?: string;
  mykSeviye?: string;
  mykBelgeNo?: string;

  // Erişim ve Yetki Tanımlamaları
  kurumsalEposta?: string; // Var/Yok - Aktif/Pasif
  kurumsalEpostaAdresi?: string;
  kurumsalTelefon?: string; // Var/Yok - Aktif/Pasif
  kurumsalGsm?: string;
  dahiliyeNo?: string;
  manyetikKart?: string; // Var/Yok - Aktif/Pasif
  kartSeriNo?: string;
  parmakIzi?: string; // Var/Yok - Aktif/Pasif
  otoparkYetkisi?: string;
  ziyaretciGirisYetki?: string;
  kartvizit?: string;
  erpProgramKullanimi?: string;

  // Yasal Durum ve Adli Sicil
  adliSicilKaydi?: string;
  adliSicilNedeni?: string;
  hacizAlimi?: string;
  eskiHukumlu?: string;
  cezaNedeni?: string;
  cezaNedeniDetayi?: string;
  cocukOrnegi?: string;
  nafakaDurumu?: string;
  icraDurumu?: string;
  denetimliSerbestlik?: string;
  ozelNeden?: string;

  // Eğitim ve Mesleki Bilgiler
  egitimDurumu?: string;
  okulAdi?: string;
  bolum?: string;
  mezuniyetYili?: string;

  // İşe Giriş Sağlık Muayenesi
  isGirisCalisabilirlik?: string;
  isGirisSaglikRaporu?: string;
  isGirisRaporTarihi?: string;
  isGirisSonrakiMuayene?: string;

  // İSG Eğitim Bilgileri
  isgEgitimDurumu?: string;
  isgEgitimTuru?: string;
  isgEgitimSuresi?: string;
  isgEgitimiVeren?: string;
}

export interface EvrakDurumu {
  id: string;
  isim: string;
  durum: 'bekliyor' | 'yukleniyor' | 'yuklendi';
  dosyaUrl?: string;
}

export interface KisitliPersonel extends BasePersonel {
  neden: string;
  aciklama?: string;
  eklenmeTarihi: string;
  kaldirilmaTarihi?: string;
  durum: string; // 'Beklemede', 'Onaylandı', 'Reddedildi', 'Kaldırıldı'
  sube?: string;
}

export interface Talep extends BasePersonel {
  sgkNo: string;
  sirket?: string;
  sube?: string;
  departman?: string;
  unvan?: string;
  kazaTarihi?: string;
  kazaTuru?: string;
  raporDurumu?: string;
  olayYeri?: string;
  durum: string;
  tarih: string;
  type: string;
  formBilgileri?: SgkGirisFormState;
  // SGK Çıkış alanları
  cikisNedeni?: string;
  cikisTarihi?: string;
  yetkiliEmail?: string;
  personelId?: number | string;
}

export interface SgkEgitim {
  id: string;
  egitimDurumu: string;
  okulAdi: string;
  bolum: string;
  mezuniyetYili: string;
}

export interface SgkGirisFormState {
  // Kimlik Bilgileri
  profilFotografi?: string;
  uyrugu: string;
  tckn: string;
  ad: string;
  soyad: string;
  dogumTarihi: string;
  dogumYeri: string;
  cinsiyet: string;
  medeniHal: string;
  anaAdi: string;
  babaAdi: string;

  // Sağlık Durumu
  kanGrubu: string;
  surekliIlacKullanimi: string; // Var / Yok
  kullanilanIlacTuru?: string;
  engellilikDurumu: string; // Var/Yok
  engellilikTuru?: string;
  engellilikOrani?: string;
  protezOrtez: string; // Var/Yok
  protezOrtezTuru?: string;

  // Askerlik Durumu
  askerlikDurumu: string; // Tecilli/Muaf vs
  tecilBitisTarihi?: string;
  kalanSure?: string;

  // Yasal Durum ve Adli Sicil
  adliSicilKaydi: string; // Var/YOKTUR
  sabikaTuruAciklama?: string;
  eskiHukumlu: string; // Var/YOK
  cezaNedeni?: string;
  cezaeviGirisTarihi?: string;
  cezaeviCikisTarihi?: string;
  denetimliSerbestlik: string; // Var/Yok
  icraDurumu: string; // Devam eden icra durumu (Var/Yok)
  aktifIcraDosyasiSayisi?: string;
  nafakaDurumu: string; // Devam eden nafaka (Var/Yok)

  // Adres ve İletişim
  il: string;
  ilce: string;
  adres: string;
  cepTelefonu: string;
  eposta: string;
  acilDurumKisisi: string;
  yakinlik: string;
  acilDurumTelefon: string;

  // Eğitim Bilgileri
  egitimler: SgkEgitim[]; // Birden fazla eklenebilir

  // MYK Mesleki Yeterlilik
  mykBelgesi: string; // Var/Hayır
  meslekAdi?: string;
  mykSeviye?: string;
  mykBelgeNo?: string;
  mykBaslangicTarihi?: string;
  mykBitisTarihi?: string;

  // Ödeme - Banka Bilgileri
  ibanNo: string;
  bankaAdi: string;
  bankaSube: string;

  // --- Adım 2: Kadro ve Kurum Bilgileri ---
  firmaAdi: string;
  subeAdi: string;
  departman: string;
  birim: string;
  gorevi: string;
  takimi: string;
  ekipSorumlusu: string;
  kadroStatusu: string;
  isyeriLokasyonu: string;
  masrafMerkezi: string;

  netMaasi: string;
  brutMaasi: string;
  yemekUcreti: string;
  yolUcreti: string;
  servisKullanimi: string;
  sabitEkOdeme: string;

  iseBaslamaTarihi: string;
  mesaiBaslangic: string;
  mesaiBitis: string;
  calismaTuru: string;
  istihdamTuru: string;
  iseAlimDurumu: string;

  epostaAcilacakMi: string;
  telefonHattiAcilacakMi: string;
  erpAcilacakMi: string;
  manyetikKart: string;
  yuzTanima: string;
  parmakIzi: string;
  otopark: string;
  ziyaretci: string;
  kartvizit: string;

  isgEkipman: string;
  demirbas: string;
  evraklar: EvrakDurumu[];
}

export interface FirmaBilgileri {
  vergiNo: string;
  firmaUnvani: string;
  sektor: string;
  calisanSayisi: string;
  subeSayisi: string;
  il: string;
  ilce: string;
  mahalle: string;
  adres: string;
  postaKodu: string;
  telefon: string;
  ePosta: string;
  webSitesi?: string;
  evraklar?: string[]; // yüklenen evrakların key'leri
}