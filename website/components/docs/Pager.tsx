import Link from "next/link";
import { getPagerSiblings } from "./nav";

/**
 * Prev/Next pager. Auto-computes siblings from the canonical DOCS_NAV list.
 * Renders empty placeholder cells so the grid stays balanced when one side
 * is missing.
 */
export default function Pager({ currentHref }: { currentHref: string }) {
  const { prev, next } = getPagerSiblings(currentHref);

  return (
    <div className="docs-pager">
      {prev ? (
        <Link href={prev.href}>
          <span className="dir">← Previous</span>
          <span className="ttl">{prev.label}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className="nxt">
          <span className="dir">Next →</span>
          <span className="ttl">{next.label}</span>
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
