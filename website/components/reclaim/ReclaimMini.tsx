import Link from "next/link";
import {
  BRAND,
  EXTENSION_VERSION,
  EXTERNAL_URL,
  ROUTE,
} from "@toppings/constants";
import "./reclaim.css";
import Cursor from "./Cursor";
import Nav from "./Nav";

/**
 * Shared shell for the short utility pages (greetings / farewell). Same
 * rebrand system as the home — ink ground, editorial serif, one ember
 * accent, the custom cursor and Nav — but calm and static: these pages
 * are the "quiet layer", so no shader, no scroll choreography. CSS
 * `r-reveal` does a single gentle fade-up with no JS dependency.
 */
export default function ReclaimMini({
  kicker,
  titleBefore,
  titleEm,
  titleAfter,
  body,
  cta,
}: {
  kicker: string;
  titleBefore: string;
  titleEm: string;
  titleAfter: string;
  body: string[];
  cta: { label: string; href: string; internal?: boolean };
}) {
  return (
    <div className="reclaim r-mini-root">
      <Cursor />
      <Nav />
      <section className="r-scene r-mini">
        <div className="r-mini-inner">
          <span className="r-eyebrow is-ember r-reveal">{kicker}</span>
          <h1 className="r-display r-reveal" style={{ marginTop: 26 }}>
            {titleBefore}
            <em>{titleEm}</em>
            {titleAfter}
          </h1>
          <p
            className="r-deck r-reveal"
            style={{ margin: "28px auto 0", textAlign: "center" }}
          >
            {body.map((line, i) => (
              <span key={i}>
                {line}
                {i < body.length - 1 && <br />}
              </span>
            ))}
          </p>
          <div className="r-mini-actions r-reveal">
            {cta.internal ? (
              <Link href={cta.href} className="r-btn r-btn--solid">
                {cta.label}
                <span className="r-arrow" aria-hidden>
                  →
                </span>
              </Link>
            ) : (
              <a
                href={cta.href}
                target={"_blank"}
                rel="noopener noreferrer"
                className="r-btn r-btn--solid"
              >
                {cta.label}
                <span className="r-arrow" aria-hidden>
                  →
                </span>
              </a>
            )}
          </div>
        </div>

        <footer className="r-foot">
          <span>
            {BRAND.NAME} · v{EXTENSION_VERSION} ·
            GPL-3.0
          </span>
          <span style={{ display: "flex", gap: 22 }}>
            <Link
              href={ROUTE.DOCS}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Docs
            </Link>
            <a
              href={EXTERNAL_URL.GITHUB_REPO}
              target={"_blank"}
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              GitHub
            </a>
          </span>
        </footer>
      </section>
    </div>
  );
}
