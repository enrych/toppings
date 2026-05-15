"use client";
import { useEffect, useState } from "react";
import {
  BROWSER_TARGET,
  WEBSITE_INSTALL_DESTINATION,
  WEBSITE_UA_PATTERN,
} from "toppings-constants";

/**
 * Browser-aware primary CTA, restyled for the dark rebrand. Same
 * single-ember-accent rule as the original InstallButton (the arrow is
 * the one ember mark) — just on bone instead of cream.
 */
export default function InstallCTA({
  variant = "solid",
}: {
  variant?: "solid" | "ghost";
}) {
  const [agent, setAgent] =
    useState<keyof typeof WEBSITE_INSTALL_DESTINATION>("unknown");

  useEffect(() => {
    const ua = navigator.userAgent;
    if (WEBSITE_UA_PATTERN.CHROMIUM_LIKE.test(ua)) setAgent("chrome");
    else if (WEBSITE_UA_PATTERN.FIREFOX_LIKE.test(ua)) setAgent("firefox");
    else setAgent("unknown");
  }, []);

  const store = WEBSITE_INSTALL_DESTINATION[agent];

  return (
    <a
      href={store.url}
      target={BROWSER_TARGET.BLANK}
      rel="noopener noreferrer"
      className={`r-btn r-btn--${variant}`}
    >
      {store.label}
      <span className="r-arrow" aria-hidden>
        →
      </span>
    </a>
  );
}
