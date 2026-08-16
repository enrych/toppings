import { FEATURES } from "@/constants/site";
import { FEATURES_SECTION } from "../data";

export default function Features() {
  return (
    <section className="r-scene r-solid">
      <div className="r-scene-inner">
        <div className="r-section-head">
          <div data-reveal>
            <span className="r-kicker">{FEATURES_SECTION.KICKER}</span>
            <h2 className="r-h2" style={{ marginTop: 22 }}>
              {FEATURES_SECTION.HEADLINE}
            </h2>
          </div>
          <p className="r-deck" data-reveal>
            {FEATURES_SECTION.LEDE}
          </p>
        </div>

        <div className="r-features">
          {FEATURES.map((feature, i) => (
            <article className="r-feature" key={feature.name} data-reveal>
              <div className="r-feature-lead">
                <span className="r-feature-idx">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {"isNew" in feature && feature.isNew && (
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
