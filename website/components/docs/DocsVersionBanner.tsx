import Link from "next/link";
import { EXTENSION_VERSION } from "@toppings/constants";
import { docsVersionTag } from "@toppings/utils";

interface DocsVersionBannerProps {
  /** The version this archived snapshot was cut from (e.g. "3.0.3"). */
  viewing: string;
  /** Where in the latest docs the user should go (mirror of current page). */
  latestHref: string;
}

/**
 * Rendered at the top of every archived doc-snapshot page. Tells the
 * reader they're looking at an older version's docs and offers a one-
 * click jump to the live version of the same page.
 *
 * The snapshot pages live under app/docs/<vMAJOR.MINOR>/ and import this
 * component themselves. The live /docs surface never renders this banner.
 */
export default function DocsVersionBanner({
  viewing,
  latestHref,
}: DocsVersionBannerProps) {
  // If somehow this gets rendered on a snapshot whose version matches
  // the live version (race during release), suppress it.
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
