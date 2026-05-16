"use client";
import { useEffect, useRef, useState } from "react";
import { WEBSITE_HOME_KEYBINDINGS } from "toppings-constants";

/**
 * Scene 4 — the keyboard IS the interface. This is the living-interface
 * texture made literal: the page listens to your real keystrokes and
 * reacts. Press A / L / , . / ← → / I O / T and the matching binding
 * lights up. The medium demonstrates the message.
 */
// Real default bindings (EXTENSION_DEFAULT_STORE) → row index.
const KEYMAP: Record<string, number> = {
  b: 0,
  z: 1,
  q: 2,
  e: 2,
  s: 3,
  w: 3,
  a: 4,
  d: 4,
  x: 5,
};

export default function SceneControl() {
  const {
    SECTION_HEADLINE_BEFORE,
    SECTION_HEADLINE_HIGHLIGHT,
    SECTION_HEADLINE_AFTER,
    SECTION_LEDE,
    ROWS,
  } = WEBSITE_HOME_KEYBINDINGS;

  const [hit, setHit] = useState(-1);
  const [readout, setReadout] = useState<string | null>(null);
  const timer = useRef<number>();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const idx = KEYMAP[e.key.toLowerCase()];
      if (idx === undefined) return;
      const row = ROWS[idx];
      setHit(idx);
      setReadout(`${row.combo.join(row.sep)} — ${row.label}`);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setHit(-1), 420);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer.current);
    };
  }, [ROWS]);

  return (
    <section className="r-scene r-control">
      <div className="r-scene-inner r-control-grid">
        <div data-reveal>
          <span className="r-kicker">the keyboard is the interface</span>
          <h2 className="r-h2" style={{ margin: "22px 0 26px" }}>
            {SECTION_HEADLINE_BEFORE}
            <em>{SECTION_HEADLINE_HIGHLIGHT}</em>
            {SECTION_HEADLINE_AFTER}
          </h2>
          <p className="r-deck">{SECTION_LEDE}</p>
          <p className="r-readout">
            {readout ? (
              <>
                <b>{readout.split(" — ")[0]}</b> — {readout.split(" — ")[1]}
              </>
            ) : (
              "Press a key — B · Z · Q E · S W · A D · X"
            )}
          </p>
        </div>

        <div className="r-keystage" data-reveal>
          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`r-keyrow${hit === i ? " is-hit" : ""}`}
            >
              <div>
                <div className="r-keyrow-label">{row.label}</div>
                <div className="r-keyrow-desc">{row.desc}</div>
              </div>
              <div className="r-combo">
                {row.combo.map((k, ci) => (
                  <span key={ci} style={{ display: "contents" }}>
                    {ci > 0 && (
                      <span style={{ opacity: 0.4, fontSize: 12 }}>
                        {row.sep}
                      </span>
                    )}
                    <span className="r-cap">{k}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
