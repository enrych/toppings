import type { Metadata } from "next";
import Link from "next/link";
import DocsPageHeader from "../components/DocsPageHeader";
import Pager from "../components/Pager";
import { ROUTE, URL } from "@/constants/site";
import { PAGE } from "./data";
import FaqList from "./FaqList";

export const metadata: Metadata = {
  title: "Toppings — FAQ",
  description:
    "Frequently asked questions about Toppings — privacy, install, features, and troubleshooting.",
};

export default function DocsFaqPage() {
  return (
    <main className="docs-main">
      <DocsPageHeader
        {...PAGE}
        LEDE={
          <>
            The short version of what people ask us most. If yours isn&apos;t
            here,{" "}
            <Link href={URL.GITHUB_ISSUES} target="_blank">
              open an issue
            </Link>{" "}
            — we read all of them.
          </>
        }
      />

      <FaqList />

      <Pager currentHref={ROUTE.DOCS_FAQ} />
    </main>
  );
}
