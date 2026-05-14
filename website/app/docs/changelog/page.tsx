import Link from "next/link";
import Pager from "@/components/docs/Pager";
import {
  EXTENSION_VERSION,
  EXTERNAL_URL,
  BROWSER_TARGET,
  RELEASES,
  userFacingItems,
  type ReleaseItemKind,
} from "toppings-constants";

const KIND_TONE: Record<ReleaseItemKind, { label: string; bg: string; fg: string }> = {
  feat: { label: "New", bg: "rgba(252,169,41,0.12)", fg: "var(--ink)" },
  fix: { label: "Fix", bg: "rgba(10,10,10,0.06)", fg: "var(--fg-2)" },
  polish: { label: "Polish", bg: "rgba(10,10,10,0.06)", fg: "var(--fg-2)" },
  internal: { label: "Internal", bg: "rgba(10,10,10,0.04)", fg: "var(--fg-3)" },
};

/**
 * Changelog page — renders every entry from packages/constants/src/releases.ts.
 * The current EXTENSION_VERSION is highlighted with an amber chip; older
 * entries render in the same shape, just without the chip.
 */
export default function DocsChangelogPage() {
  return (
    <main className="docs-main">
      <div className="docs-crumbs">
        <Link href="/docs">Docs</Link>
        <span className="sep">/</span>
        <span>Reference</span>
        <span className="sep">/</span>
        <span className="current">Changelog</span>
      </div>

      <div className="docs-eyebrow">
        <span className="dot" />
        What changed, and when
      </div>

      <h1 className="docs-title">
        The <span className="amber-underline">changelog</span>.
      </h1>

      <p className="docs-lede">
        Every Toppings release in user-facing terms. The currently
        published version is{" "}
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
        <Link
          href={`${EXTERNAL_URL.GITHUB_REPO}/commits/main`}
          target={BROWSER_TARGET.BLANK}
        >
          GitHub history
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
                    {formatDate(release.date)}
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
                        background: KIND_TONE[item.kind].bg,
                        color: KIND_TONE[item.kind].fg,
                      }}
                    >
                      {KIND_TONE[item.kind].label}
                    </span>
                    <span className="changelog-entry__text">{item.text}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <Pager currentHref="/docs/changelog" />
    </main>
  );
}

/** "2026-05-15" → "May 15, 2026" */
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
