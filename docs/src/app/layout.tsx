import type { Metadata } from "next";
import { inter } from "./fonts";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Toppings: Your web, your way",
  description: "Your web, your way.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          inter.className,
        )}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
