import Link from "next/link";
import Pager from "@/components/docs/Pager";
import { EXTENSION_VERSION } from "@/lib/version";
import { URLS } from "@/lib/urls";
import { RELEASES } from "@/lib/releases.data";
import { userFacingItems } from "@/lib/releases";
import { ROUTE } from "@/lib/site.data";
import { DOCS_PAGE } from "../pages.data";
import { DOCS_CHANGELOG_KIND_TONE } from "./kind-tone.data";
import { formatReleaseDate } from "@/lib/dates";

export default function DocsChangelogPage() {
  const page = DOCS_PAGE.CHANGELOG;

  return (
    <main className="docs-main">
      <div className="docs-crumbs">
        <Link href={ROUTE.DOCS}>Docs</Link>
        <span className="sep">/</span>
        <span>{page.CRUMB_GROUP}</span>
        <span className="sep">/</span>
        <span className="current">{page.CRUMB_CURRENT}</span>
      </div>

      <div className="docs-eyebrow">
        <span className="dot" />
        {page.EYEBROW}
      </div>

      <h1 className="docs-title">
        {page.TITLE_BEFORE}
        <span className="amber-underline">{page.TITLE_HIGHLIGHT}</span>
        {page.TITLE_AFTER}
      </h1>

      <p className="docs-lede">
        {page.LEDE_BEFORE}
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
        <Link href={URLS.GITHUB_COMMITS_MAIN} target="_blank">
          {page.LEDE_LINK_LABEL}
        </Link>
        .
      </p>

      <div className="changelog-list">
        {RELEASES.map((release) => {
          const isCurrent = release.version === EXTENSION_VERSION;
          const items = userFacingItems(release.items);
          return (
            <article
              key={release.version}
              id={`v${release.version}`}
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
                    v{release.version}
                  </span>
                  <span className="changelog-entry__date">
                    {formatReleaseDate(release.date)}
                  </span>
                  {isCurrent && (
                    <span className="changelog-entry__chip">Current</span>
                  )}
                </div>
                {release.title && (
                  <h2 className="changelog-entry__title">{release.title}</h2>
                )}
              </header>
              <ul className="changelog-entry__items">
                {items.map((item, i) => (
                  <li key={i} className="changelog-entry__item">
                    <span
                      className="changelog-entry__kind"
                      style={{
                        background: DOCS_CHANGELOG_KIND_TONE[item.kind].bg,
                        color: DOCS_CHANGELOG_KIND_TONE[item.kind].fg,
                      }}
                    >
                      {DOCS_CHANGELOG_KIND_TONE[item.kind].label}
                    </span>
                    <span className="changelog-entry__text">{item.text}</span>
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
