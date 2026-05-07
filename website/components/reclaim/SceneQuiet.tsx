import { HOME } from "@/components/reclaim/reclaim.data";

export default function SceneQuiet() {
  const { SECTION_KICKER, SECTION_HEADLINE, SECTION_LEDE, CARDS } =
    HOME.PRINCIPLES;
  return (
    <section className="r-scene r-quiet">
      <div className="r-scene-inner">
        <div className="r-section-head">
          <div data-reveal>
            <span className="r-kicker">{SECTION_KICKER}</span>
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
