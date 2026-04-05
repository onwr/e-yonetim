import { NextResponse } from "next/server";

type ApiSuccessPayload<T> = {
  success: true;
  data: T;
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

export function ok<T>(data: T, meta?: Record<string, unknown>) {
  const payload: ApiSuccessPayload<T> = { success: true, data, ...(meta ? { meta } : {}) };
  return NextResponse.json(payload, { status: 200 });
}

export function created<T>(data: T, meta?: Record<string, unknown>) {
  const payload: ApiSuccessPayload<T> = { success: true, data, ...(meta ? { meta } : {}) };
  return NextResponse.json(payload, { status: 201 });
}

export function fail(status: number, code: string, message: string, details?: unknown) {
  const payload: ApiErrorPayload = { success: false, error: { code, message, details } };
  return NextResponse.json(payload, { status });
}
