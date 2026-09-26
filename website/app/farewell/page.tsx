import type { Metadata } from "next";
import Notice from "@/components/Notice";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Toppings removed" };

export default function Farewell() {
  return (
    <Notice
      kicker="Sorry to see you go"
      title={
        <>
          We&apos;ll miss <em>you</em>.
        </>
      }
      body="If something didn't work, or something was missing, a short email helps more than you'd think."
      cta={{ label: "Send feedback", href: site.feedback }}
    />
  );
}
