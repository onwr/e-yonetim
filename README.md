# E-Yonetim

Next.js App Router uzerinde calisan E-Yonetim uygulamasi. Bu surumde backend API, kimlik/oturum, RBAC, MySQL veri modeli ve kalite kapilari projeye eklendi.

## Teknoloji

- Next.js 16 (App Router)
- TypeScript
- MySQL + Prisma
- Zod (istek dogrulama)
- Vitest (test)

## Kurulum

1. Bagimliliklari kurun:

```bash
npm install
```

2. Ortam degiskenlerini hazirlayin:

```bash
copy .env.example .env
```

3. Veritabanini hazirlayin:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

4. Uygulamayi baslatin:

```bash
npm run dev
```

## API

- Base URL: `/api/v1`
- API dokumantasyonu: `/api/v1/docs`
- Legacy uyumluluk: `/api/vergi-daireleri`

## Kalite Komutlari

```bash
npm run typecheck
npm run lint
npm run test
```

## CI

GitHub Actions workflow dosyasi: `.github/workflows/ci.yml`

Pipeline adimlari:
- Install
- Prisma generate
- Typecheck
- Lint
- Test
