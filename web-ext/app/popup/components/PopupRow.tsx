import React from "react";

export default function PopupRow({
  title,
  subtitle,
  control,
  onActivate,
  disabled,
}: {
  title: string;
  subtitle: string;
  control: React.ReactNode;
  onActivate?: () => void;
  disabled?: boolean;
}) {
  const clickable = !!onActivate && !disabled;
  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : -1}
      onClick={clickable ? onActivate : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onActivate?.();
              }
            }
          : undefined
      }
      className={`tw-grid tw-grid-cols-[1fr_auto] tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-border-b tw-border-border-default tw-transition-colors tw-duration-150 ${
        clickable ? "tw-cursor-pointer hover:tw-bg-surface-hover" : ""
      } ${disabled ? "tw-opacity-50 tw-pointer-events-none" : ""}`}
    >
      <div className="tw-min-w-0">
        <div className="tw-text-[13.5px] tw-font-medium tw-text-fg tw-truncate">
          {title}
        </div>
        <div className="tw-font-mono tw-text-[11px] tw-text-fg-subtle tw-truncate tw-mt-0.5">
          {subtitle}
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>{control}</div>
    </div>
  );
}
