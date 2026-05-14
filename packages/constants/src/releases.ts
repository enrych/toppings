import { EXTENSION_VERSION } from "./version";

/**
 * Single source of truth for release notes. Consumed by:
 *   - web-ext popup "What's new" section
 *   - website /docs/changelog page
 *   - (Future) automated GitHub Releases body
 *
 * ────────────────────────────────────────────────────────────────────────
 * Maintainer rules
 *
 * When you ship a release:
 *   1. Add a new entry at the TOP of RELEASES (most recent first).
 *   2. Set `version` to the SemVer you're publishing. It must match
 *      `EXTENSION_VERSION` in version.ts — the CI consistency check
 *      enforces this.
 *   3. Pick a `date` (ISO yyyy-mm-dd, the day the release tag is cut).
 *   4. Write 3-6 user-facing items. Past tense, short, no marketing
 *      slop. Examples:
 *        - "Added Audio Mode for the watch page"
 *        - "Visualizer sensitivity is now configurable"
 *        - "Fixed: pinned audio mode dropped on SPA navigation"
 *   5. Mark `kind` per item:
 *      - "feat"    new feature
 *      - "fix"     bug fix
 *      - "polish"  UX/UI refinement
 *      - "internal" non-user-visible (build, refactor)
 *      Internal items are filtered out of popup/docs renders by default.
 *
 * If you're not publishing today but want to track work-in-progress
 * for the next release, edit the topmost entry with `version: "next"`.
 * The bump-version script renames it to the new version on bump.
 *
 * ────────────────────────────────────────────────────────────────────────
 */

export type ReleaseItemKind = "feat" | "fix" | "polish" | "internal";

export interface ReleaseItem {
  kind: ReleaseItemKind;
  /** One-line user-facing summary. Past tense. No trailing period. */
  text: string;
}

export interface ReleaseEntry {
  /** SemVer string, or "next" for the in-flight WIP entry. */
  version: string;
  /** ISO yyyy-mm-dd. */
  date: string;
  /** Optional human-readable tagline shown above the bullets. */
  title?: string;
  items: ReleaseItem[];
}

export const RELEASES: ReleaseEntry[] = [
  {
    version: "3.0.3",
    date: "2026-05-15",
    title: "Audio Mode, full UI revamp, on-site docs",
    items: [
      { kind: "feat", text: "Audio Mode for the watch page — listen without the visual, with black / visualizer / custom backgrounds" },
      { kind: "feat", text: "Custom audio-mode background images can be uploaded from your computer" },
      { kind: "feat", text: "Per-video audio-mode pins persist across visits" },
      { kind: "feat", text: "Theme picker for the extension UI (System / Dark / Light)" },
      { kind: "polish", text: "Visualizer reworked into an AM-style waveform with sensitivity control" },
      { kind: "polish", text: "Popup redesigned: live status row, feature toggles, brand-aligned look" },
      { kind: "polish", text: "Options page redesigned with a real component library and confirm dialogs" },
      { kind: "polish", text: "Marketing site implements the Claude Design handoff end to end" },
      { kind: "feat", text: "On-site documentation replaces the GitHub wiki: install guide, keybindings reference, FAQ" },
      { kind: "fix", text: "Audio kept dropping when switching from visualizer to a black or custom screen" },
      { kind: "fix", text: "Audio mode now persists across SPA navigation between videos" },
    ],
  },
];

/** Newest entry whose version is concrete (not "next"). */
export function getLatestRelease(): ReleaseEntry | undefined {
  return RELEASES.find((r) => r.version !== "next");
}

/** Returns the entry matching the given version, or undefined. */
export function getRelease(version: string): ReleaseEntry | undefined {
  return RELEASES.find((r) => r.version === version);
}

/** The release entry matching EXTENSION_VERSION. Errors if missing. */
export function getCurrentRelease(): ReleaseEntry {
  const entry = getRelease(EXTENSION_VERSION);
  if (!entry) {
    throw new Error(
      `No RELEASES entry for version "${EXTENSION_VERSION}". Update packages/constants/src/releases.ts.`,
    );
  }
  return entry;
}

/** Filter out internal items for user-facing surfaces. */
export function userFacingItems(items: ReleaseItem[]): ReleaseItem[] {
  return items.filter((i) => i.kind !== "internal");
}
