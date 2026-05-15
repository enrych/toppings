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
import { EASE_EXPO_OUT } from "./motion";

/**
 * Hero — implements the design-system handoff with the watch-page
 * product mockup as the right-column visual.
 *
 * Motion: a slow, generous staggered cascade on mount. Tone is "the
 * page is settling in", not "the page is performing". Defaults match
 * the editorial pace in components/home/motion.ts — body content
 * travels 24px over 900ms, display headlines 40px over 1100ms, with
 * 150–200ms gaps between siblings.
 */
const reveal = (delay = 0, duration = 0.9, y = 24) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration, ease: EASE_EXPO_OUT, delay },
});

export default function Hero() {
  return (
    <section className="px-6 pb-24 pt-[88px] lg:px-14 lg:pb-[96px]">
      <div className="mx-auto grid max-w-page gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
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
            style={{ fontWeight: 900, textWrap: "balance" }}
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

        {/* Product mockup — Toppings inside YouTube. */}
        <motion.div
          {...reveal(0.25, 1.2, 36)}
          className="relative w-full lg:max-w-none"
        >
          <WatchMockup />
        </motion.div>
      </div>
    </section>
  );
}
