import Link from "next/link";
import Backdrop from "@/components/Backdrop";
import Cursor from "@/components/Cursor";
import InstallLink from "@/components/InstallLink";
import { site } from "@/lib/site";
import "./home.css";

function delay(seconds: number) {
  return { "--d": `${seconds}s` } as React.CSSProperties;
}

export default function Home() {
  return (
    <main className="hero">
      <Cursor />
      <Backdrop />
      <div className="scrim" aria-hidden />
      <div className="grain" aria-hidden />

      <header className="top rise" style={delay(0.3)}>
        <span className="wordmark">{site.name}</span>
        <nav className="top-nav">
          <Link href="/docs" className="btn btn--quiet">
            Docs
          </Link>
          <a href={site.github} target="_blank" rel="noopener noreferrer" className="btn btn--quiet">
            Source
          </a>
        </nav>
      </header>

      <section className="stack">
        <span className="eyebrow rise" style={delay(0.5)}>
          Free · Open source
        </span>

        <h1 className="display">
          <span className="mask">
            <span className="line" style={delay(0.7)}>
              Your YouTube,
            </span>
          </span>
          <span className="mask">
            <span className="line" style={delay(0.82)}>
              your <em>way</em>.
            </span>
          </span>
        </h1>

        <p className="deck rise" style={delay(1.2)}>
          The controls YouTube never gave you — done right.
        </p>

        <div className="actions rise" style={delay(1.35)}>
          <InstallLink />
          <a href={site.github} target="_blank" rel="noopener noreferrer" className="btn">
            Source
          </a>
        </div>

        <div className="trust rise" style={delay(1.5)}>
          <span>
            <b>0 trackers.</b> No analytics, no accounts.
          </span>
          <span>
            <b>{site.license}.</b> Fork it, modify it, ship it.
          </span>
        </div>
      </section>

      <footer className="foot rise" style={delay(1.7)}>
        <span>
          {site.name} · {site.license}
        </span>
        <span className="foot-links">
          <Link href="/docs">Docs</Link>
          <a href={site.issues} target="_blank" rel="noopener noreferrer">
            Issues
          </a>
          <a href={site.sponsor} target="_blank" rel="noopener noreferrer">
            Sponsor
          </a>
        </span>
      </footer>
    </main>
  );
}
