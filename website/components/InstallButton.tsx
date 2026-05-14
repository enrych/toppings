"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const STORES = {
  chrome: {
    url: "https://chrome.google.com/webstore/detail/toppings/aemiblppibhggpgijajindcmmomboibl",
    label: "Add to Chrome",
  },
  firefox: {
    url: "https://addons.mozilla.org/en-US/firefox/addon/toppings/",
    label: "Add to Firefox",
  },
  unknown: {
    url: "https://www.github.com/enrych/toppings",
    label: "Get Toppings",
  },
};

interface InstallButtonProps {
  size?: "sm" | "md";
}

/**
 * Browser-aware install CTA. Per the design system, the button is a solid
 * ink fill with a single amber accent on the trailing arrow — this is one of
 * the very few places amber is allowed to appear on the marketing site.
 *
 * No motion gimmicks (per the design's "no springs, no bounces, no parallax"
 * rule). Press state shifts the button down 1px via the `.btn:active`
 * rule in globals.css.
 */
export default function InstallButton({ size = "md" }: InstallButtonProps) {
  const [agent, setAgent] = useState<keyof typeof STORES>("unknown");

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/chrome|chromium|crios|edg|opr\//i.test(ua)) setAgent("chrome");
    else if (/firefox|fxios/i.test(ua)) setAgent("firefox");
    else setAgent("unknown");
  }, []);

  const sizing =
    size === "sm" ? { height: 40, padding: "0 18px", fontSize: 14 } : undefined;

  return (
    <Link
      href={STORES[agent].url}
      target="_blank"
      className="btn btn--primary"
      style={sizing}
    >
      {STORES[agent].label}
      <svg
        className="arrow"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={size === "sm" ? 2 : 2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
