import Link from "next/link";
import Pager from "@/components/docs/Pager";
import { EXTERNAL_URL } from "@toppings/constants";

/**
 * Docs · Getting Started · Install. Replaces the legacy GitHub-hosted
 * wiki page with a modern, non-technical-user-friendly walkthrough on
 * the marketing site. Content rewritten from the old wiki, brought in
 * line with the current product (Audio Mode, single ⇧A shortcut, etc.).
 */
export default function DocsInstallPage() {
  return (
    <>
      <main className="docs-main">
        <div className="docs-crumbs">
          <Link href="/docs">Docs</Link>
          <span className="sep">/</span>
          <Link href="/docs">Getting started</Link>
          <span className="sep">/</span>
          <span className="current">Install Toppings</span>
        </div>

        <div className="docs-eyebrow">
          <span className="dot" />
          Getting started · 01
        </div>

        <h1 className="docs-title">
          Install <span className="amber-underline">Toppings</span> in 60 seconds.
        </h1>

        <p className="docs-lede">
          Toppings ships on the official Chrome and Firefox stores. Install it
          the normal way — no sideloading, no developer mode, no account.
        </p>

        <div className="docs-prose">
          <h2 id="what">What it does, before you commit</h2>
          <p>
            Toppings adds five small superpowers to YouTube:{" "}
            <strong>Audio mode</strong>, <strong>looped segments</strong>,{" "}
            <strong>custom playback rates</strong>,{" "}
            <strong>auto-scroll for Shorts</strong>, and{" "}
            <strong>playlist runtime stats</strong>. It adds nothing else. It
            removes nothing. It collects{" "}
            <a href="#privacy">zero data</a>.
          </p>

          <div className="callout">
            <span className="ico">
              <svg viewBox="0 0 24 24" aria-hidden>
                <circle cx={12} cy={12} r={10} />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </span>
            <p>
              <strong>Heads up:</strong> Toppings only runs on{" "}
              <code>youtube.com</code>. No data is collected, sent, or stored
              outside your browser. Settings sync via your browser profile
              only if you have profile sync turned on.
            </p>
          </div>

          <h2 id="install">Install</h2>
          <div className="docs-steps">
            <div className="docs-step">
              <div>
                <h4>Open your browser&rsquo;s extension store</h4>
                <p>
                  <Link
                    href={EXTERNAL_URL.CHROME_WEBSTORE_TOPPINGS}
                    target={"_blank"}
                  >
                    Chrome Web Store
                  </Link>{" "}
                  for Chrome, Edge, Opera, Brave, Arc.{" "}
                  <Link
                    href={EXTERNAL_URL.FIREFOX_AMO_TOPPINGS}
                    target={"_blank"}
                  >
                    Firefox Add-ons
                  </Link>{" "}
                  for Firefox and its forks.
                </p>
              </div>
            </div>
            <div className="docs-step">
              <div>
                <h4>Click &ldquo;Add to Chrome&rdquo; or &ldquo;Add to Firefox&rdquo;</h4>
                <p>
                  The browser will ask for two permissions:{" "}
                  <code>youtube.com</code> access (to inject the buttons) and{" "}
                  <code>storage</code> (to remember your settings). That&rsquo;s
                  the complete list of what Toppings ever asks for.
                </p>
              </div>
            </div>
            <div className="docs-step">
              <div>
                <h4>Pin the toolbar icon</h4>
                <p>
                  Click the puzzle-piece in your toolbar, find Toppings, and
                  pin it. You&rsquo;ll want quick access to the popup for the
                  Audio Mode toggle and per-tab status.
                </p>
              </div>
            </div>
            <div className="docs-step">
              <div>
                <h4>Open YouTube</h4>
                <p>
                  Any video page. You&rsquo;ll see two new amber buttons next
                  to YouTube&rsquo;s native controls — that&rsquo;s Toppings.
                  Press <kbd className="k">B</kbd> to try Audio mode immediately.
                </p>
              </div>
            </div>
          </div>

          <h2 id="first">First run</h2>
          <p>
            On first run Toppings opens a welcome tab with sensible defaults:
            Audio Mode <em>available but off</em>, Loop <em>off</em>, Shorts
            auto-scroll <em>on</em>, default playback speed{" "}
            <em>1.0&times;</em>. Override any of them from the options page —
            right-click the toolbar icon → <strong>Options</strong>, or click
            the gear in the popup.
          </p>
          <p>
            The options page is its own tab. You can change settings any time;
            changes are saved automatically.
          </p>

          <h2 id="privacy">Privacy model</h2>
          <p>
            Toppings has no analytics, no telemetry, and no remote calls.
            Everything runs inside your browser and dies there. Read the
            source on{" "}
            <Link
              href={EXTERNAL_URL.GITHUB_REPO}
              target={"_blank"}
            >
              GitHub
            </Link>
            ; it&rsquo;s GPL-3.0 in roughly 4,200 lines.
          </p>

          <h2 id="next">What to do next</h2>
          <ul>
            <li>
              See every shortcut Toppings ships with on the{" "}
              <Link href="/docs/keybindings">Keybindings</Link> page — all of
              them are rebindable.
            </li>
            <li>
              The most-asked questions, with answers, on the{" "}
              <Link href="/docs/faq">FAQ</Link>.
            </li>
            <li>
              Found a bug or want a feature? Open a thread on{" "}
              <Link
                href={EXTERNAL_URL.GITHUB_ISSUES}
                target={"_blank"}
              >
                GitHub Issues
              </Link>{" "}
              — we read all of them.
            </li>
          </ul>
        </div>

        <Pager currentHref="/docs" />

        <div className="docs-foot">
          <span>Last updated {currentReviewDate()}</span>
          <Link
            href={`${EXTERNAL_URL.GITHUB_REPO}/edit/main/website/app/docs/page.tsx`}
            target={"_blank"}
          >
            Edit this page on GitHub →
          </Link>
        </div>
      </main>

      <aside className="docs-toc">
        <div className="docs-toc__title">On this page</div>
        <div className="docs-toc__list">
          <a className="docs-toc__link active" href="#what">
            What it does
          </a>
          <a className="docs-toc__link" href="#install">
            Install
          </a>
          <a className="docs-toc__link" href="#first">
            First run
          </a>
          <a className="docs-toc__link" href="#privacy">
            Privacy model
          </a>
          <a className="docs-toc__link" href="#next">
            What to do next
          </a>
        </div>
      </aside>
    </>
  );
}

/** Build-time stamp shown in the page footer. */
function currentReviewDate() {
  const d = new Date();
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
