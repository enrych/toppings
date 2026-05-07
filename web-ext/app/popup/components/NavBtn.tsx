import React from "react";

export default function NavBtn({
  label,
  active,
  onClick,
  path,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  path: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`tw-relative tw-grid tw-place-items-center tw-py-3.5 tw-cursor-pointer tw-transition-colors tw-duration-150 hover:tw-bg-surface-hover ${
        active ? "tw-text-fg" : "tw-text-fg-muted hover:tw-text-fg"
      }`}
    >
      <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d={path} />
      </svg>
      {active && (
        <span
          aria-hidden
          className="tw-absolute tw-bottom-1.5 tw-left-1/2 -tw-translate-x-1/2 tw-w-4 tw-h-0.5 tw-rounded-full"
          style={{ background: "var(--color-accent)" }}
        />
      )}
    </button>
  );
}
