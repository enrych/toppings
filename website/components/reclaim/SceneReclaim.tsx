import { WEBSITE_HOME_KEYBINDINGS } from "toppings-constants";

/**
 * The reclaim beat — rebuilt as one continuous pinned moment with NO
 * seam and NO left/right split.
 *
 * The headline is visible from the instant this enters (it reads as a
 * calm continuation of the hero over the still-noisy shader — that's
 * what removes the dead "gap" the old empty-until-pinned section had).
 * Then the pinned scrub strips the noise and the *same screen* you've
 * been looking at since the hero resolves, de-noised, into a single
 * centred calm Toppings view beneath the line. Restraint first
 * (the type), literal payoff second (the cleaned screen).
 */
export default function SceneReclaim() {
  const keys = WEBSITE_HOME_KEYBINDINGS.ROWS.slice(0, 4);
  return (
    <section className="r-reclaim">
      <div className="r-reclaim-stage">
        <div className="r-reclaim-inner">
          <h2 className="r-reclaim-head">
            The noise comes <em>off.</em>
          </h2>

          <div className="r-reclaim-screen" aria-hidden>
            <div className="r-rs-bar">
              <span className="r-rs-brand">
                <i />
                Toppings
              </span>
              <span className="r-rs-mode">Audio mode ready</span>
            </div>
            <div className="r-rs-video" />
            <div className="r-rs-scrub">
              <span className="r-rs-time">12:04</span>
              <div className="r-rs-track">
                <i />
                <b />
              </div>
              <span className="r-rs-time">18:47</span>
            </div>
            <div className="r-rs-keys">
              {keys.map((k) => (
                <span className="r-rs-key" key={k.label}>
                  <em>{k.combo.join(k.sep)}</em>
                  {k.label.replace(/^Toggle |^Set /, "")}
                </span>
              ))}
            </div>
          </div>

          <p className="r-reclaim-deck">
            Same scroll position. The page strips its own hostility away —
            and hands you the keyboard.
          </p>
        </div>
      </div>
    </section>
  );
}
