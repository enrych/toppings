"use client";
import { useEffect, useRef, useState } from "react";
import { WEBSITE_HOME_STATS_STRIP } from "toppings-constants";

/**
 * Trust strip — a quiet hairline band, not a section. Four markers
 * count up once on enter. Restraint on purpose: small numbers, mono
 * labels, lots of air. Sits just before the close as the last calm
 * reassurance before the CTA.
 */
function Count({
  value,
  decimals,
  suffix,
}: {
  value: number;
  decimals: number;
  suffix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState("0");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(value.toFixed(decimals));
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 1200;
        const step = (t: number) => {
          const k = Math.min(1, (t - t0) / dur);
          const e = 1 - Math.pow(1 - k, 3);
          setV((value * e).toFixed(decimals));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [value, decimals]);

  return (
    <span ref={ref} className="r-trust-num">
      {v}
      <span>{suffix}</span>
    </span>
  );
}

export default function SceneTrust() {
  const { EYEBROW, ROWS } = WEBSITE_HOME_STATS_STRIP;
  return (
    <section className="r-trustband" data-reveal>
      <div className="r-scene-inner">
        <span className="r-kicker">{EYEBROW}</span>
        <div className="r-trust-grid">
          {ROWS.map((r) => (
            <div className="r-trust-cell" key={r.label}>
              <Count
                value={r.value}
                decimals={r.decimals}
                suffix={r.suffix}
              />
              <span className="r-trust-label">{r.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
