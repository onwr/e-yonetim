import { NextRequest } from "next/server";
import { env } from "@/server/lib/env";
import { ApiError } from "@/server/lib/errors";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit(request: NextRequest, keyPrefix: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + env.API_RATE_LIMIT_WINDOW_MS });
    return;
  }

  current.count += 1;
  if (current.count > env.API_RATE_LIMIT_MAX) {
    throw new ApiError(429, "RATE_LIMITED", "Cok fazla istek gonderildi, lutfen daha sonra tekrar deneyin.");
  }
}
