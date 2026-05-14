import Image from "next/image";
import Link from "next/link";
import firefoxIcon from "@/assets/icons/firefox.svg";
import githubIcon from "@/assets/icons/github.svg";
import InstallButton from "@/components/InstallButton";
import {
  BROWSER_TARGET,
  EXTERNAL_URL,
  WEBSITE_HERO,
} from "toppings-constants";

/**
 * Hero — implements the design-system handoff exactly.
 *
 *  - Eyebrow with amber dot + status line ("Free · Open source · v2.4.0")
 *  - Oversized editorial headline; the single decorative effect is the
 *    amber highlighter behind ONE word ("way")
 *  - Lede paragraph capped at ~620px
 *  - Three CTAs: primary (Add to Chrome, ink fill, amber arrow), ghost
 *    Firefox, ghost Source
 *  - Hero meta line: two short trust statements with ink-bold lead-ins
 */
export default function Hero() {
  return (
    <section className="px-6 pb-24 pt-[88px] lg:px-14 lg:pb-[96px]">
      <div className="mx-auto max-w-page">
        <div className="t-eyebrow mb-6 inline-flex items-center gap-[10px] !text-[--fg-2]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
          {WEBSITE_HERO.EYEBROW}
        </div>

        <h1
          className="text-[64px] font-black leading-[0.92] tracking-[-0.045em] text-ink sm:text-[88px] lg:text-[132px]"
          style={{ fontWeight: 900, textWrap: "balance" }}
        >
          {WEBSITE_HERO.HEADLINE_LINE_1}
          <br />
          {WEBSITE_HERO.HEADLINE_LINE_2_BEFORE}
          <span className="amber-underline">{WEBSITE_HERO.HEADLINE_LINE_2_HIGHLIGHT}</span>
          {WEBSITE_HERO.HEADLINE_LINE_2_AFTER}
        </h1>

        <p className="mt-7 max-w-[620px] text-[19px] leading-[1.5] tracking-[-0.011em] text-[--fg-2]">
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
    </section>
  );
}
