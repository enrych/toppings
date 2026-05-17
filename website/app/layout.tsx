import type { Metadata } from "next";
import localFont from "next/font/local";
import { Instrument_Serif, Geist } from "next/font/google";
import "./globals.css";
import { HTML_LANG, METADATA } from "@toppings/constants";

/**
 * Root layout. Sets HTML/body, loads self-hosted Inter + JetBrains Mono
 * via `next/font/local` (so basePath rewriting works automatically).
 *
 * Navbar + Footer live in `(marketing)/layout.tsx`. The /docs/* surface
 * provides its own chrome via `docs/layout.tsx`. This split keeps the
 * docs section visually independent of the marketing site while still
 * sharing tokens, fonts, and the global stylesheet.
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

/**
 * Rebrand display + UI faces (the "Reclaim, enacted" home). Instrument
 * Serif is the editorial display voice (open stand-in for PP Editorial
 * New); Geist is the grotesque UI face. JetBrains Mono above is reused
 * as the "keyboard voice". next/font/google self-hosts at build time so
 * basePath rewriting still works.
 */
const display = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const ui = Geist({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: METADATA.TITLE,
  description: METADATA.DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={HTML_LANG}
      className={`${inter.variable} ${jetbrainsMono.variable} ${display.variable} ${ui.variable}`}
    >
      <body className="min-h-screen bg-[--surface-page] text-[--fg-1] antialiased">
        {children}
      </body>
    </html>
  );
}
