import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import { site } from "@/lib/site";
import "./globals.css";

const display = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    { path: "./_fonts/inter-400.woff2", weight: "400" },
    { path: "./_fonts/inter-500.woff2", weight: "500" },
  ],
});

const mono = localFont({
  variable: "--font-mono",
  display: "swap",
  src: [{ path: "./_fonts/jetbrains-mono-400.woff2", weight: "400" }],
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  metadataBase: new URL(site.url),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
