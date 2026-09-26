import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import DocsNav from "./DocsNav";
import "./docs.css";

export const metadata: Metadata = {
  title: { default: "Docs", template: `%s — ${site.name} docs` },
  description: `Install guide, default shortcuts, FAQ and changelog for ${site.name}.`,
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs">
      <header className="docs-top">
        <Link href="/" className="wordmark">
          {site.name}
        </Link>
        <span className="label">Docs</span>
        <a href={site.github} target="_blank" rel="noopener noreferrer" className="btn btn--quiet">
          GitHub <span aria-hidden>↗</span>
        </a>
      </header>
      <div className="docs-shell">
        <DocsNav />
        <main className="docs-main">{children}</main>
      </div>
    </div>
  );
}
