import Link from "next/link";
import { getPagerSiblings } from "@/lib/docs-nav";

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
