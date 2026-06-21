import Link from "next/link";
import { URLS } from "@/lib/urls";
import { ROUTE } from "@/lib/site.data";
import type { DocsPart } from "@/lib/docs-part";

export function DocsInlineParts({ parts }: { parts: readonly DocsPart[] }) {
  return <>{parts.map((part, i) => renderDocsPart(part, i))}</>;
}

export function DocsRichText({
  paragraphs,
}: {
  paragraphs: readonly (readonly DocsPart[])[];
}) {
  return paragraphs.map((parts, i) => (
    <p key={i}>
      <DocsInlineParts parts={parts} />
    </p>
  ));
}

function renderDocsPart(part: DocsPart, key: number) {
  switch (part.kind) {
    case "text":
      return <span key={key}>{part.value}</span>;
    case "code":
      return <code key={key}>{part.value}</code>;
    case "strong":
      return <strong key={key}>{part.value}</strong>;
    case "em":
      return <em key={key}>{part.value}</em>;
    case "link":
      return (
        <Link key={key} href={URLS[part.target]} target="_blank">
          {part.label}
        </Link>
      );
    case "route":
      return (
        <Link key={key} href={ROUTE[part.target]}>
          {part.label}
        </Link>
      );
    case "anchor":
      return (
        <a key={key} href={`#${part.id}`}>
          {part.label}
        </a>
      );
  }
}
