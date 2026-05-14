import Link from "next/link";
import Pager from "@/components/docs/Pager";

interface KbRow {
  name: string;
  desc: string;
  combo: string[];
  single?: boolean;
}

interface KbGroup {
  title: string;
  rows: KbRow[];
}

/**
 * Keybindings reference. Mirrors the shortcut catalog the extension ships
 * with (see web-ext/src/background/store.ts defaults). Rows are grouped by
 * surface: Watch page, Seek, Shorts, Toppings (popup/global).
 */
const KB_GROUPS: KbGroup[] = [
  {
    title: "Watch page",
    rows: [
      {
        name: "Toggle Audio mode",
        desc: "Replace the video stream with audio-only",
        combo: ["B"],
        single: true,
      },
      {
        name: "Toggle Loop segment",
        desc: "Show two draggable markers on the timeline",
        combo: ["Z"],
        single: true,
      },
      {
        name: "Set loop in",
        desc: "Pin the start marker to the playhead",
        combo: ["Q"],
        single: true,
      },
      {
        name: "Set loop out",
        desc: "Pin the end marker to the playhead",
        combo: ["E"],
        single: true,
      },
      {
        name: "Toggle playback speed",
        desc: "Snap between 1× and your favorite fast rate",
        combo: ["X"],
        single: true,
      },
      {
        name: "Speed up",
        desc: "Increase playback rate by 0.25×",
        combo: ["W"],
        single: true,
      },
      {
        name: "Speed down",
        desc: "Reduce playback rate by 0.25×",
        combo: ["S"],
        single: true,
      },
    ],
  },
  {
    title: "Seek",
    rows: [
      {
        name: "Seek back",
        desc: "Custom duration (default 15s)",
        combo: ["A"],
        single: true,
      },
      {
        name: "Seek forward",
        desc: "Custom duration (default 15s)",
        combo: ["D"],
        single: true,
      },
    ],
  },
  {
    title: "Shorts",
    rows: [
      {
        name: "Toggle playback speed",
        desc: "Snap between 1× and your favorite fast rate",
        combo: ["X"],
        single: true,
      },
      {
        name: "Seek back",
        desc: "Custom duration (default 5s)",
        combo: ["A"],
        single: true,
      },
      {
        name: "Seek forward",
        desc: "Custom duration (default 5s)",
        combo: ["D"],
        single: true,
      },
    ],
  },
];

function Combo({ row }: { row: KbRow }) {
  if (row.single) {
    return (
      <div className="kb-row__combo">
        <kbd>{row.combo[0]}</kbd>
      </div>
    );
  }
  return (
    <div className="kb-row__combo">
      <kbd>{row.combo[0]}</kbd>
      <span className="sep">+</span>
      <kbd>{row.combo[1]}</kbd>
    </div>
  );
}

export default function DocsKeybindingsPage() {
  const total = KB_GROUPS.reduce((n, g) => n + g.rows.length, 0);

  return (
    <main className="docs-main">
      <div className="docs-crumbs">
        <Link href="/docs">Docs</Link>
        <span className="sep">/</span>
        <span>Reference</span>
        <span className="sep">/</span>
        <span className="current">Keybindings</span>
      </div>

      <div className="docs-eyebrow">
        <span className="dot" />
        Reference
      </div>

      <h1 className="docs-title">
        Every key, <span className="amber-underline">yours</span> to remap.
      </h1>

      <p className="docs-lede">
        Toppings ships with {total} default shortcuts. All of them are
        rebindable from the extension&rsquo;s options page. Bindings only fire
        on{" "}
        <code
          style={{
            font: "500 14px/1 var(--font-mono)",
            background: "rgba(10,10,10,.06)",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          youtube.com
        </code>{" "}
        — never globally, never when you&rsquo;re typing in a text field.
      </p>

      <div className="kb-intro">
        <div>
          <div className="stat">{total}</div>
          <div className="lbl">Default shortcuts</div>
        </div>
        <div>
          <div className="stat">
            <span className="amber">100%</span>
          </div>
          <div className="lbl">Rebindable</div>
        </div>
        <div>
          <div className="stat">0</div>
          <div className="lbl">Global hotkeys</div>
        </div>
      </div>

      {KB_GROUPS.map((group) => (
        <section className="kb-section" key={group.title}>
          <div className="kb-section__head">
            <div className="kb-section__title">{group.title}</div>
            <div className="kb-section__count">
              {group.rows.length} shortcut{group.rows.length === 1 ? "" : "s"}
            </div>
          </div>
          <div className="kb-table">
            {group.rows.map((row, i) => (
              <div className="kb-row" key={`${group.title}-${i}`}>
                <div className="kb-row__name">{row.name}</div>
                <div className="kb-row__desc">{row.desc}</div>
                <Combo row={row} />
                <span className="kb-row__edit">Rebind</span>
              </div>
            ))}
          </div>
        </section>
      ))}

      <Pager currentHref="/docs/keybindings" />
    </main>
  );
}
