import { WEBSITE_HOME_FEATURE_GRID } from "toppings-constants";

/**
 * Scene 3 — what it does. The page is calm now (solid ink); the noise
 * is gone. Big editorial feature rows on hairlines, ember only on
 * hover (living-interface texture, not decoration).
 */
export default function SceneFeatures() {
  const { SECTION_HEADLINE, SECTION_LEDE_PART_1, SECTION_LEDE_PART_2, ROWS } =
    WEBSITE_HOME_FEATURE_GRID;
  return (
    <section className="r-scene r-solid">
      <div className="r-scene-inner">
        <div className="r-section-head">
          <div data-reveal>
            <span className="r-kicker">03 — what it does</span>
            <h2 className="r-h2" style={{ marginTop: 22 }}>
              {SECTION_HEADLINE}
            </h2>
          </div>
          <p className="r-deck" data-reveal>
            {SECTION_LEDE_PART_1}
            {SECTION_LEDE_PART_2}
          </p>
        </div>

        <div className="r-features">
          {ROWS.map((f) => (
            <article className="r-feature" key={f.index} data-reveal>
              <div className="r-feature-lead">
                <span className="r-feature-idx">{f.index}</span>
                <span className="r-feature-kbd">{f.kbd}</span>
              </div>
              <h3 className="r-feature-title">{f.title}</h3>
              <p className="r-feature-body">{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
