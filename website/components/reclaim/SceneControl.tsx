"use client";
import { useEffect, useRef, useState } from "react";
import { WEBSITE_HOME_KEYBINDINGS } from "toppings-constants";

/**
 * Scene 4 — the keyboard IS the interface. This is the living-interface
 * texture made literal: the page listens to your real keystrokes and
 * reacts. Press A / L / , . / ← → / I O / T and the matching binding
 * lights up. The medium demonstrates the message.
 */
const KEYMAP: Record<string, number> = {
  a: 0,
  l: 1,
  ",": 2,
  ".": 2,
  arrowleft: 3,
  arrowright: 3,
  i: 4,
  o: 4,
  t: 5,
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
      if (e.key.startsWith("Arrow") || e.key === "," || e.key === ".")
        e.preventDefault();
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
          <span className="r-kicker">05 — the keyboard is the interface</span>
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
              "Press a key — A · L · , . · ← → · I O · T"
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
                <span className="r-cap">{row.combo[0]}</span>
                <span style={{ opacity: 0.4, fontSize: 12 }}>{row.sep}</span>
                <span className="r-cap">{row.combo[1]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
