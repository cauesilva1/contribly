import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Contribly",
    template: "%s · Contribly",
  },
  applicationName: "Contribly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
