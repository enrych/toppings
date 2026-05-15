"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import firefoxIcon from "@/assets/icons/firefox.svg";
import githubIcon from "@/assets/icons/github.svg";
import InstallButton from "@/components/InstallButton";
import WatchMockup from "./WatchMockup";
import {
  BROWSER_TARGET,
  EXTERNAL_URL,
  WEBSITE_HERO,
} from "toppings-constants";
import { EASE_EXPO_OUT, MOTION_LAYER_STYLE } from "./motion";

/**
 * Hero — implements the design-system handoff with the watch-page
 * product mockup as the right-column visual.
 *
 * Motion: a slow, generous staggered cascade on mount. Tone is "the
 * page is settling in", not "the page is performing". Defaults match
 * the editorial pace in components/home/motion.ts — body content
 * travels 24px over 900ms, display headlines 40px over 1100ms, with
 * 150–200ms gaps between siblings.
 *
 * MOTION_LAYER_STYLE keeps the GPU layer pinned so text doesn't
 * subpixel-AA flicker when the transform ends. See motion.ts.
 */
const reveal = (delay = 0, duration = 0.9, y = 24) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration, ease: EASE_EXPO_OUT, delay },
  style: MOTION_LAYER_STYLE,
});

export default function Hero() {
  return (
    <section className="overflow-hidden px-6 pb-24 pt-[88px] lg:px-14 lg:pb-[96px]">
      {/*
       * Hero composition: tighter gap (gap-10 desktop, was gap-16) and a
       * 1fr/1.1fr ratio that gives the mockup slightly more presence.
       * The two halves now read as one composed unit rather than two
       * stacked panels with negative space between them.
       *
       * `items-center` keeps the mockup vertically anchored against the
       * center of the text block; the mockup is shorter after the
       * title/channel trim, so the visual baseline lines up better.
       */}
      <div className="mx-auto grid max-w-page gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-10">
        <div>
          <motion.div
            {...reveal(0, 0.8, 16)}
            className="t-eyebrow mb-6 inline-flex items-center gap-[10px] !text-[--fg-2]"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
            {WEBSITE_HERO.EYEBROW}
          </motion.div>

          <motion.h1
            {...reveal(0.1, 1.1, 40)}
            className="text-[56px] font-black leading-[0.92] tracking-[-0.045em] text-ink sm:text-[72px] lg:text-[96px]"
            // Spread layer style first (from reveal()) so our explicit
            // typographic style merges on top without dropping
            // willChange / translateZ / antialias.
            style={{
              ...MOTION_LAYER_STYLE,
              fontWeight: 900,
              textWrap: "balance",
            }}
          >
            {WEBSITE_HERO.HEADLINE_LINE_1}
            <br />
            {WEBSITE_HERO.HEADLINE_LINE_2_BEFORE}
            <span className="amber-underline">
              {WEBSITE_HERO.HEADLINE_LINE_2_HIGHLIGHT}
            </span>
            {WEBSITE_HERO.HEADLINE_LINE_2_AFTER}
          </motion.h1>

          <motion.p
            {...reveal(0.35)}
            className="mt-7 max-w-[560px] text-[19px] leading-[1.5] tracking-[-0.011em] text-[--fg-2]"
          >
            {WEBSITE_HERO.LEDE}
          </motion.p>

          <motion.div
            {...reveal(0.55)}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <InstallButton />
            <Link
              href={EXTERNAL_URL.FIREFOX_AMO_TOPPINGS}
              target={BROWSER_TARGET.BLANK}
              className="btn btn--ghost"
            >
              <Image src={firefoxIcon} alt="" width={18} height={18} />
              {WEBSITE_HERO.FIREFOX_BUTTON}
            </Link>
            <Link
              href={EXTERNAL_URL.GITHUB_REPO}
              target={BROWSER_TARGET.BLANK}
              className="btn btn--ghost"
            >
              <Image src={githubIcon} alt="" width={18} height={18} />
              {WEBSITE_HERO.SOURCE_BUTTON}
            </Link>
          </motion.div>

          <motion.div
            {...reveal(0.75)}
            className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[--fg-3]"
          >
            <span>
              <strong className="font-semibold text-ink">
                {WEBSITE_HERO.TRUST_TRACKERS_LEAD}
              </strong>
              {WEBSITE_HERO.TRUST_TRACKERS_REST}
            </span>
            <span>
              <strong className="font-semibold text-ink">
                {WEBSITE_HERO.TRUST_LICENSE_LEAD}
              </strong>
              {WEBSITE_HERO.TRUST_LICENSE_REST}
            </span>
          </motion.div>
        </div>

        {/*
         * Product mockup — Toppings inside YouTube.
         *
         * Wrapped in three pieces of brand polish so it doesn't read as
         * a foreign black block dropped on the cream page:
         *  - A soft amber wash behind the frame, blurred and oversized,
         *    bridges the cream→ink contrast.
         *  - A faint amber edge glow tints the immediate surround warm.
         *  - The frame itself sits at -1.2° so the composition feels
         *    captured rather than placed. (No springs, no hover wobble.)
         */}
        <motion.div
          {...reveal(0.25, 1.2, 36)}
          className="relative w-full lg:max-w-none"
        >
          {/* Soft amber wash behind the frame. */}
          <div
            aria-hidden
            className="absolute pointer-events-none -inset-12 -z-10"
            style={{
              background:
                "radial-gradient(60% 55% at 50% 55%, rgba(252,169,41,0.22), rgba(252,169,41,0) 70%)",
              filter: "blur(12px)",
            }}
          />
          <div style={{ transform: "rotate(-1.2deg)" }}>
            <WatchMockup />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
