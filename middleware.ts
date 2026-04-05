import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

function hasAuthCookie(request: NextRequest) {
  return Boolean(request.cookies.get("ey_access_token")?.value);
}

export function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? uuidv4();
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  response.headers.set("x-request-id", requestId);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");

  if (request.nextUrl.pathname.startsWith("/panel") && !hasAuthCookie(request)) {
    return NextResponse.redirect(new URL("/giris", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/api/v1") && !request.nextUrl.pathname.startsWith("/api/v1/auth")) {
    const publicApiPrefixes = [
      "/api/v1/health",
      "/api/v1/ready",
      "/api/v1/docs",
      "/api/v1/referans",
    ];
    const isPublic = publicApiPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
    if (isPublic) {
      return response;
    }
    if (!hasAuthCookie(request)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Oturum bulunamadi.",
          },
        },
        { status: 401 },
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/panel/:path*", "/api/v1/:path*"],
};
