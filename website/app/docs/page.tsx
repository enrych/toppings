import Link from "next/link";
import Pager from "@/components/docs/Pager";
import { DocsInlineParts, DocsRichText } from "@/lib/docs-rich-text";
import { URLS } from "@/lib/urls";
import { FEATURES } from "@/lib/features.data";
import { ROUTE } from "@/lib/site.data";
import { DOCS_PAGE } from "./pages.data";
import {
  DOCS_INSTALL,
  DOCS_INSTALL_EDIT_PATH,
  DOCS_INSTALL_TOC,
} from "./install/data";
import { formatTodayReviewDate } from "@/lib/dates";

export default function DocsInstallPage() {
  const page = DOCS_PAGE.INSTALL;
  const { WHAT, INSTALL, FIRST_RUN, PRIVACY, NEXT } = DOCS_INSTALL;

  return (
    <>
      <main className="docs-main">
        <div className="docs-crumbs">
          <Link href={ROUTE.DOCS}>Docs</Link>
          <span className="sep">/</span>
          <Link href={ROUTE.DOCS}>{page.CRUMB_GROUP}</Link>
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

        <p className="docs-lede">{page.LEDE}</p>

        <div className="docs-prose">
          <h2 id="what">{WHAT.HEADING}</h2>
          <p>
            {WHAT.INTRO_PREFIX}{" "}
            {FEATURES.map((feature, i) => (
              <span key={feature.name}>
                {i > 0 && (i === FEATURES.length - 1 ? ", and " : ", ")}
                <strong>{feature.name}</strong>
              </span>
            ))}
            {WHAT.INTRO_SUFFIX}
            <DocsInlineParts parts={[WHAT.PRIVACY_LINK]} />
            {WHAT.SUFFIX_AFTER_LINK}
          </p>

          <div className="callout">
            <span className="ico">
              <svg viewBox="0 0 24 24" aria-hidden>
                <circle cx={12} cy={12} r={10} />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </span>
            <p>
              <DocsInlineParts parts={WHAT.CALLOUT} />
            </p>
          </div>

          <h2 id="install">{INSTALL.HEADING}</h2>
          <div className="docs-steps">
            {INSTALL.STEPS.map((step) => (
              <div className="docs-step" key={step.title}>
                <div>
                  <h4>{step.title}</h4>
                  <p>
                    <DocsInlineParts parts={step.body} />
                  </p>
                </div>
              </div>
            ))}
          </div>

          <h2 id="first">{FIRST_RUN.HEADING}</h2>
          <DocsRichText paragraphs={FIRST_RUN.PARAGRAPHS} />

          <h2 id="privacy">{PRIVACY.HEADING}</h2>
          <p>
            <DocsInlineParts parts={PRIVACY.BODY} />
          </p>

          <h2 id="next">{NEXT.HEADING}</h2>
          <ul>
            {NEXT.ITEMS.map((parts, i) => (
              <li key={i}>
                <DocsInlineParts parts={parts} />
              </li>
            ))}
          </ul>
        </div>

        <Pager currentHref={ROUTE.DOCS} />

        <div className="docs-foot">
          <span>Last updated {formatTodayReviewDate()}</span>
          <Link
            href={`${URLS.GITHUB_REPO}/edit/main/${DOCS_INSTALL_EDIT_PATH}`}
            target="_blank"
          >
            Edit this page on GitHub →
          </Link>
        </div>
      </main>

      <aside className="docs-toc">
        <div className="docs-toc__title">On this page</div>
        <div className="docs-toc__list">
          {DOCS_INSTALL_TOC.map((item, i) => (
            <a
              key={item.id}
              className={"docs-toc__link" + (i === 0 ? " active" : "")}
              href={`#${item.id}`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </aside>
    </>
  );
}
