import Image from "next/image";
import Link from "next/link";
import firefoxIcon from "@/assets/icons/firefox.svg";
import githubIcon from "@/assets/icons/github.svg";
import InstallButton from "@/components/InstallButton";

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
          Free · Open source · v2.4.0
        </div>

        <h1
          className="text-[64px] font-black leading-[0.92] tracking-[-0.045em] text-ink sm:text-[88px] lg:text-[132px]"
          style={{ fontWeight: 900, textWrap: "balance" }}
        >
          Your YouTube,
          <br />
          your <span className="amber-underline">way</span>.
        </h1>

        <p className="mt-7 max-w-[620px] text-[19px] leading-[1.5] tracking-[-0.011em] text-[--fg-2]">
          A free, open-source browser extension. Audio mode, custom playback
          rates, looped segments, playlist runtimes, Shorts auto-scroll.
          Small. Considered. Out of your way.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <InstallButton />
          <Link
            href="https://addons.mozilla.org/en-US/firefox/addon/toppings/"
            target="_blank"
            className="btn btn--ghost"
          >
            <Image src={firefoxIcon} alt="" width={18} height={18} />
            Firefox
          </Link>
          <Link
            href="https://github.com/enrych/toppings"
            target="_blank"
            className="btn btn--ghost"
          >
            <Image src={githubIcon} alt="" width={18} height={18} />
            Source
          </Link>
        </div>

        <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[--fg-3]">
          <span>
            <strong className="font-semibold text-ink">0 trackers.</strong> No
            data leaves your browser.
          </span>
          <span>
            <strong className="font-semibold text-ink">GPL-3.0.</strong> Yours
            to fork, modify, ship.
          </span>
        </div>
      </div>
    </section>
  );
}
