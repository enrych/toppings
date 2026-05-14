import Image from "next/image";
import Link from "next/link";
import toppingsLogo from "@/assets/brand/toppings-logo-512.png";
import {
  WEBSITE_BRAND,
  WEBSITE_FOOTER_BRAND_ALT,
  WEBSITE_FOOTER_COPY,
  WEBSITE_FOOTER_LINK_GROUPS,
  WEBSITE_LINK_PROTOCOL_PREFIX,
  WEBSITE_VERSION_DISPLAY,
  BROWSER_TARGET,
} from "toppings-constants";

/**
 * Footer. Ink ground (per design: "the page closes on the brand's inverse
 * note"). Brand lockup top-left, three link columns to the right, hairline
 * divider, GPL-3.0 + version on the bottom rule.
 */
export default function Footer() {
  return (
    <footer className="footer bg-ink text-[--fg-on-ink-1]">
      <div className="mx-auto max-w-page px-6 pb-8 pt-20 lg:px-14">
        <div className="grid gap-14 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <Image
                src={toppingsLogo}
                alt={WEBSITE_FOOTER_BRAND_ALT}
                width={36}
                height={36}
                className="h-9 w-9"
              />
              <span
                className="text-[22px] font-black tracking-[-0.04em]"
                style={{ fontWeight: 900 }}
              >
                {WEBSITE_BRAND.NAME}
              </span>
            </div>
            <p className="max-w-[280px] text-sm leading-[1.5] text-[--fg-on-ink-2]">
              {WEBSITE_FOOTER_COPY.TAGLINE}
            </p>
          </div>
          {WEBSITE_FOOTER_LINK_GROUPS.map((g) => (
            <div key={g.title}>
              <h4 className="t-eyebrow mb-[18px] !text-[--fg-on-ink-2]">
                {g.title}
              </h4>
              <ul className="grid gap-3">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      target={
                        l.href.startsWith(WEBSITE_LINK_PROTOCOL_PREFIX)
                          ? BROWSER_TARGET.BLANK
                          : undefined
                      }
                      className="text-sm text-[--fg-on-ink-1] transition-colors duration-150 hover:text-amber"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex items-center justify-between border-t border-[--border-on-ink-1] pt-6 text-xs text-[--fg-on-ink-2]">
          <span>
            {WEBSITE_FOOTER_COPY.LICENSE_LINE_PREFIX}
            {new Date().getFullYear()}
            {WEBSITE_FOOTER_COPY.LICENSE_LINE_SUFFIX}
          </span>
          <span className="font-mono">
            v
            {process.env.NEXT_PUBLIC_TOPPINGS_VERSION ??
              WEBSITE_VERSION_DISPLAY.FOOTER_FALLBACK}
          </span>
        </div>
      </div>
    </footer>
  );
}
