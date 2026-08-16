import {
  BRAND_METADATA,
  EXTENSION_VERSION,
  LABEL,
  ROUTE,
  URL,
} from "@/constants/site";
import { CTA_SECTION } from "../data";
import InstallCTA from "../InstallCTA";

export default function Close() {
  return (
    <section className="r-scene r-close">
      <span className="r-kicker" data-reveal>
        {CTA_SECTION.KICKER}
      </span>
      <h2 className="r-display" style={{ margin: "26px 0 30px" }} data-reveal>
        {CTA_SECTION.HEADLINE_BEFORE}
        <em>{CTA_SECTION.HEADLINE_HIGHLIGHT}</em>
        {CTA_SECTION.HEADLINE_AFTER}
      </h2>
      <p className="r-deck" style={{ textAlign: "center" }} data-reveal>
        {CTA_SECTION.LEDE}
      </p>

      <div className="r-close-actions" data-reveal>
        <InstallCTA variant="solid" />
        <a
          href={URL.GITHUB_REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="r-btn r-btn--ghost"
        >
          {CTA_SECTION.SOURCE_BUTTON}
        </a>
      </div>

      <div className="r-meta" data-reveal>
        {CTA_SECTION.META}
      </div>

      <footer className="r-foot">
        <span>
          {BRAND_METADATA.NAME} · v{EXTENSION_VERSION} · GPL-3.0
        </span>
        <span style={{ display: "flex", gap: 22 }}>
          <a
            href={ROUTE.DOCS}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {LABEL.DOCS}
          </a>
          <a
            href={URL.GITHUB_REPO}
            target="_blank"
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
