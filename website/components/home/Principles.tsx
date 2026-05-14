import { WEBSITE_HOME_PRINCIPLES } from "toppings-constants";
import { SectionHead } from "./FeatureGrid";

/**
 * Three brand principles. Single amber accent appears on the highlighted
 * word in each principle's headline. No per-card tonal variation.
 */
export default function Principles() {
  const { SECTION_HEADLINE, SECTION_LEDE, CARDS } = WEBSITE_HOME_PRINCIPLES;

  return (
    <section className="py-24 lg:py-[96px]">
      <div className="mx-auto max-w-page px-6 lg:px-14">
        <SectionHead h2={SECTION_HEADLINE} p={SECTION_LEDE} />
        <div className="grid grid-cols-1 gap-12 border-t border-[--border-1] pt-6 md:grid-cols-3">
          {CARDS.map((c) => (
            <div key={c.num}>
              <span className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.04em] text-[--fg-3]">
                {c.num}
              </span>
              <h3
                className="m-0 mb-3 text-[36px] font-black leading-[1] tracking-[-0.04em] text-ink"
                style={{ fontWeight: 900 }}
              >
                {c.title_before}
                <span className="text-amber">{c.title_highlight}</span>
                {c.title_after}
              </h3>
              <p className="m-0 text-[14.5px] leading-[1.6] text-[--fg-2]">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
