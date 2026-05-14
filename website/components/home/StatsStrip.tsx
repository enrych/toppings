"use client";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useEffect, useRef } from "react";

const STATS = [
  { value: 7, suffix: "+", label: "Power features" },
  { value: 4.8, suffix: "★", label: "Avg user rating", decimals: 1 },
  { value: 100, suffix: "%", label: "Free forever" },
  { value: 2, suffix: " min", label: "To install" },
];

function Counter({
  value,
  suffix,
  decimals = 0,
}: {
  value: number;
  suffix: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [inView, mv, value]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <motion.span>{display}</motion.span>
      <span>{suffix}</span>
    </span>
  );
}

export default function StatsStrip() {
  return (
    <section className="relative py-16 lg:py-20 border-y border-ink/[0.07] bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center lg:text-left"
            >
              <div className="text-5xl lg:text-6xl text-display text-ink leading-none">
                <Counter
                  value={s.value}
                  suffix={s.suffix}
                  decimals={s.decimals}
                />
              </div>
              <div className="mt-3 text-xs uppercase tracking-[0.15em] text-ink/55">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
