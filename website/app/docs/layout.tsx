import type { Metadata } from "next";
import DocsTop from "@/components/docs/DocsTop";
import DocsNav from "@/components/docs/DocsNav";
import "./docs.css";

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
