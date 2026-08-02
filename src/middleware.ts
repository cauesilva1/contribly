import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const protectedPrefixes = [
  "/swipe",
  "/for-you",
  "/projects/new",
  "/inbox",
  "/profile",
  "/onboarding",
  "/dashboard",
  "/matches",
  "/metrics",
];

/**
 * UX-only gate: checks that a session *cookie exists*, not that the Session row
 * is valid. Real authorization MUST happen in Server Actions / Route Handlers
 * via requireUser() / auth() / requireApiUser(). Never rely on this alone.
 */
function hasSessionCookie(req: NextRequest) {
  return Boolean(
    req.cookies.get("authjs.session-token")?.value ||
      req.cookies.get("__Secure-authjs.session-token")?.value ||
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value
  );
}

function stripLocale(pathname: string) {
  // Active locales + legacy prefixes we still strip for auth checks / redirects
  const prefixes = [...routing.locales, "pt", "en"];
  for (const locale of prefixes) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || "/";
    }
  }
  return pathname;
}

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Legacy PT routes → English (unprefixed)
  if (pathname === "/pt" || pathname.startsWith("/pt/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/pt/, "") || "/";
    return NextResponse.redirect(url);
  }

  const pathWithoutLocale = stripLocale(pathname);
  const isProtected = protectedPrefixes.some(
    (prefix) =>
      pathWithoutLocale === prefix ||
      pathWithoutLocale.startsWith(`${prefix}/`)
  );

  if (isProtected && !hasSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("auth", "required");
    return NextResponse.redirect(url);
  }

  return intlMiddleware(req);
}

export const config = {
  // "pt" kept in matcher only to catch legacy URLs and redirect
  matcher: ["/", "/(pt|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
