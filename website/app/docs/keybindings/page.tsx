import Link from "next/link";
import Pager from "@/components/docs/Pager";
import { ROUTE } from "@/lib/site.data";
import { DOCS_PAGE } from "../pages.data";
import {
  KEYBINDING_GROUPS,
  type DocsKeybindingRow,
} from "./data";

function Combo({ row }: { row: DocsKeybindingRow }) {
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
  const page = DOCS_PAGE.KEYBINDINGS;
  const total = KEYBINDING_GROUPS.reduce((n, g) => n + g.rows.length, 0);

  return (
    <main className="docs-main">
      <div className="docs-crumbs">
        <Link href={ROUTE.DOCS}>Docs</Link>
        <span className="sep">/</span>
        <span>{page.CRUMB_GROUP}</span>
        <span className="sep">/</span>
        <span className="current">{page.CRUMB_CURRENT}</span>
      </div>

      <div className="docs-eyebrow">
        <span className="dot" />
        {page.EYEBROW}
      </div>

      <h1 className="docs-title">
        {page.TITLE_BEFORE}
        <span className="amber-underline">{page.TITLE_HIGHLIGHT}</span>
        {page.TITLE_AFTER}
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

      {KEYBINDING_GROUPS.map((group) => (
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

      <Pager currentHref={ROUTE.DOCS_KEYBINDINGS} />
    </main>
  );
}
