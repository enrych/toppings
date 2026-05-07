import React, { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "tw-bg-blue-500 tw-text-white tw-border tw-border-blue-500 hover:tw-bg-blue-600 hover:tw-border-blue-600 active:tw-bg-blue-700 disabled:tw-bg-blue-500/40 disabled:tw-border-blue-500/40 disabled:tw-cursor-not-allowed",
  secondary:
    "tw-bg-transparent tw-text-gray-100 tw-border tw-border-gray-600/60 hover:tw-bg-white/5 hover:tw-border-gray-500 active:tw-bg-white/10 disabled:tw-opacity-40 disabled:tw-cursor-not-allowed",
  ghost:
    "tw-bg-transparent tw-text-gray-300 tw-border tw-border-transparent hover:tw-bg-white/5 hover:tw-text-white active:tw-bg-white/10 disabled:tw-opacity-40 disabled:tw-cursor-not-allowed",
  danger:
    "tw-bg-red-600 tw-text-white tw-border tw-border-red-600 hover:tw-bg-red-700 hover:tw-border-red-700 active:tw-bg-red-800 disabled:tw-opacity-40 disabled:tw-cursor-not-allowed",
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
        "tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-font-medium tw-transition-colors tw-duration-150 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-blue-500/60 focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-[#0f0f10]",
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
