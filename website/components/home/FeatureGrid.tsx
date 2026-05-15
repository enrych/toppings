"use client";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { WEBSITE_HOME_FEATURE_GRID } from "toppings-constants";
import { fadeInUp, displayReveal, MOTION_LAYER_STYLE } from "./motion";

/**
 * FeatureGrid — four equal cells separated by hairline rules. No cards,
 * no shadows, no per-feature tonal variation. The geometric coldness is
 * the point.
 *
 * Motion: each cell does a subtle staggered fade-up as it enters the
 * viewport (50ms stagger). The grid as a whole reveals after the
 * section head settles, so the eye follows the page top→bottom.
 */
export default function FeatureGrid() {
  const { ROWS, SECTION_HEADLINE, SECTION_LEDE_PART_1, SECTION_LEDE_PART_2 } =
    WEBSITE_HOME_FEATURE_GRID;

  return (
    <section className="py-24 lg:py-[96px]">
      <div className="mx-auto max-w-page px-6 lg:px-14">
        <SectionHead
          h2={<>{SECTION_HEADLINE}</>}
          p={
            <>
              {SECTION_LEDE_PART_1}
              {SECTION_LEDE_PART_2}
            </>
          }
        />
      </div>
      {/*
       * The whole grid reveals as one block. We deliberately do NOT
       * animate individual cells — the hairline-grid pattern uses
       * `bg-[--border-1]` on the wrapper and `gap-px` for the rules,
       * so any per-cell opacity animation would expose the grey grid
       * through transparent cards on the way in. Block-level reveal
       * keeps the cells opaque from frame 1.
       */}
      <motion.div
        {...fadeInUp({ delay: 0.1, y: 28 })}
        className="mx-auto max-w-page px-6 lg:px-14"
      >
        <div className="grid grid-cols-1 gap-px border-b border-t border-[--border-1] bg-[--border-1] sm:grid-cols-2 lg:grid-cols-4">
          {ROWS.map((f) => (
            <div
              key={f.index}
              className="flex min-h-[220px] flex-col gap-3 bg-cream p-8 px-7"
            >
              <div className="font-mono text-xs font-medium uppercase tracking-[0.04em] text-[--fg-3]">
                {f.index}
              </div>
              <h3 className="text-[22px] font-bold leading-[1.1] tracking-[-0.022em] text-ink">
                {f.title}
              </h3>
              <p className="text-sm leading-[1.55] text-[--fg-2]">{f.body}</p>
              <div className="mt-auto inline-flex items-center gap-1 font-mono text-[11px] text-[--fg-3]">
                <kbd className="kbd !min-w-0 !h-[22px] !px-1.5 !text-[11px] !font-medium">
                  {f.kbd}
                </kbd>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/**
 * Shared section head — 2-column "headline + lede" layout used across
 * marketing sections (FeatureGrid, InverseSection, Keybindings,
 * Principles). The h2 and p both reveal independently on scroll, h2
 * leading, p following at +150ms — same cadence as the hero stagger.
 */
export function SectionHead({
  h2,
  p,
  inverse = false,
}: {
  h2: ReactNode;
  p: ReactNode;
  inverse?: boolean;
}) {
  return (
    <div className="mb-16 grid items-end gap-x-14 gap-y-6 lg:grid-cols-[1.2fr_1fr]">
      <motion.h2
        {...displayReveal()}
        className="m-0 max-w-[14ch] text-[40px] font-black leading-[0.98] tracking-[-0.04em] sm:text-[52px] lg:text-[72px]"
        style={{
          ...MOTION_LAYER_STYLE,
          fontWeight: 900,
          color: inverse ? "var(--fg-on-ink-1)" : "var(--fg-1)",
          textWrap: "balance",
        }}
      >
        {h2}
      </motion.h2>
      <motion.p
        {...fadeInUp({ delay: 0.25 })}
        className="m-0 text-[18px] leading-[1.55] tracking-[-0.011em]"
        style={{
          ...MOTION_LAYER_STYLE,
          color: inverse ? "var(--fg-on-ink-2)" : "var(--fg-2)",
        }}
      >
        {p}
      </motion.p>
    </div>
  );
}
