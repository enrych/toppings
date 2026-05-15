"use client";
import { motion } from "framer-motion";
import { WEBSITE_HOME_INVERSE } from "toppings-constants";
import { SectionHead } from "./FeatureGrid";
import { fadeInUp } from "./motion";

/**
 * The page's one inverse section. Per the design system there is at
 * most one ink-background section per marketing page — this is it. The
 * amber accent appears only on the units (% / h) of the big-fact
 * numbers and on the highlighted word in the headline.
 *
 * Motion: each stat fades up with a 100ms stagger as the section enters
 * the viewport. The numbers should feel like they "weigh in" rather
 * than count up — no springs, no counter animations.
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
              <div
                className="font-black leading-[0.94] tracking-[-0.04em] text-[--fg-on-ink-1]"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(56px, 8vw, 108px)",
                  textWrap: "balance",
                }}
              >
                {s.number}
                {s.unit && <span className="text-amber">{s.unit}</span>}
              </div>
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
