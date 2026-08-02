import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/site-header";
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
  metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "OpenMatch",
    template: "%s · OpenMatch",
  },
  description:
    "Conecte desenvolvedores a projetos open source com filtros, swipe e convites.",
  applicationName: "OpenMatch",
  openGraph: {
    title: "OpenMatch",
    description:
      "Matchmaking open source: descubra projetos, dê swipe e receba convites.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenMatch",
    description:
      "Matchmaking open source: descubra projetos, dê swipe e receba convites.",
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
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
