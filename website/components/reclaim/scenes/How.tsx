import { HOW_SECTION } from "../data";

export default function How() {
  return (
    <section className="r-scene r-solid">
      <div className="r-scene-inner">
        <div className="r-section-head">
          <div data-reveal>
            <span className="r-kicker">{HOW_SECTION.KICKER}</span>
            <h2 className="r-h2" style={{ marginTop: 22 }}>
              {HOW_SECTION.HEADLINE}
            </h2>
          </div>
          <p className="r-deck" data-reveal>
            {HOW_SECTION.LEDE}
          </p>
        </div>

        <div className="r-steps">
          {HOW_SECTION.STEPS.map((step) => (
            <div className="r-step" key={step.NUM} data-reveal>
              <div className="r-step-num">
                {step.NUM}
                <span>.</span>
              </div>
              <h3 className="r-step-title">{step.TITLE}</h3>
              <p className="r-step-body">{step.BODY}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
