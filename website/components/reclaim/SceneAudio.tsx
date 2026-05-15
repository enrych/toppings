"use client";
import { useEffect, useRef, useState } from "react";
import { WEBSITE_HOME_INVERSE } from "toppings-constants";

/**
 * Scene — Audio Mode, the proof. The strongest single argument for
 * Toppings and the literal embodiment of the "quiet layer": strip the
 * picture, keep the sound. Three facts count up once, on enter. This
 * was the cream site's InverseSection — too important to drop.
 */
function Stat({ raw, unit }: { raw: string; unit: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const m = raw.match(/^([−-]?)(\d+(?:\.\d+)?)$/);
  const sign = m?.[1] ?? "";
  const target = m ? parseFloat(m[2]) : 0;
  const dec = m?.[2].includes(".") ? m[2].split(".")[1].length : 0;
  const [val, setVal] = useState(target === 0 ? "0" : sign + "0");

  useEffect(() => {
    const node = ref.current;
    if (!node || target === 0) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setVal(sign + target.toFixed(dec));
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 1300;
        const step = (t: number) => {
          const k = Math.min(1, (t - t0) / dur);
          const e = 1 - Math.pow(1 - k, 3);
          setVal(sign + (target * e).toFixed(dec));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [sign, target, dec]);

  return (
    <div className="r-stat" ref={ref}>
      <div className="r-stat-num">
        {val}
        {unit && <span>{unit}</span>}
      </div>
    </div>
  );
}

export default function SceneAudio() {
  const {
    SECTION_HEADLINE_BEFORE,
    SECTION_HEADLINE_HIGHLIGHT,
    SECTION_HEADLINE_AFTER,
    SECTION_LEDE,
    STATS,
  } = WEBSITE_HOME_INVERSE;

  return (
    <section className="r-scene r-solid r-audio">
      <div className="r-scene-inner">
        <div className="r-section-head">
          <div data-reveal>
            <span className="r-kicker">04 — the proof</span>
            <h2 className="r-h2" style={{ marginTop: 22 }}>
              {SECTION_HEADLINE_BEFORE}
              <em>{SECTION_HEADLINE_HIGHLIGHT}</em>
              {SECTION_HEADLINE_AFTER}
            </h2>
          </div>
          <p className="r-deck" data-reveal>
            {SECTION_LEDE}
          </p>
        </div>

        <div className="r-stats">
          {STATS.map((s) => (
            <div key={s.label} data-reveal>
              <Stat raw={s.number} unit={s.unit} />
              <div className="r-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
