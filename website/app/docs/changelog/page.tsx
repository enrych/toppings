import type { Metadata } from "next";
import Link from "next/link";
import DocsPageHeader from "../components/DocsPageHeader";
import Pager from "../components/Pager";
import { EXTENSION_VERSION, ROUTE, URL } from "@/constants/site";
import { KIND_TONE, PAGE, RELEASES } from "./data";

export const metadata: Metadata = {
  title: "Toppings — Changelog",
  description: "Release history for Toppings in user-facing terms.",
};

function formatReleaseDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function DocsChangelogPage() {
  return (
    <main className="docs-main">
      <DocsPageHeader
        {...PAGE}
        LEDE={
          <>
            {PAGE.LEDE_BEFORE}
            <code
              style={{
                font: "500 14px/1 var(--font-mono)",
                background: "rgba(10,10,10,.06)",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              v{EXTENSION_VERSION}
            </code>
            . For commits and PRs see the{" "}
            <Link href={URL.GITHUB_COMMITS_MAIN} target="_blank">
              {PAGE.LEDE_LINK_LABEL}
            </Link>
            .
          </>
        }
      />

      <div className="changelog-list">
        {RELEASES.map((release) => {
          const isCurrent = release.VERSION === EXTENSION_VERSION;
          const items = release.ITEMS.filter((i) => i.KIND !== "internal");
          return (
            <article
              key={release.VERSION}
              id={`v${release.VERSION}`}
              className="changelog-entry"
            >
              <header className="changelog-entry__head">
                <div className="changelog-entry__meta">
                  <span
                    className={
                      "changelog-entry__version" +
                      (isCurrent ? " changelog-entry__version--current" : "")
                    }
                  >
                    v{release.VERSION}
                  </span>
                  <span className="changelog-entry__date">
                    {formatReleaseDate(release.DATE)}
                  </span>
                  {isCurrent && (
                    <span className="changelog-entry__chip">Current</span>
                  )}
                </div>
                {release.TITLE && (
                  <h2 className="changelog-entry__title">{release.TITLE}</h2>
                )}
              </header>
              <ul className="changelog-entry__items">
                {items.map((item, i) => (
                  <li key={i} className="changelog-entry__item">
                    <span
                      className="changelog-entry__kind"
                      style={{
                        background: KIND_TONE[item.KIND].BG,
                        color: KIND_TONE[item.KIND].FG,
                      }}
                    >
                      {KIND_TONE[item.KIND].LABEL}
                    </span>
                    <span className="changelog-entry__text">{item.TEXT}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <Pager currentHref={ROUTE.DOCS_CHANGELOG} />
    </main>
  );
}
