import type { Metadata } from "next";
import Notice from "@/components/Notice";

export const metadata: Metadata = { title: "Toppings installed" };

export default function Greetings() {
  return (
    <Notice
      kicker="toppings installed"
      title="you're all set."
      body="Open any YouTube video and press B. Everything else is in the docs."
      cta={{ label: "Read the docs", href: "/docs" }}
    />
  );
}
