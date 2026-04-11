import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { env } from "@/server/lib/env";
import { unauthorized } from "@/server/lib/errors";

const ACCESS_COOKIE = "ey_access_token";
const REFRESH_COOKIE = "ey_refresh_token";
const encoder = new TextEncoder();

export type SessionPayload = {
  sub: string;
  tenantId: string;
  role?: string;
};

async function signToken(payload: SessionPayload, secret: string, expiresIn: string) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encoder.encode(secret));
}

export async function issueAuthCookies(payload: SessionPayload) {
  const cookieStore = await cookies();
  const accessToken = await signToken(payload, env.JWT_SECRET, "60m");
  const refreshToken = await signToken(payload, env.JWT_REFRESH_SECRET, "7d");

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 60 dakika
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getSessionFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!token) {
    throw unauthorized();
  }

  try {
    const { payload } = await jwtVerify(token, encoder.encode(env.JWT_SECRET));
    return payload as SessionPayload;
  } catch {
    throw unauthorized("Oturum gecersiz veya suresi dolmus.");
  }
}

export async function readRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE)?.value;
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, encoder.encode(env.JWT_REFRESH_SECRET));
  return payload as SessionPayload;
}
