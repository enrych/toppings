import type { Config } from "tailwindcss";

/**
 * Tailwind config aligned to the Toppings design-system handoff.
 * All colors map to CSS variables defined in app/globals.css so the
 * single source of truth stays in CSS.
 */
const config = {
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    extend: {
      colors: {
        // Brand tokens — use directly (e.g. bg-cream, text-ink, text-amber).
        cream: "var(--cream)",
        ink: "var(--ink)",
        amber: "var(--amber)",
        flame: "var(--flame)",

        // Semantic surfaces & foregrounds.
        "surface-page": "var(--surface-page)",
        "surface-raised": "var(--surface-raised)",
        "surface-sunken": "var(--surface-sunken)",
        "surface-inverse": "var(--surface-inverse)",

        "fg-1": "var(--fg-1)",
        "fg-2": "var(--fg-2)",
        "fg-3": "var(--fg-3)",
        "fg-4": "var(--fg-4)",
        "fg-on-ink-1": "var(--fg-on-ink-1)",
        "fg-on-ink-2": "var(--fg-on-ink-2)",
        "fg-on-ink-3": "var(--fg-on-ink-3)",

        "border-1": "var(--border-1)",
        "border-2": "var(--border-2)",
        "border-strong": "var(--border-strong)",
        "border-on-ink-1": "var(--border-on-ink-1)",

        // shadcn-style aliases kept for any legacy consumers.
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      maxWidth: {
        page: "1280px",
      },
    },
  },
} satisfies Config;

export default config;
