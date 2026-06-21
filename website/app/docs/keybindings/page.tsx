import type { Metadata } from "next";
import DocsPageHeader from "../components/DocsPageHeader";
import Pager from "../components/Pager";
import { ROUTE } from "@/constants/site";
import { GROUPS, PAGE, type KeybindingRow } from "./data";

export const metadata: Metadata = {
  title: "Toppings — Keybindings",
  description:
    "Every default Toppings shortcut on YouTube — all rebindable from the options page.",
};

function Combo({ row }: { row: KeybindingRow }) {
  if (row.SINGLE) {
    return (
      <div className="kb-row__combo">
        <kbd>{row.COMBO[0]}</kbd>
      </div>
    );
  }
  return (
    <div className="kb-row__combo">
      <kbd>{row.COMBO[0]}</kbd>
      <span className="sep">+</span>
      <kbd>{row.COMBO[1]}</kbd>
    </div>
  );
}

export default function DocsKeybindingsPage() {
  const total = GROUPS.reduce((n, g) => n + g.ROWS.length, 0);

  return (
    <main className="docs-main">
      <DocsPageHeader {...PAGE} />

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

      {GROUPS.map((group) => (
        <section className="kb-section" key={group.TITLE}>
          <div className="kb-section__head">
            <div className="kb-section__title">{group.TITLE}</div>
            <div className="kb-section__count">
              {group.ROWS.length} shortcut{group.ROWS.length === 1 ? "" : "s"}
            </div>
          </div>
          <div className="kb-table">
            {group.ROWS.map((row, i) => (
              <div className="kb-row" key={`${group.TITLE}-${i}`}>
                <div className="kb-row__name">{row.NAME}</div>
                <div className="kb-row__desc">{row.DESC}</div>
                <Combo row={row} />
                <span className="kb-row__edit">Rebind</span>
              </div>
            ))}
          </div>
        </section>
      ))}

      <Pager currentHref={ROUTE.DOCS_KEYBINDINGS} />
    </main>
  );
}
