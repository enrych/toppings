import type { Metadata } from "next";
import Link from "next/link";
import DocsPageHeader from "./components/DocsPageHeader";
import Pager from "./components/Pager";
import { FEATURES, ROUTE, URL } from "@/constants/site";
import { EDIT_PATH, LAST_UPDATED, PAGE, TOC } from "./data";

export const metadata: Metadata = {
  title: "Toppings — Install",
  description:
    "Install Toppings from the Chrome Web Store or Firefox Add-ons in under a minute.",
};

export default function DocsInstallPage() {
  return (
    <>
      <main className="docs-main">
        <DocsPageHeader {...PAGE} />

        <div className="docs-prose">
          <h2 id="what">What it does, before you commit</h2>
          <p>
            Toppings adds small, sharp tools to YouTube:{" "}
            {FEATURES.map((feature, i) => (
              <span key={feature.name}>
                {i > 0 && (i === FEATURES.length - 1 ? ", and " : ", ")}
                <strong>{feature.name}</strong>
              </span>
            ))}
            . It adds nothing else. It removes nothing. It collects{" "}
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
              outside your browser. Settings sync via your browser profile only
              if you have profile sync turned on.
            </p>
          </div>

          <h2 id="install">Install</h2>
          <div className="docs-steps">
            <div className="docs-step">
              <div>
                <h4>Open your browser&apos;s extension store</h4>
                <p>
                  <Link href={URL.CHROME_WEBSTORE_TOPPINGS} target="_blank">
                    Chrome Web Store
                  </Link>{" "}
                  for Chrome, Edge, Opera, Brave, Arc.{" "}
                  <Link href={URL.FIREFOX_AMO_TOPPINGS} target="_blank">
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
                  <code>storage</code> (to remember your settings). That&apos;s
                  the complete list of what Toppings ever asks for.
                </p>
              </div>
            </div>
            <div className="docs-step">
              <div>
                <h4>Pin the toolbar icon</h4>
                <p>
                  Click the puzzle-piece in your toolbar, find Toppings, and
                  pin it. You&apos;ll want quick access to the popup for the
                  Audio Mode toggle and per-tab status.
                </p>
              </div>
            </div>
            <div className="docs-step">
              <div>
                <h4>Open YouTube</h4>
                <p>
                  Any video page. You&apos;ll see two new amber buttons next to
                  YouTube&apos;s native controls — that&apos;s Toppings. Press{" "}
                  <code>B</code> to try Audio mode immediately.
                </p>
              </div>
            </div>
          </div>

          <h2 id="first">First run</h2>
          <p>
            On first run Toppings opens a welcome tab with sensible defaults:
            Audio Mode <em>available but off</em>, Loop <em>off</em>, Shorts
            auto-scroll <em>on</em>, default playback speed <em>1.0×</em>.
            Override any of them from the options page — right-click the toolbar
            icon → <strong>Options</strong>, or click the gear in the popup.
          </p>
          <p>
            The options page is its own tab. You can change settings any time;
            changes are saved automatically.
          </p>

          <h2 id="privacy">Privacy model</h2>
          <p>
            Toppings has no analytics, no telemetry, and no remote calls.
            Everything runs inside your browser and dies there. Read the source
            on{" "}
            <Link href={URL.GITHUB_REPO} target="_blank">
              GitHub
            </Link>
            ; it&apos;s GPL-3.0 in roughly 4,200 lines.
          </p>

          <h2 id="next">What to do next</h2>
          <ul>
            <li>
              See every shortcut Toppings ships with on the{" "}
              <Link href={ROUTE.DOCS_KEYBINDINGS}>Keybindings</Link> page — all
              of them are rebindable.
            </li>
            <li>
              The most-asked questions, with answers, on the{" "}
              <Link href={ROUTE.DOCS_FAQ}>FAQ</Link>.
            </li>
            <li>
              Found a bug or want a feature?{" "}
              <Link href={URL.GITHUB_ISSUES} target="_blank">
                Open an issue on GitHub
              </Link>{" "}
              — we read all of them.
            </li>
          </ul>
        </div>

        <Pager currentHref={ROUTE.DOCS} />

        <div className="docs-foot">
          <span>Last updated {LAST_UPDATED}</span>
          <Link
            href={`${URL.GITHUB_REPO}/edit/main/${EDIT_PATH}`}
            target="_blank"
          >
            Edit this page on GitHub →
          </Link>
        </div>
      </main>

      <aside className="docs-toc">
        <div className="docs-toc__title">On this page</div>
        <div className="docs-toc__list">
          {TOC.map((item, i) => (
            <a
              key={item.ID}
              className={"docs-toc__link" + (i === 0 ? " active" : "")}
              href={`#${item.ID}`}
            >
              {item.LABEL}
            </a>
          ))}
        </div>
      </aside>
    </>
  );
}
