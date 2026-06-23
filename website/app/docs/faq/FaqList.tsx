"use client";
import { useState } from "react";
import { CATEGORIES, ENTRIES, type CategoryFilter } from "./data";

export default function FaqList() {
  const [cat, setCat] = useState<CategoryFilter>("All");
  const [open, setOpen] = useState<Set<number>>(new Set([0]));

  const filtered = ENTRIES.filter(
    (entry) => cat === "All" || entry.CATEGORY === cat,
  );

  const toggle = (i: number) => {
    const next = new Set(open);
    next.has(i) ? next.delete(i) : next.add(i);
    setOpen(next);
  };

  const counts = CATEGORIES.reduce(
    (acc, c) => ({
      ...acc,
      [c]:
        c === "All"
          ? ENTRIES.length
          : ENTRIES.filter((entry) => entry.CATEGORY === c).length,
    }),
    {} as Record<CategoryFilter, number>,
  );

  return (
    <>
      <div className="faq-cat-tabs">
        {CATEGORIES.map((c) => (
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
            key={entry.QUESTION}
            className={"faq-item" + (open.has(i) ? " open" : "")}
          >
            <button
              type="button"
              className="faq-item__btn"
              onClick={() => toggle(i)}
              aria-expanded={open.has(i)}
            >
              <span className="faq-item__q">{entry.QUESTION}</span>
              <span className="faq-item__toggle">
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            <div className="faq-item__a">
              <div className="faq-item__a-inner">
                {entry.PARAGRAPHS.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
