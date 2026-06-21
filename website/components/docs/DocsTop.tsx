import Image from "next/image";
import Link from "next/link";
import toppingsLogo from "@/assets/brand/toppings-logo-512.png";
import { BRAND_METADATA } from "@/lib/brand";
import { URLS } from "@/lib/urls";
import { LABEL } from "@/lib/site.data";

export default function DocsTop() {
  return (
    <header className="docs-top">
      <div className="docs-top__inner">
        <Link href="/" className="docs-top__brand">
          <Image
            src={toppingsLogo}
            alt={BRAND_METADATA.NAME}
            width={28}
            height={28}
            priority
          />
          <span className="name">{BRAND_METADATA.NAME}</span>
          <span className="tag">{LABEL.DOCS}</span>
        </Link>
        <div className="docs-top__spacer" />
        <button
          type="button"
          className="docs-search"
          aria-label={LABEL.SEARCH_DOCS}
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx={11} cy={11} r={7} />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <span className="placeholder">{LABEL.SEARCH_DOCS}</span>
          <kbd>⌘ K</kbd>
        </button>
        <Link
          href={URLS.GITHUB_REPO}
          target={"_blank"}
          className="lnk"
        >
          {LABEL.SOURCE_CODE}
        </Link>
        <Link
          href={URLS.SPONSOR_ME}
          target={"_blank"}
          className="lnk"
        >
          {LABEL.BECOME_SPONSOR}
        </Link>
      </div>
    </header>
  );
}
