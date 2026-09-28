import { useEffect, useRef, useState } from "preact/hooks";
import Icon from "@/ui/primitives/Icon";
import { navigate } from "../router";
import { fuzzySearch, type SearchEntry, type SearchResult } from "./searchIndex";

function Highlighted({ text, indices }: { text: string; indices: number[] }) {
  const marks = new Set(indices);
  return <>{[...text].map((ch, i) => (marks.has(i) ? <mark class="tppng-search-highlight">{ch}</mark> : ch))}</>;
}

// Results are located by their rendered label: a field's <label> first, then
// a section heading, so a row wins over the section that contains it. The
// search stays inside the entry's section, because the Shortcuts page repeats
// labels across groups.
function findByLabel(label: string, scope: ParentNode): HTMLElement | null {
  for (const el of scope.querySelectorAll<HTMLElement>("label, h2")) {
    if (el.textContent?.trim() !== label) continue;
    return el.closest<HTMLElement>("section, [class*='tw-py-3']") ?? el;
  }
  return null;
}

function flash(el: HTMLElement): void {
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  el.classList.remove("tppng-section-flash");
  void el.offsetWidth;
  el.classList.add("tppng-section-flash");
  setTimeout(() => el.classList.remove("tppng-section-flash"), 1000);
}

export default function OptionsSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const results = fuzzySearch(query);

  const go = ({ entry }: SearchResult) => {
    setQuery("");
    setOpen(false);
    navigate(entry.segment);
    // The row exists only once the page has rendered.
    setTimeout(() => {
      const section = entry.sectionId ? document.getElementById(entry.sectionId) : null;
      const target = findByLabel(entry.label, section ?? document) ?? section;
      if (target) flash(target);
    }, 150);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") return (setOpen(false), input.current?.blur());
    if (!open || !results.length) return;
    if (e.key === "ArrowDown") (e.preventDefault(), setActive((i) => (i + 1) % results.length));
    else if (e.key === "ArrowUp") (e.preventDefault(), setActive((i) => (i - 1 + results.length) % results.length));
    else if (e.key === "Enter") (e.preventDefault(), go(results[active]));
  };

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  useEffect(() => setActive(0), [query]);

  const crumb = (entry: SearchEntry) => `${entry.page}${entry.section ? ` › ${entry.section}` : ""}`;

  return (
    <div ref={root} class="tw-relative tw-px-3 tw-pb-3">
      <div class="tw-relative tw-flex tw-items-center">
        <Icon name="search" size={16} class="tw-absolute tw-left-3 tw-text-fg-subtle tw-pointer-events-none" />
        <input
          ref={input}
          type="text"
          value={query}
          placeholder="Search settings"
          aria-label="Search settings"
          onInput={(e) => (setQuery(e.currentTarget.value), setOpen(true))}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          class="tw-w-full tw-h-9 tw-bg-surface-hover tw-rounded-full tw-pl-9 tw-pr-8 tw-text-sm tw-text-fg placeholder:tw-text-fg-subtle focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-accent"
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => (setQuery(""), input.current?.focus())} class="tw-absolute tw-right-2.5 tw-text-fg-subtle hover:tw-text-fg">
            <Icon name="x" size={14} />
          </button>
        )}
      </div>
      {open && query && (
        <div class="tw-absolute tw-left-3 tw-right-3 tw-top-full tw-mt-1 tw-bg-surface-2 tw-rounded-xl tw-shadow-xl tw-z-50 tw-overflow-hidden tw-py-1">
          {results.length === 0 && <p class="tw-px-3 tw-py-2 tw-text-xs tw-text-fg-subtle">No results for “{query}”</p>}
          {results.map((result, i) => (
            <button
              key={`${result.entry.segment}-${result.entry.section}-${result.entry.label}`}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => go(result)}
              class={`tw-w-full tw-text-left tw-px-3 tw-py-2 tw-transition-colors ${i === active ? "tw-bg-surface-hover" : ""}`}
            >
              <div class="tw-text-sm tw-text-fg tw-leading-snug">
                <Highlighted text={result.entry.label} indices={result.matchedIndices} />
              </div>
              <div class="tw-text-[11px] tw-text-fg-subtle tw-mt-0.5">{crumb(result.entry)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
