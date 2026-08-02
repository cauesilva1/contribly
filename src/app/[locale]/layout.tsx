import { Suspense } from "react";
import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { WelcomePartyGate } from "@/components/welcome-party-gate";
import { routing } from "@/i18n/routing";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    description: t("description"),
    openGraph: {
      locale: "en_US",
      // locale: locale === "pt" ? "pt_BR" : "en_US",
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang="en">
      {/* <html lang={locale === "pt" ? "pt-BR" : "en"}> */}
      <body className={`${display.variable} ${sans.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen">
            <SiteHeader />
            <main>{children}</main>
          </div>
          <Suspense fallback={null}>
            <WelcomePartyGate />
          </Suspense>
          <Toaster richColors position="top-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
