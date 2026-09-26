import type { Metadata } from "next";
import { site } from "@/lib/site";
import { releases } from "./releases";

export const metadata: Metadata = { title: "Changelog" };

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

export default function Changelog() {
  return (
    <article className="prose">
      <p className="label">Reference</p>
      <h1>the changelog.</h1>
      <p className="lede">
        The published version is <code>v{site.version}</code>. Commits are{" "}
        <a href={site.commits} target="_blank" rel="noopener noreferrer">
          on GitHub
        </a>
        .
      </p>

      {releases.map((release) => (
        <section key={release.version} id={`v${release.version}`} className="release">
          <h2>
            v{release.version} <span className="release-title">{release.title}</span>
          </h2>
          <p className="label">
            {dateFormat.format(new Date(release.date))}
            {release.version === site.version && " · current"}
          </p>
          <ul>
            {release.changes.map((change) => (
              <li key={change.text}>
                <span className={`kind kind--${change.kind}`}>{change.kind}</span>
                {change.text}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
