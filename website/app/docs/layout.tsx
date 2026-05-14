import type { Metadata } from "next";
import DocsTop from "@/components/docs/DocsTop";
import DocsNav from "@/components/docs/DocsNav";
import "./docs.css";

/**
 * Docs section layout — its own top bar (DocsTop) and left nav (DocsNav).
 * Lives outside the (marketing) route group, so the marketing Navbar +
 * Footer don't render on /docs/* routes. The shared globals (fonts,
 * tokens) come from the root layout.
 */
export const metadata: Metadata = {
  title: "Toppings — Docs",
  description:
    "Documentation, keybindings, and frequently asked questions for Toppings — a free, open-source YouTube extension.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DocsTop />
      <div className="docs-shell">
        <DocsNav />
        {children}
      </div>
    </>
  );
}
