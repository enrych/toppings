import Image from "next/image";
import Link from "next/link";
import firefoxIcon from "@/assets/icons/firefox.svg";
import githubIcon from "@/assets/icons/github.svg";
import InstallButton from "@/components/InstallButton";
import WatchMockup from "./WatchMockup";
import {
  BROWSER_TARGET,
  EXTERNAL_URL,
  WEBSITE_HERO,
} from "toppings-constants";

/**
 * Hero — implements the design-system handoff.
 *
 * The visual on the right is a product mockup of YouTube with Toppings
 * actually working inside it — Audio Mode veil over the player, amber
 * loop markers on the progress bar, amber Toppings buttons in the
 * controls, and the playlist-runtime card below. This is product-led
 * visual storytelling (per the design's principle of "the brand asserts
 * itself fully" in the playlist-runtime card area).
 *
 * The pizza-slice logo lives in the Navbar and Footer — it's a brand
 * mark for the nav lockup, not a decoration. The hero earns its visual
 * weight from the actual product.
 *
 *  - Left column (1.35fr): eyebrow, oversized headline with amber
 *    highlighter on "way", lede, three CTAs, trust meta
 *  - Right column (1fr): the watch-page mockup, sized to roughly 520px
 *    on desktop; stacks below the copy on mobile
 */
export default function Hero() {
  return (
    <section className="px-6 pb-24 pt-[88px] lg:px-14 lg:pb-[96px]">
      <div className="mx-auto grid max-w-page gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
        <div>
          <div className="t-eyebrow mb-6 inline-flex items-center gap-[10px] !text-[--fg-2]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
            {WEBSITE_HERO.EYEBROW}
          </div>

          <h1
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
          </h1>

          <p className="mt-7 max-w-[560px] text-[19px] leading-[1.5] tracking-[-0.011em] text-[--fg-2]">
            {WEBSITE_HERO.LEDE}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
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
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[--fg-3]">
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
          </div>
        </div>

        {/* Product mockup — Toppings inside YouTube. */}
        <div className="relative w-full lg:max-w-none">
          <WatchMockup />
        </div>
      </div>
    </section>
  );
}
