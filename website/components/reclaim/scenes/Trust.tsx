"use client";
import { useEffect, useRef, useState } from "react";
import { STATS_SECTION } from "../data";

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

export default function Trust() {
  return (
    <section className="r-trustband" data-reveal>
      <div className="r-scene-inner">
        <span className="r-kicker">{STATS_SECTION.EYEBROW}</span>
        <div className="r-trust-grid">
          {STATS_SECTION.ROWS.map((row) => (
            <div className="r-trust-cell" key={row.LABEL}>
              <Count
                value={row.VALUE}
                decimals={row.DECIMALS}
                suffix={row.SUFFIX}
              />
              <span className="r-trust-label">{row.LABEL}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
