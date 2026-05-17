import { BRAND, EXTERNAL_URL, ROUTE } from "@toppings/constants";

/**
 * Minimal fixed nav. `mix-blend-mode: difference` keeps the wordmark
 * legible over both the noisy hero and the bone Break panel without
 * any scroll-state JS — it just inverts against whatever is behind it.
 */
export default function Nav() {
  return (
    <nav className="r-nav">
      <span className="r-wordmark">{BRAND.NAME}</span>
      <div className="r-nav-right">
        <a href={ROUTE.DOCS}>Docs</a>
        <a
          href={EXTERNAL_URL.GITHUB_REPO}
          target={"_blank"}
          rel="noopener noreferrer"
        >
          Source
        </a>
      </div>
    </nav>
  );
}
