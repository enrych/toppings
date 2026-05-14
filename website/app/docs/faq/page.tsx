"use client";
import { useState } from "react";
import Link from "next/link";
import Pager from "@/components/docs/Pager";
import { EXTERNAL_URL, BROWSER_TARGET } from "toppings-constants";

type Cat = "All" | "Privacy" | "Features" | "Install" | "Troubleshooting";

interface FaqEntry {
  cat: Exclude<Cat, "All">;
  q: string;
  a: React.ReactNode[];
}

const FAQ_CATS: Cat[] = ["All", "Privacy", "Features", "Install", "Troubleshooting"];

const FAQ: FaqEntry[] = [
  {
    cat: "Privacy",
    q: "Does Toppings collect any data?",
    a: [
      <>
        No. Toppings has zero analytics, zero telemetry, and zero remote
        calls. The extension requests two permissions — access to{" "}
        <code>youtube.com</code> (so it can inject buttons into the player)
        and <code>storage</code> (so your settings survive restarts). That is
        the complete list.
      </>,
      <>
        Don&rsquo;t trust us? Read the source — it&rsquo;s{" "}
        <Link href={EXTERNAL_URL.GITHUB_REPO} target={BROWSER_TARGET.BLANK}>
          on GitHub
        </Link>{" "}
        under GPL-3.0, and your network panel will be empty while it runs.
      </>,
    ],
  },
  {
    cat: "Privacy",
    q: "Where are my settings stored?",
    a: [
      <>
        In your browser&rsquo;s local extension storage. If you have browser
        profile sync enabled, they sync across your signed-in browsers via
        your browser vendor&rsquo;s sync system. Toppings does not run its
        own sync — we never see your settings.
      </>,
    ],
  },
  {
    cat: "Features",
    q: "How does Audio mode work?",
    a: [
      <>
        When you toggle Audio mode, Toppings hides the video frame and keeps
        the audio playing. You can replace the visible canvas with a solid
        black screen, an animated waveform, or your own background image.
      </>,
      <>
        The full timeline, chapters, playback controls, and speed keep
        working. Perfect for podcasts, talks, and live sets you don&rsquo;t
        need to see.
      </>,
    ],
  },
  {
    cat: "Features",
    q: "Can I loop more than one segment?",
    a: [
      <>
        Currently no — Loop supports a single in/out pair per video.
        Multi-segment loops are on the roadmap but we&rsquo;re being cautious
        about the UI complexity.
      </>,
    ],
  },
  {
    cat: "Features",
    q: "What&rsquo;s the maximum playback speed?",
    a: [
      <>
        16.0× technically, but audio decoders give up well below that. We
        recommend staying under 4× in the custom playback rate list, and
        Toppings will let you set increments as small as 0.0625× if you want.
      </>,
    ],
  },
  {
    cat: "Install",
    q: "Is Toppings available on mobile?",
    a: [
      <>
        Firefox for Android, yes — install from addons.mozilla.org directly.
        Chrome for Android does not support extensions; there&rsquo;s nothing
        we can do until Google ships extension support. Safari is not on our
        roadmap (different extension format, separate audit process).
      </>,
    ],
  },
  {
    cat: "Install",
    q: "Can I install Toppings without the store?",
    a: [
      <>
        Yes. Clone the GitHub repo, run <code>bun install</code> then{" "}
        <code>bun run build</code> in <code>web-ext/</code>, and load the
        unpacked <code>dist/</code> directory via <code>chrome://extensions</code>{" "}
        with Developer mode on. Same flow for Firefox via{" "}
        <code>about:debugging</code>.
      </>,
    ],
  },
  {
    cat: "Troubleshooting",
    q: "Toppings buttons don't appear on YouTube.",
    a: [
      <>
        Three things to check: (1) Is the extension enabled? (2) Did you
        reload the YouTube tab after installing? (3) Are you on a{" "}
        <code>/watch</code> URL? Toppings only injects controls on actual
        video pages, not the homepage or search results.
      </>,
      <>
        If all three are yes, open the popup — if the status dot is grey,
        Toppings hasn&rsquo;t detected an active YouTube tab. If it&rsquo;s
        amber but the buttons still don&rsquo;t appear, another YouTube
        extension may be conflicting. Disable other YouTube extensions one
        at a time to find the culprit.
      </>,
    ],
  },
  {
    cat: "Troubleshooting",
    q: "My keybindings stopped working.",
    a: [
      <>
        Keybindings only fire when the YouTube page is focused — if
        you&rsquo;re typing in a comment or the search box, they pause
        automatically (this is intentional). Click the video to refocus.
      </>,
    ],
  },
];

export default function DocsFaqPage() {
  const [cat, setCat] = useState<Cat>("All");
  const [open, setOpen] = useState<Set<number>>(new Set([0]));

  const filtered = FAQ.filter((f) => cat === "All" || f.cat === cat);

  const toggle = (i: number) => {
    const next = new Set(open);
    next.has(i) ? next.delete(i) : next.add(i);
    setOpen(next);
  };

  const counts: Record<Cat, number> = FAQ_CATS.reduce(
    (acc, c) => ({
      ...acc,
      [c]: c === "All" ? FAQ.length : FAQ.filter((f) => f.cat === c).length,
    }),
    {} as Record<Cat, number>,
  );

  return (
    <main className="docs-main">
      <div className="docs-crumbs">
        <Link href="/docs">Docs</Link>
        <span className="sep">/</span>
        <span>Reference</span>
        <span className="sep">/</span>
        <span className="current">FAQ</span>
      </div>

      <div className="docs-eyebrow">
        <span className="dot" />
        Frequently asked
      </div>

      <h1 className="docs-title">
        Questions, <span className="amber-underline">answered</span>.
      </h1>

      <p className="docs-lede">
        The short version of every conversation we&rsquo;ve had on GitHub
        Discussions. If yours isn&rsquo;t here,{" "}
        <Link
          href={`${EXTERNAL_URL.GITHUB_REPO}/discussions`}
          target={BROWSER_TARGET.BLANK}
          style={{
            textDecoration: "underline",
            textDecorationColor: "rgba(10,10,10,.2)",
            textUnderlineOffset: 4,
          }}
        >
          open a thread
        </Link>{" "}
        — we read all of them.
      </p>

      <div className="faq-cat-tabs">
        {FAQ_CATS.map((c) => (
          <button
            key={c}
            type="button"
            className={"faq-cat-tab" + (cat === c ? " active" : "")}
            onClick={() => {
              setCat(c);
              // Reset which item is "default open" so the first visible
              // entry of the new category is expanded by default.
              setOpen(new Set([0]));
            }}
          >
            {c}
            <span className="count">{counts[c]}</span>
          </button>
        ))}
      </div>

      <div className="faq-list">
        {filtered.map((f, i) => (
          <div
            key={f.q}
            className={"faq-item" + (open.has(i) ? " open" : "")}
          >
            <button
              type="button"
              className="faq-item__btn"
              onClick={() => toggle(i)}
              aria-expanded={open.has(i)}
            >
              <span className="faq-item__q">{f.q}</span>
              <span className="faq-item__toggle">
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            <div className="faq-item__a">
              <div className="faq-item__a-inner">
                {f.a.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pager currentHref="/docs/faq" />
    </main>
  );
}
