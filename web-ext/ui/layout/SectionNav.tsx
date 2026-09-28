import { useEffect, useState } from "preact/hooks";

export interface SectionNavItem {
  id: string;
  label: string;
}

// "On this page" links that follow the section nearest the top as you scroll.
export default function SectionNav({ items }: { items: readonly SectionNavItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" class="tw-flex tw-flex-col tw-gap-0.5">
      <div class="tw-text-[11px] tw-uppercase tw-tracking-wider tw-text-fg-subtle tw-font-medium tw-px-3 tw-mb-1">On this page</div>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
            setActiveId(item.id);
          }}
          class={`tw-px-3 tw-py-1.5 tw-text-sm tw-rounded-lg tw-transition-colors ${activeId === item.id ? "tw-text-fg tw-bg-surface-hover" : "tw-text-fg-muted hover:tw-text-fg hover:tw-bg-surface-hover"}`}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
