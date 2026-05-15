"use client";
import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { WEBSITE_HOME_STATS_STRIP } from "toppings-constants";
import { EASE_EXPO_OUT, fadeInUp } from "./motion";

/**
 * Trust-marker strip — the count-up section from the f82c6f6 era,
 * brought back and aligned to the current design system. Four
 * cream-on-cream stats with editorial Inter-900 display numbers and
 * mono caption labels. Numbers count up to their target when the strip
 * enters the viewport.
 *
 * Lives between FeatureGrid and InverseSection — the band between
 * "what it does" and "the proof point of audio mode."
 */
export default function StatsStrip() {
  const { EYEBROW, ROWS } = WEBSITE_HOME_STATS_STRIP;

  return (
    <section className="border-y border-[--border-1] py-16 lg:py-20">
      <div className="mx-auto max-w-page px-6 lg:px-14">
        <motion.div
          {...fadeInUp({ duration: 0.7, y: 14 })}
          className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[--fg-3]"
        >
          {EYEBROW}
        </motion.div>
        <div className="mt-8 grid grid-cols-2 gap-10 sm:gap-12 lg:grid-cols-4">
          {ROWS.map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeInUp({ delay: 0.1 + i * 0.1, y: 18 })}
              className="text-left"
            >
              <div
                className="text-ink leading-none tracking-[-0.04em]"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(40px, 5.5vw, 64px)",
                }}
              >
                <Counter
                  value={s.value}
                  decimals={s.decimals}
                  delay={0.2 + i * 0.1}
                />
                <span>{s.suffix}</span>
              </div>
              <div className="mt-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[--fg-3]">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Counts up from 0 to `value` over 1.4s when its parent enters view.
 * Uses MotionValue + useTransform so the DOM updates per frame without
 * triggering React re-renders.
 */
function Counter({
  value,
  decimals,
  delay,
}: {
  value: number;
  decimals: number;
  delay: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, {
      duration: 1.4,
      ease: EASE_EXPO_OUT,
      delay,
    });
    return controls.stop;
  }, [inView, mv, value, delay]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <motion.span>{display}</motion.span>
    </span>
  );
}
