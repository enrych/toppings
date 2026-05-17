import { HOME } from "@toppings/constants";

/**
 * Scene 5 — the quiet layer. The destination of the whole arc: maximum
 * negative space, slow reveals, no shader, no noise. This is what the
 * product gives you, expressed as the page's calmest moment.
 */
export default function SceneQuiet() {
  const { SECTION_HEADLINE, SECTION_LEDE, CARDS } = HOME.PRINCIPLES;
  return (
    <section className="r-scene r-quiet">
      <div className="r-scene-inner">
        <div className="r-section-head">
          <div data-reveal>
            <span className="r-kicker">the quiet layer</span>
            <h2 className="r-h2" style={{ marginTop: 22 }}>
              {SECTION_HEADLINE}
            </h2>
          </div>
          <p className="r-deck" data-reveal>
            {SECTION_LEDE}
          </p>
        </div>

        <div className="r-rules">
          {CARDS.map((c) => (
            <div key={c.num} data-reveal>
              <div className="r-rule-num">{c.num}</div>
              <div className="r-rule-title">
                {c.title_before}
                <em>{c.title_highlight}</em>
                {c.title_after}
              </div>
              <p className="r-rule-body">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
