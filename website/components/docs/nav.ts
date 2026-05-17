/**
 * Single source of truth for the docs left-nav structure. The docs/layout.tsx
 * uses this list to render the sidebar and to compute prev/next pagers. Each
 * entry's `href` is the basePath-aware route under the /docs subtree.
 */
export interface DocsNavItem {
  id: string;
  label: string;
  href: string;
  /** "01" / "02" style numbering shown right-aligned in the nav. */
  num?: string;
}

export interface DocsNavGroup {
  title: string;
  items: DocsNavItem[];
}

export const DOCS_NAV: DocsNavGroup[] = [
  {
    title: "Getting started",
    items: [
      { id: "install", label: "Install Toppings", href: "/docs", num: "01" },
    ],
  },
  {
    title: "Reference",
    items: [
      { id: "keybindings", label: "Keybindings", href: "/docs/keybindings" },
      { id: "faq", label: "FAQ", href: "/docs/faq" },
      { id: "changelog", label: "Changelog", href: "/docs/changelog" },
    ],
  },
];

/** Flat list of nav items in display order — used by the prev/next pager. */
export const DOCS_NAV_FLAT: DocsNavItem[] = DOCS_NAV.flatMap((g) => g.items);

export function getPagerSiblings(currentHref: string) {
  const idx = DOCS_NAV_FLAT.findIndex((i) => i.href === currentHref);
  return {
    prev: idx > 0 ? DOCS_NAV_FLAT[idx - 1] : undefined,
    next: idx >= 0 && idx < DOCS_NAV_FLAT.length - 1 ? DOCS_NAV_FLAT[idx + 1] : undefined,
  };
}
