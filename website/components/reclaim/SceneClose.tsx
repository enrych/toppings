import { BRAND_METADATA, EXTENSION_VERSION, URLS } from "@toppings/constants";
import { LABEL, ROUTE } from "@/lib/site.data";
import { HOME } from "@/components/reclaim/reclaim.data";
import InstallCTA from "./InstallCTA";

export default function SceneClose() {
  const {
    SECTION_KICKER,
    HEADLINE_BEFORE,
    HEADLINE_HIGHLIGHT,
    HEADLINE_AFTER,
    LEDE,
    SOURCE_BUTTON,
    META,
  } = HOME.FINAL_CTA;

  return (
    <section className="r-scene r-close">
      <span className="r-kicker" data-reveal>
        {SECTION_KICKER}
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
          href={URLS.GITHUB_REPO}
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
          {BRAND_METADATA.NAME} · v{EXTENSION_VERSION} ·
          GPL-3.0
        </span>
        <span style={{ display: "flex", gap: 22 }}>
          <a
            href={ROUTE.DOCS}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {LABEL.DOCS}
          </a>
          <a
            href={URLS.GITHUB_REPO}
            target={"_blank"}
            rel="noopener noreferrer"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {LABEL.SOURCE_CODE}
          </a>
        </span>
      </footer>
    </section>
  );
}
