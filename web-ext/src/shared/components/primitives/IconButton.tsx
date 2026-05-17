import { cn } from "@toppings/utils";
import React, { forwardRef } from "react";

type IconButtonVariant = "default" | "ghost" | "danger";
type IconButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  default:
    "tw-bg-transparent tw-text-fg-muted tw-border tw-border-border-default hover:tw-bg-surface-hover hover:tw-text-fg",
  ghost:
    "tw-bg-transparent tw-text-fg-muted tw-border tw-border-transparent hover:tw-bg-surface-hover hover:tw-text-fg",
  danger:
    "tw-bg-transparent tw-text-danger-fg tw-border tw-border-danger-fg/30 hover:tw-bg-danger-bg hover:tw-border-danger-fg/60",
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
  "aria-label": string;
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
        className={cn(
          "tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-transition-colors tw-duration-150 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-accent/50 focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-bg disabled:tw-opacity-40 disabled:tw-cursor-not-allowed",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

export default IconButton;
