import type { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

export interface MenuProps {
  trigger: ComponentChildren;
  triggerClass?: string;
  title?: string;
  align?: "left" | "right";
  children: ComponentChildren | ((close: () => void) => ComponentChildren);
}

// A dropdown that closes on any click outside it, including clicks on the page
// beyond the shadow root, which composedPath still reports.
export function Menu({ trigger, triggerClass = "btn", title, align = "left", children }: MenuProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: Event) => {
      if (!e.composedPath().includes(root.current!)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  const close = () => setOpen(false);
  return (
    <div class="dropdown" ref={root}>
      <button class={triggerClass} title={title} onClick={() => setOpen((o) => !o)}>
        {trigger}
      </button>
      {open && <div class={`menu ${align}`}>{typeof children === "function" ? children(close) : children}</div>}
    </div>
  );
}
