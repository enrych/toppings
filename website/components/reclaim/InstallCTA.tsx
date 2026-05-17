"use client";
import { useEffect, useState } from "react";
import { INSTALL, UA_PATTERN } from "@toppings/constants";

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
    useState<keyof typeof INSTALL>("unknown");

  useEffect(() => {
    const ua = navigator.userAgent;
    if (UA_PATTERN.CHROMIUM_LIKE.test(ua)) setAgent("chrome");
    else if (UA_PATTERN.FIREFOX_LIKE.test(ua)) setAgent("firefox");
    else setAgent("unknown");
  }, []);

  const store = INSTALL[agent];

  return (
    <a
      href={store.url}
      target={"_blank"}
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
