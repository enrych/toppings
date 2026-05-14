"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS_NAV } from "./nav";

/**
 * Docs left nav. Sticky on desktop, renders inline on mobile. Active state
 * is derived from the current pathname so refreshes preserve the highlight.
 */
export default function DocsNav() {
  const pathname = usePathname();
  return (
    <aside className="docs-nav">
      {DOCS_NAV.map((group) => (
        <div className="docs-nav__group" key={group.title}>
          <div className="docs-nav__title">{group.title}</div>
          <div className="docs-nav__items">
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={"docs-nav__item" + (active ? " active" : "")}
                >
                  {item.label}
                  {item.num && <span className="num">{item.num}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
