import {
  EXTENSION_VERSION,
  EXTERNAL_URL,
  HERO,
} from "@toppings/constants";
import { interpolateTemplate } from "@toppings/utils";
import InstallCTA from "./InstallCTA";

/**
 * Scene 1 — the noise. The locked editorial hero: a typography-led
 * opening (big serif + whitespace) over the full-bleed `signal`
 * distortion, the type bedded by a scrim. (Earlier device/reveal
 * concept explorations were dropped — editorial is the one.)
 */
export default function SceneHero() {
  const heroEyebrow = interpolateTemplate(HERO.EYEBROW, {
    version: EXTENSION_VERSION,
  });

  return (
    <section className="r-scene r-hero" data-hero data-comp="editorial">
      <div className="r-scene-inner r-hero-stack">
        <span className="r-eyebrow">{heroEyebrow}</span>

        <h1 className="r-display">
          <span className="r-mask">
            <span className="r-line">{HERO.HEADLINE_LINE_1}</span>
          </span>
          <span className="r-mask">
            <span className="r-line">
              {HERO.HEADLINE_LINE_2_BEFORE}
              <em>{HERO.HEADLINE_LINE_2_HIGHLIGHT}</em>
              {HERO.HEADLINE_LINE_2_AFTER}
            </span>
          </span>
        </h1>

        <p className="r-deck">{HERO.LEDE}</p>

        <div className="r-hero-actions">
          <InstallCTA variant="solid" />
          <a
            href={EXTERNAL_URL.GITHUB_REPO}
            target={"_blank"}
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
      <span className="r-cue">↓ Scroll to strip the noise</span>
    </section>
  );
}
