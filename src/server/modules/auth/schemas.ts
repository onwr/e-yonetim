import { z } from "zod";

export const registerSchema = z.object({
  adSoyad: z.string().min(3),
  tckn: z.string().regex(/^\d{11}$/),
  eposta: z.string().email(),
  telefon: z.string().min(10),
  sifre: z.string().min(8),
  kvkkOnay: z.boolean().refine((value) => value === true, "KVKK onayi zorunludur."),
});

export const loginSchema = z.object({
  firmaKodu: z.string().regex(/^\d{5}$/),
  tckn: z.string().regex(/^\d{11}$/),
  sifre: z.string().min(6),
});

export const verifySmsSchema = z.object({
  telefon: z.string().min(10),
  smsKodu: z.string().regex(/^\d{6}$/),
  type: z.enum(["register", "login", "forgot_password"]),
});

export const resendSmsSchema = z.object({
  telefon: z.string().min(10),
  type: z.enum(["register", "login", "forgot_password"]),
});

export const forgotPasswordSchema = z.object({
  firmaKodu: z.string().regex(/^\d{5}$/),
  tckn: z.string().regex(/^\d{11}$/),
  telefon: z.string().min(10),
});

export const resetPasswordSchema = z.object({
  telefon: z.string().min(10),
  yeniSifre: z.string().min(6),
});

export const forgotFirmaKoduSchema = z.object({
  tckn: z.string().regex(/^\d{11}$/),
  telefon: z.string().min(10),
});
