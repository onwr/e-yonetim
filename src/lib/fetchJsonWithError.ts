export class ApiFetchError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiFetchError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type ApiSuccessPayload<T> = {
  success: true;
  data?: T;
  meta?: Record<string, unknown>;
};

type ApiErrorPayload = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type ApiEnvelope<T> = ApiSuccessPayload<T> | ApiErrorPayload;

/**
 * `/api/v1/*` JSON sozlesmesi: { success, data } veya { success, error }.
 * Varsayilan: credentials: "include".
 */
export async function fetchJsonWithError<T>(url: string, init?: RequestInit): Promise<T> {
  const merged: RequestInit = { credentials: "include", ...init };
  let response: Response;
  try {
    response = await fetch(url, merged);
  } catch {
    throw new ApiFetchError("Baglanti hatasi olustu.", 0);
  }

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      throw new ApiFetchError(
        response.ok ? "Yanit formati gecersiz." : `Sunucu hatasi (${response.status}).`,
        response.status,
      );
    }
  }

  if (parsed && typeof parsed === "object" && "success" in parsed) {
    const body = parsed as ApiEnvelope<T>;
    if (!body.success) {
      throw new ApiFetchError(
        body.error.message || "Islem basarisiz.",
        response.status,
        body.error.code,
        body.error.details,
      );
    }
    return body.data as T;
  }

  if (!response.ok) {
    throw new ApiFetchError(`Sunucu hatasi (${response.status}).`, response.status);
  }

  throw new ApiFetchError("Yanit formati gecersiz.", response.status);
}

export async function fetchJsonSafe<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    return await fetchJsonWithError<T>(url, init);
  } catch {
    return null;
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiFetchError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
