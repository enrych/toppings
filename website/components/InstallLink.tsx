"use client";
import { useSyncExternalStore } from "react";
import { site } from "@/lib/site";

const stores = {
  chrome: { href: site.chrome, label: "Add to Chrome" },
  firefox: { href: site.firefox, label: "Add to Firefox" },
} as const;

type Store = keyof typeof stores;
const noSubscribe = () => () => {};
const readStore = (): Store => (/firefox|fxios/i.test(navigator.userAgent) ? "firefox" : "chrome");
const serverStore = (): Store => "chrome";

export default function InstallLink() {
  const store = useSyncExternalStore(noSubscribe, readStore, serverStore);

  return (
    <a href={stores[store].href} target="_blank" rel="noopener noreferrer" className="btn btn--solid">
      {stores[store].label}
      <span className="arrow" aria-hidden>
        →
      </span>
    </a>
  );
}
