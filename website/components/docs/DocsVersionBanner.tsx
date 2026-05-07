import Link from "next/link";
import { EXTENSION_VERSION } from "@toppings/constants";
import { docsVersionTag } from "@toppings/utils";

interface DocsVersionBannerProps {
  viewing: string;
  latestHref: string;
}

export default function DocsVersionBanner({
  viewing,
  latestHref,
}: DocsVersionBannerProps) {
  if (docsVersionTag(viewing) === docsVersionTag(EXTENSION_VERSION)) {
    return null;
  }
  return (
    <div className="docs-version-banner" role="status">
      <span className="ico">
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M12 8v4M12 16h.01" />
          <circle cx={12} cy={12} r={10} />
        </svg>
      </span>
      <div className="docs-version-banner__body">
        <div className="docs-version-banner__head">
          You&rsquo;re reading docs for{" "}
          <strong>v{viewing}</strong>
        </div>
        <div style={{ color: "var(--fg-2)", fontSize: 12.5 }}>
          The latest release is v{EXTENSION_VERSION}. Behavior described
          below may differ from current builds.
        </div>
      </div>
      <Link className="docs-version-banner__cta" href={latestHref}>
        Switch to latest →
      </Link>
    </div>
  );
}
