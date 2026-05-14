interface Feature {
  n: string;
  h: string;
  p: string;
  k: string;
}

const FEATURES: Feature[] = [
  {
    n: "01",
    h: "Loop a segment",
    p: "Drop two markers on the timeline. Anything between them loops, forever.",
    k: "⇧ L",
  },
  {
    n: "02",
    h: "Custom playback",
    p: "Set rates from 0.25x to 4x in any increment. Persists per channel.",
    k: ", · .",
  },
  {
    n: "03",
    h: "Auto-scroll Shorts",
    p: "When a Short ends, jump to the next. No taps. No thumbs.",
    k: "auto",
  },
  {
    n: "04",
    h: "Playlist runtimes",
    p: "See exactly how long that 47-video binge will take. Before you start.",
    k: "live",
  },
];

/**
 * FeatureGrid — four equal cells separated by hairline rules. No cards,
 * no shadows, no per-feature tonal variation. The geometric coldness is
 * the point.
 */
export default function FeatureGrid() {
  return (
    <section className="py-24 lg:py-[96px]">
      <div className="mx-auto max-w-page px-6 lg:px-14">
        <SectionHead
          h2={<>Four small superpowers.</>}
          p={
            <>
              We didn&rsquo;t redesign YouTube. We added the four buttons it
              forgot — nothing more, nothing less.
            </>
          }
        />
      </div>
      <div className="mx-auto max-w-page px-6 lg:px-14">
        <div className="grid grid-cols-1 gap-px border-b border-t border-[--border-1] bg-[--border-1] sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.n}
              className="flex min-h-[220px] flex-col gap-3 bg-cream p-8 px-7"
            >
              <div className="font-mono text-xs font-medium uppercase tracking-[0.04em] text-[--fg-3]">
                {f.n}
              </div>
              <h3 className="text-[22px] font-bold leading-[1.1] tracking-[-0.022em] text-ink">
                {f.h}
              </h3>
              <p className="text-sm leading-[1.55] text-[--fg-2]">{f.p}</p>
              <div className="mt-auto inline-flex items-center gap-1 font-mono text-[11px] text-[--fg-3]">
                <kbd className="kbd !min-w-0 !h-[22px] !px-1.5 !text-[11px] !font-medium">
                  {f.k}
                </kbd>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Shared section head — 2-column "headline + lede" layout used across the
 * marketing sections (FeatureGrid, Keybindings, Principles).
 */
export function SectionHead({
  h2,
  p,
  inverse = false,
}: {
  h2: React.ReactNode;
  p: React.ReactNode;
  inverse?: boolean;
}) {
  return (
    <div className="mb-16 grid items-end gap-x-14 gap-y-6 lg:grid-cols-[1.2fr_1fr]">
      <h2
        className="m-0 max-w-[14ch] text-[40px] font-black leading-[0.98] tracking-[-0.04em] sm:text-[52px] lg:text-[72px]"
        style={{
          fontWeight: 900,
          color: inverse ? "var(--fg-on-ink-1)" : "var(--fg-1)",
          textWrap: "balance",
        }}
      >
        {h2}
      </h2>
      <p
        className="m-0 text-[18px] leading-[1.55] tracking-[-0.011em]"
        style={{ color: inverse ? "var(--fg-on-ink-2)" : "var(--fg-2)" }}
      >
        {p}
      </p>
    </div>
  );
}
