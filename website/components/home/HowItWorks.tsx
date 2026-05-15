"use client";
import { motion } from "framer-motion";
import { WEBSITE_HOME_HOW_IT_WORKS } from "toppings-constants";
import { SectionHead } from "./FeatureGrid";
import { fadeInUp } from "./motion";

/**
 * "How it works" — three numbered steps in a hairline-divided row.
 * Brought back from the f82c6f6 era. Mono numerals lead each card, an
 * amber period sits on the corner of each number to keep the brand
 * accent active.
 *
 * Slots between Principles and FinalCTA in the page rhythm:
 *
 *   …Keybindings → Principles → HowItWorks → FinalCTA…
 */
export default function HowItWorks() {
  const { SECTION_HEADLINE, SECTION_LEDE, STEPS } = WEBSITE_HOME_HOW_IT_WORKS;
  return (
    <section className="py-24 lg:py-[96px]">
      <div className="mx-auto max-w-page px-6 lg:px-14">
        <SectionHead h2={SECTION_HEADLINE} p={SECTION_LEDE} />
        <div className="grid grid-cols-1 gap-10 border-t border-[--border-1] pt-10 md:grid-cols-3 lg:gap-14">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              {...fadeInUp({ delay: i * 0.18, y: 24 })}
            >
              <div className="mb-5 inline-flex items-baseline gap-2">
                <span
                  className="text-ink leading-none tracking-[-0.04em]"
                  style={{
                    fontWeight: 900,
                    fontSize: "clamp(56px, 6vw, 80px)",
                  }}
                >
                  {s.num}
                </span>
                <span className="text-amber text-2xl">.</span>
              </div>
              <h3 className="mb-2 text-[20px] font-semibold tracking-[-0.018em] text-ink">
                {s.title}
              </h3>
              <p className="m-0 max-w-xs text-[14.5px] leading-[1.6] text-[--fg-2]">
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
