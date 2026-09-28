import type { ComponentChildren } from "preact";

export interface IconButtonProps {
  "aria-label": string;
  size?: "sm" | "md";
  class?: string;
  title?: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: ComponentChildren;
}

export default function IconButton({ size = "md", class: className = "", children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      class={`tw-inline-flex tw-items-center tw-justify-center tw-rounded-full tw-text-fg-muted tw-transition-colors hover:tw-bg-surface-hover hover:tw-text-fg focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-accent disabled:tw-opacity-40 ${size === "sm" ? "tw-w-8 tw-h-8" : "tw-w-10 tw-h-10"} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
