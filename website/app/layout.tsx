import type { Metadata } from "next";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";
import { WEBSITE_METADATA, WEBSITE_HTML_LANG } from "toppings-constants";

/**
 * Self-host the Inter (400/500/600/700/900) + JetBrains Mono (400/500)
 * woff2 files that ship with the design-system handoff. We use
 * `next/font/local` (not raw @font-face in CSS) so the served URLs pick
 * up Next's `basePath` automatically — otherwise `/fonts/...` 404s in
 * any deployment that isn't mounted at the site root.
 */
const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    { path: "./_fonts/inter-400.woff2", weight: "400", style: "normal" },
    { path: "./_fonts/inter-500.woff2", weight: "500", style: "normal" },
    { path: "./_fonts/inter-600.woff2", weight: "600", style: "normal" },
    { path: "./_fonts/inter-700.woff2", weight: "700", style: "normal" },
    { path: "./_fonts/inter-900.woff2", weight: "900", style: "normal" },
  ],
});

const jetbrainsMono = localFont({
  variable: "--font-jetbrains-mono",
  display: "swap",
  src: [
    {
      path: "./_fonts/jetbrains-mono-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./_fonts/jetbrains-mono-500.woff2",
      weight: "500",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: WEBSITE_METADATA.TITLE,
  description: WEBSITE_METADATA.DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={WEBSITE_HTML_LANG} className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[--surface-page] text-[--fg-1] antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
