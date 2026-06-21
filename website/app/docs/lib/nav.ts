import { LABEL, ROUTE } from "@/constants/site";

export interface DocsNavItem {
  id: string;
  label: string;
  href: string;
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
      { id: "install", label: "Install Toppings", href: ROUTE.DOCS, num: "01" },
    ],
  },
  {
    title: "Reference",
    items: [
      {
        id: "keybindings",
        label: LABEL.KEYBINDINGS,
        href: ROUTE.DOCS_KEYBINDINGS,
      },
      { id: "faq", label: LABEL.FAQ, href: ROUTE.DOCS_FAQ },
      {
        id: "changelog",
        label: LABEL.CHANGELOG,
        href: ROUTE.DOCS_CHANGELOG,
      },
    ],
  },
];

const docsNavFlat: DocsNavItem[] = DOCS_NAV.flatMap((g) => g.items);

export function getPagerSiblings(currentHref: string) {
  const idx = docsNavFlat.findIndex((i) => i.href === currentHref);
  return {
    prev: idx > 0 ? docsNavFlat[idx - 1] : undefined,
    next:
      idx >= 0 && idx < docsNavFlat.length - 1
        ? docsNavFlat[idx + 1]
        : undefined,
  };
}
