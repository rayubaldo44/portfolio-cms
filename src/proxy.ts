import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "portfolio_session";
const LOGIN_PATH = "/admin-login";

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const cspHeader = [
    "default-src 'self'",
    // Spotify's current iFrame API bundle uses eval, including in production.
    `script-src 'self' https://open.spotify.com https://embed-cdn.spotifycdn.com 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src https://open.spotify.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", cspHeader);

  const { pathname } = request.nextUrl;

  const isAdminPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin/projects") ||
    pathname.startsWith("/admin/experience") ||
    pathname.startsWith("/admin/stack") ||
    pathname.startsWith("/admin/certifications") ||
    pathname.startsWith("/admin/resources");

  if (!isAdminPage) {
    return response;
  }

  const session = request.cookies.get(SESSION_COOKIE);
  if (!session) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
