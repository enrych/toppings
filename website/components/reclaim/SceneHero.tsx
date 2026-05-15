import {
  WEBSITE_HERO,
  EXTERNAL_URL,
  BROWSER_TARGET,
} from "toppings-constants";
import InstallCTA from "./InstallCTA";

/**
 * Scene 1 — the noise. The locked editorial hero: a typography-led
 * opening (big serif + whitespace) over the full-bleed `signal`
 * distortion, the type bedded by a scrim. (Earlier device/reveal
 * concept explorations were dropped — editorial is the one.)
 */
export default function SceneHero() {
  return (
    <section className="r-scene r-hero" data-hero data-comp="editorial">
      <div className="r-scene-inner r-hero-stack">
        <span className="r-eyebrow">{WEBSITE_HERO.EYEBROW}</span>

        <h1 className="r-display">
          <span className="r-mask">
            <span className="r-line">{WEBSITE_HERO.HEADLINE_LINE_1}</span>
          </span>
          <span className="r-mask">
            <span className="r-line">
              {WEBSITE_HERO.HEADLINE_LINE_2_BEFORE}
              <em>{WEBSITE_HERO.HEADLINE_LINE_2_HIGHLIGHT}</em>
              {WEBSITE_HERO.HEADLINE_LINE_2_AFTER}
            </span>
          </span>
        </h1>

        <p className="r-deck">{WEBSITE_HERO.LEDE}</p>

        <div className="r-hero-actions">
          <InstallCTA variant="solid" />
          <a
            href={EXTERNAL_URL.FIREFOX_AMO_TOPPINGS}
            target={BROWSER_TARGET.BLANK}
            rel="noopener noreferrer"
            className="r-btn r-btn--ghost"
          >
            {WEBSITE_HERO.FIREFOX_BUTTON}
          </a>
          <a
            href={EXTERNAL_URL.GITHUB_REPO}
            target={BROWSER_TARGET.BLANK}
            rel="noopener noreferrer"
            className="r-btn r-btn--ghost"
          >
            {WEBSITE_HERO.SOURCE_BUTTON}
          </a>
        </div>

        <div className="r-trust">
          <span>
            <b>{WEBSITE_HERO.TRUST_TRACKERS_LEAD}</b>
            {WEBSITE_HERO.TRUST_TRACKERS_REST}
          </span>
          <span>
            <b>{WEBSITE_HERO.TRUST_LICENSE_LEAD}</b>
            {WEBSITE_HERO.TRUST_LICENSE_REST}
          </span>
        </div>
      </div>
      <span className="r-cue">↓ Scroll to strip the noise</span>
    </section>
  );
}
