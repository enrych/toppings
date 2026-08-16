import { PRINCIPLES_SECTION } from "../data";

export default function Quiet() {
  return (
    <section className="r-scene r-quiet">
      <div className="r-scene-inner">
        <div className="r-section-head">
          <div data-reveal>
            <span className="r-kicker">{PRINCIPLES_SECTION.KICKER}</span>
            <h2 className="r-h2" style={{ marginTop: 22 }}>
              {PRINCIPLES_SECTION.HEADLINE}
            </h2>
          </div>
          <p className="r-deck" data-reveal>
            {PRINCIPLES_SECTION.LEDE}
          </p>
        </div>

        <div className="r-rules">
          {PRINCIPLES_SECTION.CARDS.map((card) => (
            <div key={card.NUM} data-reveal>
              <div className="r-rule-num">{card.NUM}</div>
              <div className="r-rule-title">
                {card.TITLE_BEFORE}
                <em>{card.TITLE_HIGHLIGHT}</em>
                {card.TITLE_AFTER}
              </div>
              <p className="r-rule-body">{card.BODY}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
