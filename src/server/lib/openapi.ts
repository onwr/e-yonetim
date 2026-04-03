export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "E-Yonetim API",
    version: "1.0.0",
    description: "E-Yonetim backend API dokumantasyonu",
  },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/auth/register": { post: { summary: "Kullanici kaydi" } },
    "/auth/login": { post: { summary: "Giris istegi" } },
    "/auth/verify-sms": { post: { summary: "SMS dogrulama" } },
    "/subeler": { get: { summary: "Sube listesi" }, post: { summary: "Sube olustur" } },
    "/departmanlar": { get: { summary: "Departman listesi" }, post: { summary: "Departman olustur" } },
    "/birimler": { get: { summary: "Birim listesi" }, post: { summary: "Birim olustur" } },
    "/personel": {
      get: {
        summary: "Personel listesi",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "pageSize", schema: { type: "integer", default: 20 } },
          { in: "query", name: "q", schema: { type: "string" } },
        ],
      },
      post: { summary: "Personel olustur" },
    },
    "/talepler": {
      get: {
        summary: "Talep listesi",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "pageSize", schema: { type: "integer", default: 20 } },
          { in: "query", name: "type", schema: { type: "string", enum: ["sgk-giris", "sgk-cikis"] } },
          { in: "query", name: "status", schema: { type: "string", enum: ["BEKLEYEN", "ONAYLANAN", "REDDEDİLEN"] } },
        ],
      },
    },
    "/yetkililer": { get: { summary: "Yetkili listesi" } },
    "/puantaj": { get: { summary: "Puantaj getir" }, put: { summary: "Puantaj guncelle" } },
  },
};
