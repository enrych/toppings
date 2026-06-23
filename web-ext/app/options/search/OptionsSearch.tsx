import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fuzzySearch, type SearchResult } from "./searchIndex";

// ---------------------------------------------------------------------------
// Highlight helpers
// ---------------------------------------------------------------------------

/** Render `text` with characters at `indices` wrapped in <mark> runs. */
function HighlightedLabel({
  text,
  indices,
}: {
  text: string;
  indices: number[];
}) {
  if (indices.length === 0) return <>{text}</>;

  const indexSet = new Set(indices);
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < text.length) {
    if (indexSet.has(i)) {
      // Collect a consecutive run of matched chars.
      let run = "";
      while (i < text.length && indexSet.has(i)) {
        run += text[i];
        i++;
      }
      nodes.push(
        <mark key={i} className="tppng-search-highlight">
          {run}
        </mark>,
      );
    } else {
      let plain = "";
      while (i < text.length && !indexSet.has(i)) {
        plain += text[i];
        i++;
      }
      nodes.push(plain);
    }
  }

  return <>{nodes}</>;
}

// ---------------------------------------------------------------------------
// DOM targeting — find and flash the specific row for an entry
// ---------------------------------------------------------------------------

/**
 * Walks the rendered page DOM to find the element whose visible text matches
 * `labelText`. Searches <label> elements first (Field-based components), then
 * <h2> headings (Section titles), then any <span> leaf (PresetCard, etc.).
 *
 * Returns the element and the best ancestor "row" container to flash.
 */
function findRowByLabel(labelText: string): HTMLElement | null {
  // 1. <label> — rendered by Field, used by Input / Select / Switch / Keybinding
  for (const el of document.querySelectorAll<HTMLElement>("label")) {
    if (el.textContent?.trim() === labelText) {
      return closestRow(el) ?? el;
    }
  }

  // 2. <h2> — Section title
  for (const el of document.querySelectorAll<HTMLElement>("h2")) {
    if (el.textContent?.trim() === labelText) {
      return el.closest("section") as HTMLElement ?? el;
    }
  }

  // 3. Leaf <span> — PresetCard profile name, etc.
  for (const el of document.querySelectorAll<HTMLElement>("span")) {
    if (el.children.length === 0 && el.textContent?.trim() === labelText) {
      return closestRow(el) ?? el;
    }
  }

  return null;
}

/** Walk up ancestors looking for a row container (tw-py-* child of a Card). */
function closestRow(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement;
  while (node && node !== document.body) {
    const cls = node.className ?? "";
    if (
      typeof cls === "string" &&
      (cls.includes("tw-py-3") || cls.includes("tw-py-4"))
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function flashElement(el: HTMLElement): void {
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  el.classList.remove("tppng-section-flash");
  void (el as HTMLElement).offsetWidth; // force reflow
  el.classList.add("tppng-section-flash");
  setTimeout(() => el.classList.remove("tppng-section-flash"), 1000);
}

function flashSectionById(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.classList.remove("tppng-section-flash");
  void (el as HTMLElement).offsetWidth;
  el.classList.add("tppng-section-flash");
  setTimeout(() => el.classList.remove("tppng-section-flash"), 1000);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OptionsSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results: SearchResult[] = fuzzySearch(query);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      const { entry } = result;
      setQuery("");
      setOpen(false);
      setActiveIdx(0);
      navigate(entry.path);

      // After React renders the new page, try to find and flash the specific row.
      // If not found, fall back to section scroll.
      setTimeout(() => {
        const row = findRowByLabel(entry.label);
        if (row) {
          flashElement(row);
        } else if (entry.sectionId) {
          flashSectionById(entry.sectionId);
        }
      }, 150);
    },
    [navigate],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[activeIdx];
      if (r) handleSelect(r);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  // Close on outside click.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset active index when results change.
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  return (
    <div ref={containerRef} className="tw-relative tw-px-2 tw-pb-3">
      <div className="tw-relative tw-flex tw-items-center">
        <svg
          className="tw-absolute tw-left-2.5 tw-w-3.5 tw-h-3.5 tw-text-fg-subtle tw-pointer-events-none"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <circle cx="6.5" cy="6.5" r="4.5" />
          <line x1="10.5" y1="10.5" x2="14" y2="14" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search settings…"
          aria-label="Search settings"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="tw-w-full tw-bg-surface-hover tw-border tw-border-border-default tw-rounded-lg tw-pl-8 tw-pr-7 tw-py-1.5 tw-text-xs tw-text-fg tw-placeholder-fg-subtle focus:tw-outline-none focus:tw-border-accent tw-transition-colors"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="tw-absolute tw-right-2 tw-text-fg-subtle hover:tw-text-fg tw-transition-colors"
          >
            <svg
              className="tw-w-3 tw-h-3"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="tw-absolute tw-left-2 tw-right-2 tw-top-full tw-mt-1 tw-bg-surface-2 tw-border tw-border-border-default tw-rounded-xl tw-shadow-xl tw-z-50 tw-overflow-hidden">
          {results.map((result, i) => (
            <button
              key={`${result.entry.path}-${result.entry.label}-${result.entry.section}`}
              type="button"
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => handleSelect(result)}
              className={`tw-w-full tw-text-left tw-px-3 tw-py-2 tw-transition-colors ${
                i === activeIdx ? "tw-bg-surface-hover" : ""
              }`}
            >
              <div className="tw-text-xs tw-font-medium tw-text-fg tw-leading-snug">
                <HighlightedLabel
                  text={result.entry.label}
                  indices={result.matchedIndices}
                />
              </div>
              <div className="tw-text-[10px] tw-text-fg-subtle tw-mt-0.5">
                {result.entry.page}
                {result.entry.section ? ` › ${result.entry.section}` : ""}
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 1 && results.length === 0 && (
        <div className="tw-absolute tw-left-2 tw-right-2 tw-top-full tw-mt-1 tw-bg-surface-2 tw-border tw-border-border-default tw-rounded-xl tw-shadow-xl tw-z-50 tw-px-3 tw-py-3">
          <p className="tw-text-xs tw-text-fg-subtle">
            No results for "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
