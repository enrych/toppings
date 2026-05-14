import { IconName } from "./components/primitives/Icon";

/**
 * ============================================================================
 * Toppings Features Registry
 * ============================================================================
 *
 * Central catalog of user-facing features. Surfaces that need to list,
 * describe, or link to features should consume this — currently:
 *   - Popup ("Features" section, "What's New" feed)
 *   - Options sidebar (page list / page intros)
 *   - Future: search, command palette, onboarding tour
 *
 * ─── Maintainer rules ──────────────────────────────────────────────────────
 *
 * When you SHIP a new feature:
 *   1. Add a FeatureEntry below describing what it does and where users
 *      configure it.
 *   2. Add a "What's New" entry at the top of WHATS_NEW with the version
 *      and a one-line user-facing summary.
 *
 * When you REMOVE / DEPRECATE a feature:
 *   1. Either delete its FeatureEntry or set its `status` to "deprecated".
 *   2. Note the removal in WHATS_NEW so users aren't confused.
 *
 * When you CHANGE a feature significantly:
 *   1. Update the `description` if user-visible behavior changed.
 *   2. Add a WHATS_NEW entry for the change.
 *
 * Treat this file like an API contract. Downstream UIs render from these
 * lists and depend on the stable shape.
 * ============================================================================
 */

export type FeatureStatus = "stable" | "new" | "beta" | "deprecated";

export interface FeatureEntry {
  /** Stable identifier — used as a React key and analytics id. */
  id: string;
  /** Short display name (1-3 words). */
  name: string;
  /** One-line description, user-facing. Keep under ~100 chars. */
  description: string;
  /** Icon from the shared icon library. */
  icon: IconName;
  /** Options page route to deep-link to (e.g. "/audio-mode"). */
  route: string;
  /** Optional anchor within the route page (e.g. "visualizer"). */
  anchor?: string;
  /** Lifecycle marker. Drives the "New" / "Beta" badges on cards. */
  status: FeatureStatus;
  /** Which YouTube page(s) the feature applies to. Used for grouping. */
  surfaces: Array<"watch" | "shorts" | "playlist">;
}

export const FEATURES: FeatureEntry[] = [
  {
    id: "audio-mode",
    name: "Audio Mode",
    description:
      "Hide the video and listen to audio only — perfect for office or background play.",
    icon: "audio",
    route: "/audio-mode",
    status: "new",
    surfaces: ["watch"],
  },
  {
    id: "custom-playback-rates",
    name: "Custom Playback Rates",
    description:
      "Add granular speeds beyond YouTube's defaults — anywhere from 0.0625× to 16×.",
    icon: "watch",
    route: "/watch",
    anchor: "playback-rate",
    status: "stable",
    surfaces: ["watch"],
  },
  {
    id: "toggle-playback-rate",
    name: "Toggle Playback Rate",
    description:
      "Press one key to flip between normal speed and your preferred fast rate.",
    icon: "watch",
    route: "/keybindings",
    anchor: "watch",
    status: "stable",
    surfaces: ["watch", "shorts"],
  },
  {
    id: "loop-segments",
    name: "Loop Segments",
    description:
      "Mark a start and end point in any video to loop a section continuously.",
    icon: "watch",
    route: "/watch",
    anchor: "loop",
    status: "stable",
    surfaces: ["watch"],
  },
  {
    id: "seek-shortcuts",
    name: "Seek Shortcuts",
    description:
      "Jump forward and backward with configurable durations via keyboard shortcuts.",
    icon: "keyboard",
    route: "/watch",
    anchor: "seek",
    status: "stable",
    surfaces: ["watch", "shorts"],
  },
  {
    id: "shorts-autoscroll",
    name: "Shorts Auto-Scroll",
    description: "Automatically advance to the next Short when one ends.",
    icon: "shorts",
    route: "/shorts",
    status: "stable",
    surfaces: ["shorts"],
  },
  {
    id: "playlist-runtime",
    name: "Playlist Runtime",
    description:
      "See total and average runtime stats injected at the top of playlists.",
    icon: "playlist",
    route: "/playlist",
    status: "stable",
    surfaces: ["playlist"],
  },
];

export interface WhatsNewEntry {
  /** Extension version this entry shipped in. */
  version: string;
  /** Date the entry was added (ISO format). */
  date: string;
  /** Concise user-facing changes (3-6 bullets max). */
  items: string[];
}

export const WHATS_NEW: WhatsNewEntry[] = [
  {
    version: "next",
    date: "2026-05",
    items: [
      "New: Audio Mode — listen without the video, with black / visualizer / custom backgrounds",
      "New: Visualizer sensitivity control",
      "Themes: pick between system / dark / light",
      "Redesigned options page with a sidebar, sections, toasts, and confirm dialogs",
    ],
  },
];

/** Look up a feature by id. Returns undefined if not found. */
export function getFeature(id: string): FeatureEntry | undefined {
  return FEATURES.find((f) => f.id === id);
}

/** Return all features marked as new — useful for "What's new" cards. */
export function getNewFeatures(): FeatureEntry[] {
  return FEATURES.filter((f) => f.status === "new");
}
