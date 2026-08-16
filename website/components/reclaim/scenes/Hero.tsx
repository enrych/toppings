import { EXTENSION_VERSION, URL } from "@/constants/site";
import { HERO } from "../data";
import InstallCTA from "../InstallCTA";

export default function Hero() {
  const eyebrow = HERO.EYEBROW.replace("{{version}}", EXTENSION_VERSION);

  return (
    <section className="r-scene r-hero" data-hero data-comp="editorial">
      <div className="r-scene-inner r-hero-stack">
        <span className="r-eyebrow">{eyebrow}</span>

        <h1 className="r-display">
          <span className="r-mask">
            <span className="r-line">{HERO.TITLE_LINE_1}</span>
          </span>
          <span className="r-mask">
            <span className="r-line">
              {HERO.TITLE_BEFORE}
              <em>{HERO.TITLE_HIGHLIGHT}</em>
              {HERO.TITLE_AFTER}
            </span>
          </span>
        </h1>

        <p className="r-deck">{HERO.LEDE}</p>

        <div className="r-hero-actions">
          <InstallCTA variant="solid" />
          <a
            href={URL.GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="r-btn r-btn--ghost"
          >
            {HERO.SOURCE_BUTTON}
          </a>
        </div>

        <div className="r-trust">
          <span>
            <b>{HERO.TRUST_TRACKERS_LEAD}</b>
            {HERO.TRUST_TRACKERS_REST}
          </span>
          <span>
            <b>{HERO.TRUST_LICENSE_LEAD}</b>
            {HERO.TRUST_LICENSE_REST}
          </span>
        </div>
      </div>
      <span className="r-cue">{HERO.SCROLL_CUE}</span>
    </section>
  );
}
