"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import firefoxIcon from "@/assets/icons/firefox.svg";
import githubIcon from "@/assets/icons/github.svg";
import InstallButton from "@/components/InstallButton";
import {
  BROWSER_TARGET,
  EXTERNAL_URL,
  WEBSITE_HOME_FINAL_CTA,
} from "toppings-constants";
import { fadeInUp, displayReveal, MOTION_LAYER_STYLE } from "./motion";

/**
 * Centered closing CTA. Cream ground (per design — final section does not
 * shift to ink). One amber-highlighted word in the headline ("YouTube"),
 * the standard 3-button CTA cluster, and a small mono meta line listing
 * supported browsers.
 */
export default function FinalCTA() {
  const {
    HEADLINE_BEFORE,
    HEADLINE_HIGHLIGHT,
    HEADLINE_AFTER,
    LEDE,
    FIREFOX_BUTTON,
    SOURCE_BUTTON,
    META,
  } = WEBSITE_HOME_FINAL_CTA;

  return (
    <section className="px-6 pb-24 pt-32 text-center lg:px-14 lg:pb-[96px] lg:pt-[128px]">
      <div className="mx-auto max-w-page">
        <motion.h2
          {...displayReveal()}
          className="mx-auto mb-6 max-w-[18ch] text-[56px] font-black leading-[0.94] tracking-[-0.045em] text-ink sm:text-[80px] lg:text-[112px]"
          style={{ ...MOTION_LAYER_STYLE, fontWeight: 900, textWrap: "balance" }}
        >
          {HEADLINE_BEFORE}
          <span className="amber-underline">{HEADLINE_HIGHLIGHT}</span>
          {HEADLINE_AFTER}
        </motion.h2>
        <motion.p
          {...fadeInUp({ delay: 0.25 })}
          className="mx-auto mb-10 max-w-[52ch] text-[18px] leading-[1.5] tracking-[-0.011em] text-[--fg-2]"
        >
          {LEDE}
        </motion.p>
        <motion.div
          {...fadeInUp({ delay: 0.45 })}
          className="flex flex-wrap justify-center gap-3"
        >
          <InstallButton />
          <Link
            href={EXTERNAL_URL.FIREFOX_AMO_TOPPINGS}
            target={BROWSER_TARGET.BLANK}
            className="btn btn--ghost"
          >
            <Image src={firefoxIcon} alt="" width={18} height={18} />
            {FIREFOX_BUTTON}
          </Link>
          <Link
            href={EXTERNAL_URL.GITHUB_REPO}
            target={BROWSER_TARGET.BLANK}
            className="btn btn--ghost"
          >
            <Image src={githubIcon} alt="" width={18} height={18} />
            {SOURCE_BUTTON}
          </Link>
        </motion.div>
        <motion.div
          {...fadeInUp({ delay: 0.6 })}
          className="mt-8 font-mono text-xs font-medium uppercase tracking-[0.04em] text-[--fg-3]"
        >
          {META}
        </motion.div>
      </div>
    </section>
  );
}
