"use client";
import { useEffect, useRef, useState } from "react";
import { KEYBINDINGS_SECTION, KEYBINDING_ROW_INDEX_BY_KEY } from "../data";

export default function Control() {
  const [hit, setHit] = useState(-1);
  const [readout, setReadout] = useState<string | null>(null);
  const timer = useRef<number>();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const idx = KEYBINDING_ROW_INDEX_BY_KEY[e.key.toLowerCase()];
      if (idx == null) return;
      const row = KEYBINDINGS_SECTION.ROWS[idx];
      setHit(idx);
      setReadout(`${row.COMBO.join(row.SEP)} — ${row.LABEL}`);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setHit(-1), 420);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <section className="r-scene r-control">
      <div className="r-scene-inner r-control-grid">
        <div data-reveal>
          <span className="r-kicker">{KEYBINDINGS_SECTION.KICKER}</span>
          <h2 className="r-h2" style={{ margin: "22px 0 26px" }}>
            {KEYBINDINGS_SECTION.HEADLINE_BEFORE}
            <em>{KEYBINDINGS_SECTION.HEADLINE_HIGHLIGHT}</em>
            {KEYBINDINGS_SECTION.HEADLINE_AFTER}
          </h2>
          <p className="r-deck">{KEYBINDINGS_SECTION.LEDE}</p>
          <p className="r-readout">
            {readout ? (
              <>
                <b>{readout.split(" — ")[0]}</b> — {readout.split(" — ")[1]}
              </>
            ) : (
              KEYBINDINGS_SECTION.IDLE_READOUT
            )}
          </p>
        </div>

        <div className="r-keystage" data-reveal>
          {KEYBINDINGS_SECTION.ROWS.map((row, i) => (
            <div
              key={row.LABEL}
              className={`r-keyrow${hit === i ? " is-hit" : ""}`}
            >
              <div>
                <div className="r-keyrow-label">{row.LABEL}</div>
                <div className="r-keyrow-desc">{row.DESC}</div>
              </div>
              <div className="r-combo">
                {row.COMBO.map((k, ci) => (
                  <span key={ci} style={{ display: "contents" }}>
                    {ci > 0 && (
                      <span style={{ opacity: 0.4, fontSize: 12 }}>
                        {row.SEP}
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
