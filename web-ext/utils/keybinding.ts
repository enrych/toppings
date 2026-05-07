/**
 * Extension-wide keybinding utilities.
 *
 * Keybindings are stored as human-readable combo strings, e.g.:
 *   "Q"          — plain key, no modifier
 *   "Shift+Q"    — Shift held
 *   "Ctrl+Shift+A" — multiple modifiers
 *
 * Modifier order (canonical): Ctrl → Alt → Shift → Meta
 */

/** All recognised modifier names, in canonical order. */
export const MODIFIER_KEYS = ["Ctrl", "Alt", "Shift", "Meta"] as const;
export type ModifierKey = (typeof MODIFIER_KEYS)[number];

/** Keys whose `event.key` value IS the modifier itself — skip these during capture. */
const MODIFIER_KEY_VALUES = new Set([
  "Control", "Alt", "Shift", "Meta",
  "CapsLock", "NumLock", "ScrollLock",
]);

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const MODIFIER_SYMBOLS: Record<ModifierKey, string> = {
  Ctrl: "⌃",
  Alt: "⌥",
  Shift: "⇧",
  Meta: "⌘",
};

/**
 * Convert a stored combo string to a compact display string.
 *
 * "Shift+Q"      → "⇧Q"
 * "Ctrl+Shift+A" → "⌃⇧A"
 * "Q"            → "Q"
 * ""             → ""
 */
export function formatBindingDisplay(combo: string): string {
  if (!combo) return "";
  return combo
    .split("+")
    .map((part) => MODIFIER_SYMBOLS[part as ModifierKey] ?? part)
    .join("");
}

// ---------------------------------------------------------------------------
// Recording
// ---------------------------------------------------------------------------

/**
 * Given a raw keydown event, return the canonical combo string to store, or
 * `null` if the event should be ignored (modifier-only press, etc.).
 *
 * Only letter (A-Z) and digit (0-9) base keys are accepted; everything else
 * is ignored so accidental function-key or arrow-key presses don't overwrite
 * bindings.
 */
export function recordBinding(e: KeyboardEvent): string | null {
  // Skip pure modifier key presses — wait for an actual key.
  if (MODIFIER_KEY_VALUES.has(e.key)) return null;

  // Only accept letter or digit base keys.
  const baseKey = e.key.toUpperCase();
  if (!/^[A-Z0-9]$/.test(baseKey)) return null;

  const parts: string[] = [];
  if (e.ctrlKey) parts.push("Ctrl");
  if (e.altKey) parts.push("Alt");
  if (e.shiftKey) parts.push("Shift");
  if (e.metaKey) parts.push("Meta");
  parts.push(baseKey);

  return parts.join("+");
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

/**
 * Returns true when a KeyboardEvent matches a stored combo string.
 *
 * Matching rules:
 * - Base key comparison is case-insensitive (stored "Q" matches event.key
 *   "q" or "Q").
 * - Modifier keys are compared EXACTLY: "Q" (no modifier) does NOT fire
 *   when Shift is held; "Shift+Q" only fires when Shift is held.
 * - An empty or falsy binding never matches.
 */
export function matchesBinding(event: KeyboardEvent, binding: string): boolean {
  if (!binding) return false;

  const parts = binding.split("+");
  const storedKey = parts[parts.length - 1].toUpperCase();
  const mods = new Set(parts.slice(0, -1).map((m) => m.toLowerCase()));

  // Base key check (case-insensitive).
  if (event.key.toUpperCase() !== storedKey) return false;

  // Exact modifier check.
  return (
    event.shiftKey === mods.has("shift") &&
    event.ctrlKey === mods.has("ctrl") &&
    event.altKey === mods.has("alt") &&
    event.metaKey === mods.has("meta")
  );
}
