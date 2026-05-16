import {
  WEBSITE_HOME_FEATURE_GRID,
  EXTENSION_FEATURE_DEFINITIONS,
} from "toppings-constants";

/**
 * Scene 3 — what it does. Rows are rendered straight from the canonical
 * EXTENSION_FEATURE_DEFINITIONS catalog: ship a feature there and it
 * appears here automatically, in order, with its real name, real
 * description and a NEW/BETA tag — zero website edits, no count baked
 * into the copy. The growth IS the section.
 */
export default function SceneFeatures() {
  const { SECTION_HEADLINE, SECTION_LEDE } = WEBSITE_HOME_FEATURE_GRID;
  return (
    <section className="r-scene r-solid">
      <div className="r-scene-inner">
        <div className="r-section-head">
          <div data-reveal>
            <span className="r-kicker">what it does</span>
            <h2 className="r-h2" style={{ marginTop: 22 }}>
              {SECTION_HEADLINE}
            </h2>
          </div>
          <p className="r-deck" data-reveal>
            {SECTION_LEDE}
          </p>
        </div>

        <div className="r-features">
          {EXTENSION_FEATURE_DEFINITIONS.map((f, i) => (
            <article className="r-feature" key={f.id} data-reveal>
              <div className="r-feature-lead">
                <span className="r-feature-idx">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {f.status !== "stable" && (
                  <span className="r-feature-tag">{f.status}</span>
                )}
              </div>
              <h3 className="r-feature-title">{f.name}</h3>
              <p className="r-feature-body">{f.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
