import React, { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "tw-bg-accent tw-text-accent-fg tw-border tw-border-accent hover:tw-bg-accent-hover hover:tw-border-accent-hover disabled:tw-opacity-50 disabled:tw-cursor-not-allowed",
  secondary:
    "tw-bg-transparent tw-text-fg tw-border tw-border-border-strong hover:tw-bg-surface-hover disabled:tw-opacity-40 disabled:tw-cursor-not-allowed",
  ghost:
    "tw-bg-transparent tw-text-fg-muted tw-border tw-border-transparent hover:tw-bg-surface-hover hover:tw-text-fg disabled:tw-opacity-40 disabled:tw-cursor-not-allowed",
  danger:
    "tw-bg-danger-bg tw-text-danger-fg tw-border tw-border-danger-fg/30 hover:tw-bg-danger-bg hover:tw-border-danger-fg/60 disabled:tw-opacity-40 disabled:tw-cursor-not-allowed",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "tw-px-2.5 tw-py-1 tw-text-xs",
  md: "tw-px-3.5 tw-py-2 tw-text-sm",
  lg: "tw-px-5 tw-py-2.5 tw-text-base",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "secondary",
    size = "md",
    fullWidth = false,
    leadingIcon,
    trailingIcon,
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
        "tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-font-medium tw-transition-colors tw-duration-150 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-accent/50 focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-bg",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? "tw-w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {leadingIcon && <span className="tw-flex">{leadingIcon}</span>}
      {children}
      {trailingIcon && <span className="tw-flex">{trailingIcon}</span>}
    </button>
  );
});

export default Button;
export type { ButtonVariant, ButtonSize };
