"use client";
import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { WEBSITE_HOME_INVERSE } from "toppings-constants";
import { SectionHead } from "./FeatureGrid";
import { EASE_EXPO_OUT, fadeInUp } from "./motion";

/**
 * The page's one inverse section. Per the design system there is at most
 * one ink-background section per marketing page — this is it.
 *
 * Motion: the three big-fact numbers count up from a leading-zero start
 * to their target value as the section scrolls into view. The amber
 * unit suffix (% / h) and the mono caption fade in alongside. Numbers
 * "weigh in" instead of just appearing.
 */
export default function InverseSection() {
  const {
    SECTION_HEADLINE_BEFORE,
    SECTION_HEADLINE_HIGHLIGHT,
    SECTION_HEADLINE_AFTER,
    SECTION_LEDE,
    STATS,
  } = WEBSITE_HOME_INVERSE;

  return (
    <section className="section--inverse bg-ink py-24 lg:py-[96px]">
      <div className="mx-auto max-w-page px-6 lg:px-14">
        <SectionHead
          inverse
          h2={
            <>
              {SECTION_HEADLINE_BEFORE}
              <span
                className="amber-underline"
                style={{ color: "var(--ink)" }}
              >
                {SECTION_HEADLINE_HIGHLIGHT}
              </span>
              {SECTION_HEADLINE_AFTER}
            </>
          }
          p={SECTION_LEDE}
        />
        <div className="grid grid-cols-1 gap-x-14 gap-y-10 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeInUp({ delay: i * 0.18, y: 28 })}
            >
              <BigCounter raw={s.number} unit={s.unit} delay={i * 0.18} />
              <div className="mt-4 font-mono text-xs font-medium uppercase tracking-[0.06em] text-[--fg-on-ink-2]">
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
 * Animated big-number counter. Takes the raw string (e.g. "−87" or
 * "2.4"), parses out a sign + numeric magnitude + decimal precision,
 * and counts up from 0 to the target when its parent scrolls into view.
 *
 * The unit suffix stays static — only the number animates. We use
 * MotionValue + useTransform so the DOM update is direct (no React
 * re-render per frame).
 */
function BigCounter({
  raw,
  unit,
  delay,
}: {
  raw: string;
  unit: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  // "−87" → { sign: "−", magnitude: 87, decimals: 0 }
  // "2.4" → { sign: "",  magnitude: 2.4, decimals: 1 }
  // "0"   → { sign: "",  magnitude: 0,   decimals: 0 }
  const match = raw.match(/^([−-]?)(\d+(?:\.\d+)?)$/);
  const sign = match?.[1] ?? "";
  const magnitude = match ? parseFloat(match[2]) : 0;
  const decimals = match?.[2].includes(".")
    ? match[2].split(".")[1].length
    : 0;

  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (!inView || magnitude === 0) return;
    const controls = animate(mv, magnitude, {
      duration: 1.5,
      ease: EASE_EXPO_OUT,
      delay: delay + 0.1,
    });
    return controls.stop;
  }, [inView, magnitude, mv, delay]);

  return (
    <div
      ref={ref}
      className="font-black leading-[0.94] tracking-[-0.04em] text-[--fg-on-ink-1]"
      style={{
        fontWeight: 900,
        fontSize: "clamp(56px, 8vw, 108px)",
        textWrap: "balance",
      }}
    >
      {/* For the zero case, just render "0" — no counter required. */}
      {magnitude === 0 ? (
        <>0</>
      ) : (
        <>
          {sign}
          <motion.span>{display}</motion.span>
        </>
      )}
      {unit && <span className="text-amber">{unit}</span>}
    </div>
  );
}
