import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toppings — Your YouTube, your way.",
  description:
    "A free, open-source browser extension. Audio mode, custom playback rates, looped segments, Shorts auto-scroll, playlist runtimes. Small. Considered. Out of your way.",
};

/**
 * Fonts are self-hosted via @font-face in globals.css (Inter 400/500/600/700/900
 * + JetBrains Mono 400/500). We previously used `next/font/google` for Inter,
 * but with the design-system handoff we now ship the exact woff2 files Claude
 * Design baked into the brand bundle — so the served typography matches the
 * design 1:1.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[--surface-page] text-[--fg-1] antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
