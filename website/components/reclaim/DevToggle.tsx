"use client";

/**
 * Persistent dev toolbar — kept on purpose (localhost, or `?dev` on any
 * host) so future work can be A/B'd in place without rebuilding this
 * scaffolding. The hero is locked to `editorial`, so there are no
 * toggles right now; add rows here as new experiments come up.
 */
export default function DevToggle() {
  return (
    <div className="r-dev" data-cursor>
      <span className="r-dev-tag">DEV</span>
      <div className="r-dev-row">
        <b>Hero</b>
        <button className="is-on" disabled>
          editorial
        </button>
      </div>
    </div>
  );
}
