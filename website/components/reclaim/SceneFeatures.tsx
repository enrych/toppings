import {
  FEATURES,
  HOME,
} from "@toppings/constants";

export default function SceneFeatures() {
  const { SECTION_HEADLINE, SECTION_LEDE } = HOME.FEATURE_GRID;
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
          {FEATURES.map((feature, i) => (
            <article className="r-feature" key={feature.name} data-reveal>
              <div className="r-feature-lead">
                <span className="r-feature-idx">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {feature.isNew && (
                  <span className="r-feature-tag">new</span>
                )}
              </div>
              <h3 className="r-feature-title">{feature.name}</h3>
              <p className="r-feature-body">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
