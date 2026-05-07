import { HOME } from "@/components/reclaim/reclaim.data";

export default function SceneHow() {
  const { SECTION_KICKER, SECTION_HEADLINE, SECTION_LEDE, STEPS } =
    HOME.HOW_IT_WORKS;
  return (
    <section className="r-scene r-solid">
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

        <div className="r-steps">
          {STEPS.map((s) => (
            <div className="r-step" key={s.num} data-reveal>
              <div className="r-step-num">
                {s.num}
                <span>.</span>
              </div>
              <h3 className="r-step-title">{s.title}</h3>
              <p className="r-step-body">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
