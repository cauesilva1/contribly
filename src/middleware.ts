import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = [
  "/discover",
  "/swipe",
  "/for-you",
  "/projects/new",
  "/inbox",
  "/profile",
  "/onboarding",
  "/dashboard",
  "/matches",
];

function hasSessionCookie(req: NextRequest) {
  return Boolean(
    req.cookies.get("authjs.session-token")?.value ||
      req.cookies.get("__Secure-authjs.session-token")?.value ||
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !hasSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("auth", "required");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/discover/:path*",
    "/swipe",
    "/swipe/:path*",
    "/for-you",
    "/for-you/:path*",
    "/projects/new",
    "/inbox",
    "/inbox/:path*",
    "/profile",
    "/profile/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/matches/:path*",
  ],
};
