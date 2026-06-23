import { BRAND_METADATA, LABEL, ROUTE, URL } from "@/constants/site";

export default function Nav() {
  return (
    <nav className="r-nav">
      <span className="r-wordmark">{BRAND_METADATA.NAME}</span>
      <div className="r-nav-right">
        <a href={ROUTE.DOCS}>{LABEL.DOCS}</a>
        <a
          href={URL.GITHUB_REPO}
          target={"_blank"}
          rel="noopener noreferrer"
        >
          {LABEL.SOURCE_CODE}
        </a>
      </div>
    </nav>
  );
}
