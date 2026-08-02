import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

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

function stripLocale(pathname: string) {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || "/";
    }
  }
  return pathname;
}

function localeFromPath(pathname: string) {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return routing.defaultLocale;
}

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const pathWithoutLocale = stripLocale(pathname);
  const isProtected = protectedPrefixes.some(
    (prefix) =>
      pathWithoutLocale === prefix ||
      pathWithoutLocale.startsWith(`${prefix}/`)
  );

  if (isProtected && !hasSessionCookie(req)) {
    const locale = localeFromPath(pathname);
    const url = req.nextUrl.clone();
    url.pathname =
      locale === routing.defaultLocale ? "/auth" : `/${locale}/auth`;
    url.searchParams.set("auth", "required");
    return NextResponse.redirect(url);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/", "/(pt|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
