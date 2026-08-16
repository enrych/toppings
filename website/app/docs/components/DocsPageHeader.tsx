import Link from "next/link";
import type { ReactNode } from "react";
import { ROUTE } from "@/constants/site";

export type DocsPageData = {
  EYEBROW: string;
  TITLE_BEFORE: string;
  TITLE_HIGHLIGHT: string;
  TITLE_AFTER: string;
  CRUMB_GROUP: string;
  CRUMB_CURRENT: string;
  CRUMB_LINK_GROUP?: true;
  LEDE?: ReactNode;
};

export default function DocsPageHeader(page: DocsPageData) {
  return (
    <>
      <div className="docs-crumbs">
        <Link href={ROUTE.DOCS}>Docs</Link>
        <span className="sep">/</span>
        {page.CRUMB_LINK_GROUP ? (
          <Link href={ROUTE.DOCS}>{page.CRUMB_GROUP}</Link>
        ) : (
          <span>{page.CRUMB_GROUP}</span>
        )}
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

      {page.LEDE != null && <div className="docs-lede">{page.LEDE}</div>}
    </>
  );
}
