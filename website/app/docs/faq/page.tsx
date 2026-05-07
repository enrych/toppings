"use client";
import { useState } from "react";
import Link from "next/link";
import Pager from "@/components/docs/Pager";
import { ROUTE } from "@/lib/site.data";
import { DOCS_PAGE } from "../pages.data";
import {
  FAQ_CATEGORIES,
  FAQ_ENTRIES,
  type FaqCategoryFilter,
} from "./data";
import { DocsInlineParts, DocsRichText } from "@/lib/docs-rich-text";

export default function DocsFaqPage() {
  const page = DOCS_PAGE.FAQ;
  const [cat, setCat] = useState<FaqCategoryFilter>("All");
  const [open, setOpen] = useState<Set<number>>(new Set([0]));

  const filtered = FAQ_ENTRIES.filter(
    (entry) => cat === "All" || entry.category === cat,
  );

  const toggle = (i: number) => {
    const next = new Set(open);
    next.has(i) ? next.delete(i) : next.add(i);
    setOpen(next);
  };

  const counts = FAQ_CATEGORIES.reduce(
    (acc, c) => ({
      ...acc,
      [c]:
        c === "All"
          ? FAQ_ENTRIES.length
          : FAQ_ENTRIES.filter((entry) => entry.category === c).length,
    }),
    {} as Record<FaqCategoryFilter, number>,
  );

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
        <DocsInlineParts parts={page.LEDE[0]} />
      </p>

      <div className="faq-cat-tabs">
        {FAQ_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={"faq-cat-tab" + (cat === c ? " active" : "")}
            onClick={() => {
              setCat(c);
              setOpen(new Set([0]));
            }}
          >
            {c}
            <span className="count">{counts[c]}</span>
          </button>
        ))}
      </div>

      <div className="faq-list">
        {filtered.map((entry, i) => (
          <div
            key={entry.question}
            className={"faq-item" + (open.has(i) ? " open" : "")}
          >
            <button
              type="button"
              className="faq-item__btn"
              onClick={() => toggle(i)}
              aria-expanded={open.has(i)}
            >
              <span className="faq-item__q">{entry.question}</span>
              <span className="faq-item__toggle">
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            <div className="faq-item__a">
              <div className="faq-item__a-inner">
                <DocsRichText paragraphs={entry.paragraphs} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pager currentHref={ROUTE.DOCS_FAQ} />
    </main>
  );
}
