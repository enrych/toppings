import React, {
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

interface TooltipProps {
  children: ReactNode;
  text: string;
  side?: "top" | "right" | "bottom" | "left";
}

/**
 * Lightweight hover/focus tooltip. Positions itself adaptively so it doesn't
 * fall off the viewport on the right side (where most setting rows live).
 */
export default function Tooltip({ children, text, side = "right" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [actualSide, setActualSide] = useState(side);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!visible || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const wouldOverflowRight = rect.right + 220 > window.innerWidth;
    if (side === "right" && wouldOverflowRight) {
      setActualSide("left");
    } else {
      setActualSide(side);
    }
  }, [visible, side]);

  const positionClasses = {
    right: "tw-left-full tw-ml-2 tw-top-1/2 -tw-translate-y-1/2",
    left: "tw-right-full tw-mr-2 tw-top-1/2 -tw-translate-y-1/2",
    top: "tw-bottom-full tw-mb-2 tw-left-1/2 -tw-translate-x-1/2",
    bottom: "tw-top-full tw-mt-2 tw-left-1/2 -tw-translate-x-1/2",
  }[actualSide];

  return (
    <div
      ref={triggerRef}
      className="tw-relative tw-inline-flex tw-items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <div aria-describedby={tooltipId} tabIndex={0} className="tw-cursor-help tw-inline-flex">
        {children}
      </div>
      {visible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`tw-absolute ${positionClasses} tw-w-52 tw-p-2 tw-text-xs tw-text-gray-100 tw-bg-[#1a1a1f] tw-border tw-border-gray-700 tw-rounded tw-shadow-xl tw-z-50 tw-pointer-events-none`}
        >
          {text}
        </div>
      )}
    </div>
  );
}
