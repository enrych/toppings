import Image from "next/image";
import Link from "next/link";
import toppingsLogo from "@/assets/brand/toppings-logo-512.png";
import { EXTERNAL_URL, BROWSER_TARGET } from "toppings-constants";

/**
 * Docs top bar — distinct from the marketing Navbar. Adds a "Docs" tag
 * pill next to the wordmark and a search affordance with a ⌘K hint
 * (placeholder for now; opens nothing). Source / Sponsor on the right.
 */
export default function DocsTop() {
  return (
    <header className="docs-top">
      <div className="docs-top__inner">
        <Link href="/" className="docs-top__brand">
          <Image
            src={toppingsLogo}
            alt="Toppings"
            width={28}
            height={28}
            priority
          />
          <span className="name">Toppings</span>
          <span className="tag">Docs</span>
        </Link>
        <div className="docs-top__spacer" />
        <button
          type="button"
          className="docs-search"
          aria-label="Search the docs"
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx={11} cy={11} r={7} />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <span className="placeholder">Search the wiki…</span>
          <kbd>⌘ K</kbd>
        </button>
        <Link
          href={EXTERNAL_URL.GITHUB_REPO}
          target={BROWSER_TARGET.BLANK}
          className="lnk"
        >
          Source
        </Link>
        <Link
          href={EXTERNAL_URL.SPONSOR}
          target={BROWSER_TARGET.BLANK}
          className="lnk"
        >
          Sponsor
        </Link>
      </div>
    </header>
  );
}
