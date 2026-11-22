import type { ComponentChildren } from "preact";
import { createPortal } from "preact/compat";
import { useLayoutEffect, useRef, useState } from "preact/hooks";

interface TooltipProps {
  children: ComponentChildren;
  text: string;
  side?: "top" | "right" | "bottom" | "left";
}

const TRANSFORM = {
  right: "translateY(-50%)",
  left: "translate(-100%, -50%)",
  top: "translate(-50%, -100%)",
  bottom: "translateX(-50%)",
};

export default function Tooltip({ children, text, side = "right" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [at, setAt] = useState<{ top: number; left: number } | null>(null);
  const trigger = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!visible || !trigger.current) return;
    const place = () => {
      const r = trigger.current!.getBoundingClientRect();
      const gap = 8;
      setAt(
        side === "right" ? { top: r.top + r.height / 2, left: r.right + gap }
        : side === "left" ? { top: r.top + r.height / 2, left: r.left - gap }
        : side === "top" ? { top: r.top - gap, left: r.left + r.width / 2 }
        : { top: r.bottom + gap, left: r.left + r.width / 2 },
      );
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [visible, side, text]);

  return (
    <span
      ref={trigger}
      class="tw-relative tw-inline-flex tw-items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      // focus and blur do not bubble, so a focusable child would never open it.
      onFocusIn={() => setVisible(true)}
      onFocusOut={() => setVisible(false)}
      // A click that changes the DOM under the cursor never fires mouseleave.
      onClick={() => setVisible(false)}
    >
      {children}
      {visible && at && createPortal(
        <span
          role="tooltip"
          style={{ position: "fixed", top: at.top, left: at.left, transform: TRANSFORM[side] }}
          class="tw-w-max tw-max-w-[14rem] tw-px-2 tw-py-1.5 tw-text-xs tw-leading-snug tw-text-bg tw-bg-fg tw-rounded tw-shadow-xl tw-z-[10002] tw-pointer-events-none"
        >
          {text}
        </span>,
        document.body,
      )}
    </span>
  );
}
