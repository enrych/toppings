import React from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "tw-bg-gray-700/40 tw-text-gray-300 tw-border-gray-600/40",
  success: "tw-bg-green-500/10 tw-text-green-300 tw-border-green-500/30",
  warning: "tw-bg-yellow-500/10 tw-text-yellow-300 tw-border-yellow-500/30",
  danger: "tw-bg-red-500/10 tw-text-red-300 tw-border-red-500/30",
  info: "tw-bg-blue-500/10 tw-text-blue-300 tw-border-blue-500/30",
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
      className={[
        "tw-inline-flex tw-items-center tw-px-2 tw-py-0.5 tw-text-xs tw-font-medium tw-rounded-full tw-border",
        TONE_CLASSES[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
}
