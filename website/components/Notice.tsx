import Link from "next/link";
import Backdrop from "./Backdrop";
import { site } from "@/lib/site";
import "./notice.css";

// Pages the extension opens on install and uninstall.
export default function Notice({
  kicker,
  title,
  body,
  cta,
}: {
  kicker: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
}) {
  const external = cta.href.startsWith("http") || cta.href.startsWith("mailto:");
  return (
    <main className="notice">
      <Backdrop />
      <div className="scrim" aria-hidden />
      <header className="top">
        <Link href="/" className="wordmark">
          {site.name}
        </Link>
      </header>
      <section className="notice-body">
        <p className="eyebrow">
          <span className="eyebrow-rule" aria-hidden />
          {kicker}
        </p>
        <h1>{title}</h1>
        <p className="deck">{body}</p>
        {external ? (
          <a href={cta.href} className="btn btn--solid">
            {cta.label} <span aria-hidden>→</span>
          </a>
        ) : (
          <Link href={cta.href} className="btn btn--solid">
            {cta.label} <span aria-hidden>→</span>
          </Link>
        )}
      </section>
      <footer className="foot">
        <span>
          {site.name} · v{site.version} · {site.license}
        </span>
        <span className="foot-links">
          <Link href="/docs">Docs</Link>
          <a href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
        </span>
      </footer>
    </main>
  );
}
