import type { Metadata } from "next";
import { site } from "@/lib/site";
import { faq } from "./faq";

export const metadata: Metadata = { title: "FAQ" };

export default function Faq() {
  return (
    <article className="prose">
      <p className="label">Reference</p>
      <h1>questions, answered.</h1>
      <p className="lede">
        If yours isn&apos;t here,{" "}
        <a href={site.issues} target="_blank" rel="noopener noreferrer">
          open an issue
        </a>
        .
      </p>

      <div className="faq">
        {faq.map((entry, i) => (
          <details key={entry.q} open={i === 0}>
            <summary>{entry.q}</summary>
            {entry.a.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </details>
        ))}
      </div>
    </article>
  );
}
