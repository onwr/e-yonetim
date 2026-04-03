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
    const apiData = await requestJson<{ message: string; telefon: string; smsBypassed?: boolean }>(
      "/api/v1/auth/login",
      data,
    );
    return {
      success: true,
      message: apiData.message,
      telefon: apiData.telefon,
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
  async resendSms(data: { telefon: string; type: "register" | "login" }): Promise<{ success: boolean; message: string }> {
    const apiData = await requestJson<{ message: string }>("/api/v1/auth/resend-sms", data);
    return { success: true, message: apiData.message };
  }
};