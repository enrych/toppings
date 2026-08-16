import React from "react";

export default function TinySwitch({
  on,
  onClick,
}: {
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className="tw-relative tw-inline-flex tw-h-5 tw-w-[34px] tw-flex-shrink-0 tw-cursor-pointer tw-rounded-full tw-transition-colors tw-duration-[240ms] tw-ease-out focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-accent/50 focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-bg"
      style={{
        background: on
          ? "var(--color-accent)"
          : "var(--color-surface-hover)",
        border: on ? "none" : "1px solid var(--color-border-default)",
      }}
    >
      <span
        aria-hidden
        className="tw-pointer-events-none tw-absolute tw-top-[2px] tw-left-[2px] tw-inline-block tw-h-4 tw-w-4 tw-rounded-full tw-transition-transform tw-duration-[240ms] tw-ease-out"
        style={{
          transform: on ? "translateX(14px)" : "translateX(0)",
          background: on ? "var(--color-accent-fg)" : "var(--color-fg)",
        }}
      />
    </button>
  );
}
