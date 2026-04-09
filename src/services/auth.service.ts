import { 
  RegisterRequestDTO, 
  RegisterResponseDTO, 
  LoginRequestDTO, 
  LoginResponseDTO,
  SmsVerifyRequestDTO,
  SmsVerifyResponseDTO
} from "@/types/auth.types";

async function requestJson<T>(url: string, payload?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const json = (await response.json()) as {
    success: boolean;
    data?: T;
    error?: { message?: string };
  };

  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error?.message ?? "Istek basarisiz oldu.");
  }

  return json.data;
}

export const AuthService = {
  async register(data: RegisterRequestDTO): Promise<RegisterResponseDTO> {
    const apiData = await requestJson<{ message: string; telefon: string; firmaKodu?: string; smsBypassed?: boolean }>(
      "/api/v1/auth/register",
      data,
    );
    return {
      success: true,
      message: apiData.message,
      telefon: apiData.telefon,
      firmaKodu: apiData.firmaKodu,
      smsBypassed: apiData.smsBypassed,
    };
  },
  async login(data: LoginRequestDTO): Promise<LoginResponseDTO> {
    const apiData = await requestJson<{ message: string; telefon: string; maskedTelefon?: string; smsBypassed?: boolean }>(
      "/api/v1/auth/login",
      data,
    );
    return {
      success: true,
      message: apiData.message,
      telefon: apiData.maskedTelefon ?? apiData.telefon, // display (masked)
      rawTelefon: apiData.telefon,                       // real phone for verify
      smsBypassed: apiData.smsBypassed,
    };
  },
  async verifySms(data: SmsVerifyRequestDTO): Promise<SmsVerifyResponseDTO> {
    const apiData = await requestJson<{ message: string; firmaKodu?: string; token?: string }>(
      "/api/v1/auth/verify-sms",
      data,
    );
    return {
      success: true,
      message: apiData.message,
      firmaKodu: apiData.firmaKodu,
      token: apiData.token,
    };
  },
  async resendSms(data: { telefon: string; type: "register" | "login" | "forgot_password" }): Promise<{ success: boolean; message: string }> {
    const apiData = await requestJson<{ message: string }>("/api/v1/auth/resend-sms", data);
    return { success: true, message: apiData.message };
  },
  async forgotFirmaKodu(data: { tckn: string; telefon: string }): Promise<{ success: boolean; message: string }> {
    const apiData = await requestJson<{ message: string }>("/api/v1/auth/forgot-firma-kodu", data);
    return { success: true, message: apiData.message };
  },
  async sendForgotPasswordSms(data: { firmaKodu: string; tckn: string; telefon: string }): Promise<{ success: boolean; message: string; telefon: string }> {
    const apiData = await requestJson<{ message: string; telefon: string }>("/api/v1/auth/forgot-password-sms", data);
    return { success: true, message: apiData.message, telefon: apiData.telefon };
  },
  async resetPassword(data: { telefon: string; yeniSifre: string }): Promise<{ success: boolean; message: string }> {
    const apiData = await requestJson<{ message: string }>("/api/v1/auth/reset-password", data);
    return { success: true, message: apiData.message };
  }
};