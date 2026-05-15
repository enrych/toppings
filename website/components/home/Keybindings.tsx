"use client";
import { motion } from "framer-motion";
import { WEBSITE_HOME_KEYBINDINGS } from "toppings-constants";
import { SectionHead } from "./FeatureGrid";
import { fadeInUp } from "./motion";

/**
 * Keybindings section. Two-column hairline list of six shortcuts. Each row:
 * label + one-line description on the left, a key cluster on the right.
 * Keys use the shared `.kbd` chip (ink fill, off-white text).
 */
export default function Keybindings() {
  const {
    SECTION_HEADLINE_BEFORE,
    SECTION_HEADLINE_HIGHLIGHT,
    SECTION_HEADLINE_AFTER,
    SECTION_LEDE,
    ROWS,
  } = WEBSITE_HOME_KEYBINDINGS;

  return (
    <section className="py-24 lg:py-[96px]">
      <div className="mx-auto max-w-page px-6 lg:px-14">
        <SectionHead
          h2={
            <>
              {SECTION_HEADLINE_BEFORE}
              <span className="amber-underline">{SECTION_HEADLINE_HIGHLIGHT}</span>
              {SECTION_HEADLINE_AFTER}
            </>
          }
          p={SECTION_LEDE}
        />

        <div className="grid grid-cols-1 gap-x-16 border-t border-[--border-1] lg:grid-cols-2">
          {ROWS.map((row, i) => (
            <motion.div
              key={i}
              {...fadeInUp({ delay: (i % 3) * 0.1, y: 16 })}
              className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[--border-1] py-[18px]"
            >
              <div>
                <div className="text-[15px] font-medium tracking-[-0.011em] text-ink">
                  {row.label}
                </div>
                <div className="mt-[3px] text-[12.5px] text-[--fg-3]">
                  {row.desc}
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <kbd className="kbd">{row.combo[0]}</kbd>
                <span className="text-xs font-medium text-[--fg-3]">
                  {row.sep}
                </span>
                <kbd className="kbd">{row.combo[1]}</kbd>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
