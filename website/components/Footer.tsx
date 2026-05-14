import Image from "next/image";
import Link from "next/link";

interface LinkGroup {
  title: string;
  links: Array<{ label: string; href: string }>;
}

const GROUPS: LinkGroup[] = [
  {
    title: "Product",
    links: [
      {
        label: "Add to Chrome",
        href: "https://chrome.google.com/webstore/detail/toppings/aemiblppibhggpgijajindcmmomboibl",
      },
      {
        label: "Add to Firefox",
        href: "https://addons.mozilla.org/en-US/firefox/addon/toppings/",
      },
      {
        label: "What’s new",
        href: "https://github.com/enrych/toppings/releases",
      },
    ],
  },
  {
    title: "Docs",
    links: [
      { label: "Read Wiki", href: "https://github.com/enrych/toppings/wiki" },
      {
        label: "Keybindings",
        href: "https://github.com/enrych/toppings/wiki/Keybindings",
      },
      { label: "FAQ", href: "https://github.com/enrych/toppings/wiki" },
    ],
  },
  {
    title: "Open source",
    links: [
      { label: "Source code", href: "https://github.com/enrych/toppings" },
      {
        label: "Report a bug",
        href: "https://github.com/enrych/toppings/issues",
      },
      { label: "Become a sponsor", href: "https://darhkvoyd.me/sponsor" },
    ],
  },
];

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
                src="/brand/toppings-logo-512.png"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9"
              />
              <span
                className="text-[22px] font-black tracking-[-0.04em]"
                style={{ fontWeight: 900 }}
              >
                Toppings
              </span>
            </div>
            <p className="max-w-[280px] text-sm leading-[1.5] text-[--fg-on-ink-2]">
              A free, open-source browser extension for total control over
              YouTube. Built by Enrych.
            </p>
          </div>
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h4 className="t-eyebrow mb-[18px] !text-[--fg-on-ink-2]">
                {g.title}
              </h4>
              <ul className="grid gap-3">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      target={l.href.startsWith("http") ? "_blank" : undefined}
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
          <span>GPL-3.0 · {new Date().getFullYear()} · Toppings</span>
          <span className="font-mono">
            v{process.env.NEXT_PUBLIC_TOPPINGS_VERSION ?? "2.4.0"}
          </span>
        </div>
      </div>
    </footer>
  );
}
