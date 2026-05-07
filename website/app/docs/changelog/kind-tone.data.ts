import type { ReleaseItemKind } from "@/lib/releases.data";

export const DOCS_CHANGELOG_KIND_TONE: Record<
  ReleaseItemKind,
  { label: string; bg: string; fg: string }
> = {
  feat: { label: "New", bg: "rgba(252,169,41,0.12)", fg: "var(--ink)" },
  fix: { label: "Fix", bg: "rgba(10,10,10,0.06)", fg: "var(--fg-2)" },
  polish: { label: "Polish", bg: "rgba(10,10,10,0.06)", fg: "var(--fg-2)" },
  internal: {
    label: "Internal",
    bg: "rgba(10,10,10,0.04)",
    fg: "var(--fg-3)",
  },
};
