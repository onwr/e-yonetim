import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { v4 as uuidv4 } from "uuid";

const encoder = new TextEncoder();

async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    await jwtVerify(token, encoder.encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? uuidv4();
  const { pathname } = request.nextUrl;

  const baseResponse = NextResponse.next({
    request: { headers: new Headers(request.headers) },
  });
  baseResponse.headers.set("x-request-id", requestId);
  baseResponse.headers.set("X-Content-Type-Options", "nosniff");
  baseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  baseResponse.headers.set("X-Frame-Options", "DENY");

  const accessToken = request.cookies.get("ey_access_token")?.value;
  const refreshToken = request.cookies.get("ey_refresh_token")?.value;
  const jwtSecret = process.env.JWT_SECRET ?? "default_secret";
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET ?? "default_refresh_secret";

  // /panel koruması
  if (pathname.startsWith("/panel")) {
    // Access token geçerliyse devam et
    if (accessToken && (await verifyToken(accessToken, jwtSecret))) {
      return baseResponse;
    }

    // Access token geçersiz ama refresh token varsa - refresh et
    if (refreshToken && (await verifyToken(refreshToken, jwtRefreshSecret))) {
      // Refresh endpoint'ine yönlendir ve sonra tekrar /panel'e döndür
      const refreshUrl = new URL("/api/v1/auth/refresh", request.url);
      const refreshRes = await fetch(refreshUrl.toString(), {
        method: "POST",
        headers: { cookie: request.headers.get("cookie") ?? "" },
      });

      if (refreshRes.ok) {
        // Yeni cookie'leri al ve mevcut isteğe ekle
        const response = NextResponse.next({
          request: { headers: new Headers(request.headers) },
        });
        response.headers.set("x-request-id", requestId);

        // Refresh'ten gelen set-cookie header'larını kopyala
        const setCookie = refreshRes.headers.get("set-cookie");
        if (setCookie) {
          response.headers.set("set-cookie", setCookie);
        }
        return response;
      }
    }

    // Her ikisi de geçersiz → ana sayfaya yönlendir
    const redirectResponse = NextResponse.redirect(new URL("/", request.url));
    redirectResponse.cookies.delete("ey_access_token");
    redirectResponse.cookies.delete("ey_refresh_token");
    return redirectResponse;
  }

  // API koruması
  if (pathname.startsWith("/api/v1") && !pathname.startsWith("/api/v1/auth")) {
    const publicApiPrefixes = [
      "/api/v1/health",
      "/api/v1/ready",
      "/api/v1/docs",
      "/api/v1/referans",
    ];
    const isPublic = publicApiPrefixes.some((prefix) => pathname.startsWith(prefix));
    if (isPublic) return baseResponse;

    if (!accessToken || !(await verifyToken(accessToken, jwtSecret))) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Oturum bulunamadi veya suresi doldu." } },
        { status: 401 },
      );
    }
  }

  return baseResponse;
}

export const config = {
  matcher: ["/panel/:path*", "/api/v1/:path*"],
};
