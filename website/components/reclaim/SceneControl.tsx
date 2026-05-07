"use client";
import { useEffect, useRef, useState } from "react";
import { HOME } from "@/components/reclaim/reclaim.data";
import { isNull } from "@toppings/utils";
import { KEYBINDING_ROW_INDEX_BY_KEY } from "@/lib/keybindings";

export default function SceneControl() {
  const {
    SECTION_HEADLINE_BEFORE,
    SECTION_HEADLINE_HIGHLIGHT,
    SECTION_HEADLINE_AFTER,
    SECTION_KICKER,
    SECTION_LEDE,
    IDLE_READOUT,
    ROWS,
  } = HOME.KEYBINDINGS;

  const [hit, setHit] = useState(-1);
  const [readout, setReadout] = useState<string | null>(null);
  const timer = useRef<number>();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const idx = KEYBINDING_ROW_INDEX_BY_KEY[e.key.toLowerCase()];
      if (isNull(idx)) return;
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
          <span className="r-kicker">{SECTION_KICKER}</span>
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
              IDLE_READOUT
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
