export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new ApiError(400, "BAD_REQUEST", message, details);

export const unauthorized = (message = "Yetkisiz islem.") =>
  new ApiError(401, "UNAUTHORIZED", message);

export const forbidden = (message = "Bu islem icin yetkiniz yok.") =>
  new ApiError(403, "FORBIDDEN", message);

export const notFound = (message = "Kayit bulunamadi.") =>
  new ApiError(404, "NOT_FOUND", message);

export const conflict = (message = "Kayit zaten mevcut.") =>
  new ApiError(409, "CONFLICT", message);

export const validationFailed = (details: unknown) =>
  new ApiError(422, "VALIDATION_ERROR", "Gonderilen veri dogrulanamadi.", details);
