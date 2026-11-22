import type { Metadata } from "next";
import Notice from "@/components/Notice";

export const metadata: Metadata = { title: "Toppings installed" };

export default function Greetings() {
  return (
    <Notice
      kicker="Toppings installed"
      title={
        <>
          You&apos;re all <em>set</em>.
        </>
      }
      body="Open any YouTube video. The controls sit next to YouTube's own, and the presets are in the popup."
      cta={{ label: "Read the docs", href: "/docs" }}
    />
  );
}
