import Link from "next/link";
import Backdrop from "@/components/Backdrop";
import InstallLink from "@/components/InstallLink";
import KeyDock from "@/components/KeyDock";
import { site } from "@/lib/site";
import "./home.css";

const rail = [
  { label: "Runs on", value: "Chrome, Firefox, Edge, Brave, Arc" },
  { label: "Price", value: "Free, forever" },
  { label: "Source", value: `${site.license} on GitHub`, href: site.github },
  { label: "Trackers", value: "None. No accounts either" },
];

function delay(seconds: number) {
  return { "--d": `${seconds}s` } as React.CSSProperties;
}

export default function Home() {
  return (
    <main className="hero">
      <Backdrop />
      <div className="grain" aria-hidden />
      <div className="scrim" aria-hidden />

      <header className="top rise" style={delay(0.1)}>
        <span className="wordmark">{site.name}</span>
        <nav className="top-nav">
          <Link href="/docs" className="btn btn--quiet">
            Docs
          </Link>
          <a href={site.github} target="_blank" rel="noopener noreferrer" className="btn btn--quiet">
            GitHub <span aria-hidden>↗</span>
          </a>
        </nav>
      </header>

      <aside className="rail rise" style={delay(0.6)}>
        <span className="label rail-title">
          {site.name} / open source
        </span>
        {rail.map((row) => (
          <div key={row.label}>
            <span className="label">{row.label}</span>
            {row.href ? (
              <a href={row.href} target="_blank" rel="noopener noreferrer" className="rail-value">
                {row.value} <span aria-hidden>↗</span>
              </a>
            ) : (
              <span className="rail-value">{row.value}</span>
            )}
          </div>
        ))}
      </aside>

      <section className="copy">
        <p className="eyebrow rise" style={delay(0.2)}>
          <span className="eyebrow-rule" aria-hidden />
          an extension for youtube · v{site.version}
        </p>
        <h1 className="rise" style={delay(0.3)}>
          your youtube,
          <br />
          your way.
        </h1>
        <div className="deck-row rise" style={delay(0.5)}>
          <p className="deck">
            Audio mode, loop segments, custom speeds, one-key seeking. The controls YouTube never
            shipped, and nothing else.
          </p>
          <div className="actions">
            <InstallLink />
            <a href={site.github} target="_blank" rel="noopener noreferrer" className="btn">
              Source <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </section>

      <KeyDock />

      <footer className="foot rise" style={delay(0.9)}>
        <span>
          © {new Date().getFullYear()} {site.name} · {site.license}
        </span>
        <span className="foot-links">
          <Link href="/docs">Docs</Link>
          <a href={site.issues} target="_blank" rel="noopener noreferrer">
            Issues ↗
          </a>
          <a href={site.sponsor} target="_blank" rel="noopener noreferrer">
            Sponsor ↗
          </a>
        </span>
      </footer>
    </main>
  );
}
