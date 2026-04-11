export interface RegisterRequestDTO {
  adSoyad: string;
  tckn: string;
  eposta: string;
  telefon: string;
  sifre: string;
  kvkkOnay: boolean;
}
export interface RegisterResponseDTO {
  success: boolean;
  message: string;
  telefon: string; 
  firmaKodu?: string;
  smsBypassed?: boolean;
}
export interface LoginRequestDTO {
  firmaKodu: string;
  tckn: string;
  sifre: string;
}
export interface LoginResponseDTO {
  success: boolean;
  message: string;
  token?: string; 
  telefon?: string;       // masked - display only
  rawTelefon?: string;    // real - used for SMS verify API
  smsBypassed?: boolean;
}
export interface SmsVerifyRequestDTO {
  telefon: string;
  smsKodu: string;
  type: "register" | "login" | "forgot_password";
}
export interface SmsVerifyResponseDTO {
  success: boolean;
  message: string;
  firmaKodu?: string; 
  token?: string; 
}
