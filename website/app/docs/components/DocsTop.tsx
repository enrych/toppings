import Image from "next/image";
import Link from "next/link";
import { BRAND_METADATA, LABEL, URL } from "@/constants/site";

export default function DocsTop() {
  return (
    <header className="docs-top">
      <div className="docs-top__inner">
        <Link href="/" className="docs-top__brand">
          <Image
            src={BRAND_METADATA.LOGO}
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
        <Link href={URL.GITHUB_REPO} target="_blank" className="lnk">
          {LABEL.SOURCE_CODE}
        </Link>
        <Link href={URL.SPONSOR_ME} target="_blank" className="lnk">
          {LABEL.BECOME_SPONSOR}
        </Link>
      </div>
    </header>
  );
}
