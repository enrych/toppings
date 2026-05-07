import { DOCS_NAV, type DocsNavItem } from "@/app/docs/nav.data";

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
