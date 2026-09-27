import type { Config } from "tailwindcss";

// Prefixed and without preflight: the pages carry their own small reset and
// the class names must never collide with YouTube's.
export default {
  content: ["./app/**/*.{ts,tsx}", "./ui/**/*.{ts,tsx}"],
  prefix: "tw-",
  corePlugins: { preflight: false },
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-2": "var(--color-surface-2)",
        "surface-hover": "var(--color-surface-hover)",
        fg: "var(--color-fg)",
        "fg-muted": "var(--color-fg-muted)",
        "fg-subtle": "var(--color-fg-subtle)",
        "border-subtle": "var(--color-border-subtle)",
        "border-default": "var(--color-border-default)",
        "border-strong": "var(--color-border-strong)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        "accent-fg": "var(--color-accent-fg)",
        "danger-bg": "var(--color-danger-bg)",
        "danger-fg": "var(--color-danger-fg)",
        "success-bg": "var(--color-success-bg)",
        "success-fg": "var(--color-success-fg)",
        "info-bg": "var(--color-info-bg)",
        "info-fg": "var(--color-info-fg)",
        "warning-bg": "var(--color-warning-bg)",
        "warning-fg": "var(--color-warning-fg)",
      },
      fontFamily: { sans: ["Instrument Sans", "system-ui", "sans-serif"], display: ["Gloock", "Georgia", "serif"] },
    },
  },
} satisfies Config;
