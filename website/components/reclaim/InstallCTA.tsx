"use client";
import { useEffect, useState } from "react";
import { STORE_CTA, UA_PATTERN } from "@/constants/site";

export default function InstallCTA({
  variant = "solid",
}: {
  variant?: "solid" | "ghost";
}) {
  const [agent, setAgent] =
    useState<keyof typeof STORE_CTA>("FALLBACK");

  useEffect(() => {
    const ua = navigator.userAgent;
    if (UA_PATTERN.CHROMIUM_LIKE.test(ua)) setAgent("CHROME");
    else if (UA_PATTERN.FIREFOX_LIKE.test(ua)) setAgent("FIREFOX");
    else setAgent("FALLBACK");
  }, []);

  const store = STORE_CTA[agent];

  return (
    <a
      href={store.href}
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
