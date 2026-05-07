import React, {
  ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: ReactNode;
  text: string;
  side?: "top" | "right" | "bottom" | "left";
}

interface Position {
  top: number;
  left: number;
}

/**
 * Hover/focus tooltip rendered in a portal, so it can escape clipping
 * ancestors (`overflow: hidden`, `overflow: auto`, etc.) — important for
 * sidebar items where the nav has overflow-y:auto for scrolling.
 *
 * The wrapper is intentionally not focusable; focus events bubble from
 * focusable children (links, buttons), and the tooltip still shows on
 * keyboard nav. For non-interactive children, wrap them in a focusable
 * element on the caller side.
 */
export default function Tooltip({ children, text, side = "right" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipId = useId();

  useLayoutEffect(() => {
    if (!visible || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const margin = 8;
    let top = 0;
    let left = 0;

    switch (side) {
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + margin;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - margin;
        break;
      case "top":
        top = rect.top - margin;
        left = rect.left + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2;
        break;
    }

    setPosition({ top, left });
  }, [visible, side, text]);

  // Reposition on scroll/resize while visible.
  useEffect(() => {
    if (!visible) return;
    const reposition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const margin = 8;
      let top = 0;
      let left = 0;
      switch (side) {
        case "right":
          top = rect.top + rect.height / 2;
          left = rect.right + margin;
          break;
        case "left":
          top = rect.top + rect.height / 2;
          left = rect.left - margin;
          break;
        case "top":
          top = rect.top - margin;
          left = rect.left + rect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + margin;
          left = rect.left + rect.width / 2;
          break;
      }
      setPosition({ top, left });
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [visible, side]);

  const transformBySide: Record<typeof side, string> = {
    right: "translateY(-50%)",
    left: "translate(-100%, -50%)",
    top: "translate(-50%, -100%)",
    bottom: "translateX(-50%)",
  };

  return (
    <span
      ref={triggerRef}
      className="tw-relative tw-inline-flex tw-items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      aria-describedby={visible ? tooltipId : undefined}
    >
      {children}
      {visible &&
        position &&
        createPortal(
          <span
            id={tooltipId}
            role="tooltip"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              transform: transformBySide[side],
            }}
            className="tw-w-max tw-max-w-[14rem] tw-px-2 tw-py-1.5 tw-text-xs tw-leading-snug tw-text-gray-100 tw-bg-[#1a1a1f] tw-border tw-border-gray-700 tw-rounded tw-shadow-xl tw-z-[10002] tw-pointer-events-none"
          >
            {text}
          </span>,
          document.body,
        )}
    </span>
  );
}
