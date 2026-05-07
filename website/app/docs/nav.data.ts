import { LABEL, ROUTE } from "@/lib/site.data";

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
