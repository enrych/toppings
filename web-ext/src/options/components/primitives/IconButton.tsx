import React, { forwardRef } from "react";

type IconButtonVariant = "default" | "ghost" | "danger";
type IconButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  default:
    "tw-bg-transparent tw-text-gray-300 tw-border tw-border-gray-600/40 hover:tw-bg-white/5 hover:tw-text-white",
  ghost:
    "tw-bg-transparent tw-text-gray-400 tw-border tw-border-transparent hover:tw-bg-white/5 hover:tw-text-white",
  danger:
    "tw-bg-transparent tw-text-red-400 tw-border tw-border-red-600/30 hover:tw-bg-red-500/10 hover:tw-text-red-300",
};

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: "tw-w-7 tw-h-7",
  md: "tw-w-9 tw-h-9",
  lg: "tw-w-11 tw-h-11",
};

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  "aria-label": string; // required for accessibility
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      variant = "ghost",
      size = "md",
      className = "",
      children,
      type = "button",
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={[
          "tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-transition-colors tw-duration-150 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-blue-500/60 focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-[#0f0f10] disabled:tw-opacity-40 disabled:tw-cursor-not-allowed",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

export default IconButton;
