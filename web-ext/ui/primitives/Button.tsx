import type { ComponentChildren } from "preact";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

// Pill buttons, filled or tonal, as YouTube draws its own.
const VARIANT: Record<ButtonVariant, string> = {
  primary: "tw-bg-fg tw-text-bg hover:tw-opacity-90",
  secondary: "tw-bg-surface-hover tw-text-fg hover:tw-bg-border-default",
  ghost: "tw-text-fg-muted hover:tw-bg-surface-hover hover:tw-text-fg",
  danger: "tw-bg-danger-bg tw-text-danger-fg hover:tw-opacity-90",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "tw-h-8 tw-px-3 tw-text-[13px]",
  md: "tw-h-9 tw-px-4 tw-text-sm",
};

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ComponentChildren;
  class?: string;
  title?: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: ComponentChildren;
}

export default function Button({ variant = "secondary", size = "md", icon, class: className = "", children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      class={`tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-full tw-font-medium tw-whitespace-nowrap tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-accent disabled:tw-opacity-40 disabled:tw-cursor-not-allowed ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
