import {
  BRAND,
  EXTENSION_VERSION,
  EXTERNAL_URL,
  HOME,
  ROUTE,
} from "@toppings/constants";
import InstallCTA from "./InstallCTA";

/**
 * Scene 6 — close. The quiet layer has fully arrived: centered,
 * spacious, resolved. One last editorial line, the install, and a
 * hairline footer. No marketing Footer chrome — this IS the ending.
 */
export default function SceneClose() {
  const {
    HEADLINE_BEFORE,
    HEADLINE_HIGHLIGHT,
    HEADLINE_AFTER,
    LEDE,
    FIREFOX_BUTTON,
    SOURCE_BUTTON,
    META,
  } = HOME.FINAL_CTA;

  return (
    <section className="r-scene r-close">
      <span className="r-kicker" data-reveal>
        take it back
      </span>
      <h2 className="r-display" style={{ margin: "26px 0 30px" }} data-reveal>
        {HEADLINE_BEFORE}
        <em>{HEADLINE_HIGHLIGHT}</em>
        {HEADLINE_AFTER}
      </h2>
      <p className="r-deck" style={{ textAlign: "center" }} data-reveal>
        {LEDE}
      </p>

      <div className="r-close-actions" data-reveal>
        <InstallCTA variant="solid" />
        <a
          href={EXTERNAL_URL.FIREFOX_AMO_TOPPINGS}
          target={"_blank"}
          rel="noopener noreferrer"
          className="r-btn r-btn--ghost"
        >
          {FIREFOX_BUTTON}
        </a>
        <a
          href={EXTERNAL_URL.GITHUB_REPO}
          target={"_blank"}
          rel="noopener noreferrer"
          className="r-btn r-btn--ghost"
        >
          {SOURCE_BUTTON}
        </a>
      </div>

      <div className="r-meta" data-reveal>
        {META}
      </div>

      <footer className="r-foot">
        <span>
          {BRAND.NAME} · v{EXTENSION_VERSION} ·
          GPL-3.0
        </span>
        <span style={{ display: "flex", gap: 22 }}>
          <a
            href={ROUTE.DOCS}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            Docs
          </a>
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
  );
}
