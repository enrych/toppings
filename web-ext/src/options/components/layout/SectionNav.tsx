import React, { useEffect, useState } from "react";

interface SectionNavItem {
  id: string;
  label: string;
}

interface SectionNavProps {
  items: SectionNavItem[];
}

/**
 * Right-rail in-page anchor nav. Highlights the section currently in view
 * using IntersectionObserver. Click an item to smooth-scroll to that
 * section.
 *
 * Use this when a single page has multiple Section blocks worth jumping
 * between (e.g. the Audio Mode page).
 */
export default function SectionNav({ items }: SectionNavProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top),
          );
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const onClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveId(id);
  };

  return (
    <nav
      aria-label="On this page"
      className="tw-sticky tw-top-6 tw-flex tw-flex-col tw-gap-1"
    >
      <div className="tw-text-[11px] tw-uppercase tw-tracking-wider tw-text-gray-500 tw-font-semibold tw-px-3 tw-mb-1">
        On this page
      </div>
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => onClick(e, item.id)}
            className={`tw-px-3 tw-py-1.5 tw-text-sm tw-rounded-md tw-transition-colors tw-border-l-2 ${
              active
                ? "tw-text-white tw-border-blue-500 tw-bg-white/5"
                : "tw-text-gray-400 tw-border-transparent hover:tw-text-gray-200 hover:tw-bg-white/[0.03]"
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

export type { SectionNavItem };
