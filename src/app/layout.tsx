import type { Metadata } from "next";
import { Suspense } from "react";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { WelcomePartyGate } from "@/components/welcome-party-gate";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Contribly",
    template: "%s · Contribly",
  },
  description:
    "Conecte desenvolvedores a projetos open source com filtros, swipe e convites.",
  applicationName: "Contribly",
  openGraph: {
    title: "Contribly",
    description:
      "Descubra projetos open source, dê swipe e receba convites de mantenedores.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contribly",
    description:
      "Descubra projetos open source, dê swipe e receba convites de mantenedores.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${display.variable} ${sans.variable} antialiased`}>
        <div className="min-h-screen pb-20 md:pb-0">
          <SiteHeader />
          <main>{children}</main>
        </div>
        <Suspense fallback={null}>
          <WelcomePartyGate />
        </Suspense>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
