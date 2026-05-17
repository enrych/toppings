import { cn } from "@toppings/utils";
import React from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral:
    "tw-bg-surface-hover tw-text-fg-muted tw-border tw-border-border-default",
  success:
    "tw-bg-success-bg tw-text-success-fg tw-border tw-border-success-fg/30",
  warning:
    "tw-bg-warning-bg tw-text-warning-fg tw-border tw-border-warning-fg/30",
  danger:
    "tw-bg-danger-bg tw-text-danger-fg tw-border tw-border-danger-fg/30",
  info: "tw-bg-info-bg tw-text-info-fg tw-border tw-border-info-fg/30",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export default function Badge({
  tone = "neutral",
  className = "",
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "tw-inline-flex tw-items-center tw-px-2 tw-py-0.5 tw-text-xs tw-font-medium tw-rounded-full",
        TONE_CLASSES[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
