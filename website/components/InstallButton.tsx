"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BROWSER_TARGET,
  WEBSITE_INSTALL_DESTINATION,
  WEBSITE_UA_PATTERN,
} from "toppings-constants";

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
  const [agent, setAgent] = useState<keyof typeof WEBSITE_INSTALL_DESTINATION>(
    "unknown",
  );

  useEffect(() => {
    const ua = navigator.userAgent;
    if (WEBSITE_UA_PATTERN.CHROMIUM_LIKE.test(ua)) setAgent("chrome");
    else if (WEBSITE_UA_PATTERN.FIREFOX_LIKE.test(ua)) setAgent("firefox");
    else setAgent("unknown");
  }, []);

  const sizing =
    size === "sm" ? { height: 40, padding: "0 18px", fontSize: 14 } : undefined;

  const store = WEBSITE_INSTALL_DESTINATION[agent];

  return (
    <Link
      href={store.url}
      target={BROWSER_TARGET.BLANK}
      className="btn btn--primary"
      style={sizing}
    >
      {store.label}
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
