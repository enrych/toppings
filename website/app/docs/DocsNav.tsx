"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pages = [
  { href: "/docs", label: "Install" },
  { href: "/docs/keybindings", label: "Keybindings" },
  { href: "/docs/faq", label: "FAQ" },
  { href: "/docs/changelog", label: "Changelog" },
];

export default function DocsNav() {
  const pathname = usePathname();
  return (
    <nav className="docs-nav" aria-label="Docs">
      {pages.map((page) => (
        <Link
          key={page.href}
          href={page.href}
          aria-current={pathname === page.href ? "page" : undefined}
        >
          {page.label}
        </Link>
      ))}
    </nav>
  );
}
