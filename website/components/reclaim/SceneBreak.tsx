import { WEBSITE_HOME_KEYBINDINGS } from "toppings-constants";

export type BreakLayout = "split" | "stack" | "tight";

/**
 * Scene 2 — the reclaim beat. Pinned + scrubbed by the orchestrator.
 * Three layouts, toggled live via the `layout` prop (the dev switcher
 * persists the choice); all expose the same gsap hooks so the pinned
 * timeline is layout-agnostic. Centering is done by `.r-panel-wrap`,
 * never by a transform on `.r-panel` (gsap owns that element's
 * transform for the slide-in).
 */
export default function SceneBreak({
  layout = "split",
}: {
  layout?: BreakLayout;
}) {
  const keys = WEBSITE_HOME_KEYBINDINGS.ROWS.slice(0, 4);
  return (
    <section className="r-break" data-layout={layout}>
      <span className="r-tag">01 → 02 — the reclaim beat</span>
      <div className="r-seam" />

      <div className="r-panel-wrap">
        <div className="r-panel">
          <div className="r-panel-bar">
            <span className="r-panel-brand">
              <i />
              Toppings
            </span>
            <span className="r-panel-mode">Audio mode ready</span>
          </div>
          <div className="r-panel-video">
            <span className="r-play" aria-hidden>
              ▶
            </span>
          </div>
          <div className="r-panel-scrub">
            <span className="r-panel-time">12:04</span>
            <div className="r-panel-track">
              <i />
              <b />
            </div>
            <span className="r-panel-time">18:47</span>
          </div>
          <div className="r-keys">
            {keys.map((k) => (
              <span className="r-key" key={k.label}>
                <em>{k.combo.join(k.sep)}</em>
                {k.label.replace(/^Toggle |^Set /, "")}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="r-break-copy">
        <h2 className="r-h2">
          <span className="r-mask">
            <span className="r-line">
              The noise comes <em>off.</em>
            </span>
          </span>
        </h2>
        <p className="r-deck">
          Same scroll position. The page strips its own hostility away in
          front of you — and hands you the keyboard.
        </p>
      </div>
    </section>
  );
}
