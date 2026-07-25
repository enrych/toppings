export const MODIFIER_KEYS = ["Ctrl", "Alt", "Shift", "Meta"] as const;
export type ModifierKey = (typeof MODIFIER_KEYS)[number];

const MODIFIER_KEY_VALUES = new Set([
  "Control", "Alt", "Shift", "Meta",
  "CapsLock", "NumLock", "ScrollLock",
]);

const MODIFIER_SYMBOLS: Record<ModifierKey, string> = {
  Ctrl: "⌃",
  Alt: "⌥",
  Shift: "⇧",
  Meta: "⌘",
};

export function formatBindingDisplay(combo: string): string {
  if (!combo) return "";
  return combo
    .split("+")
    .map((part) => MODIFIER_SYMBOLS[part as ModifierKey] ?? part)
    .join("");
}

// null for a modifier-only or non-alphanumeric press, which callers treat as
// "keep listening" rather than as a binding.
export function recordBinding(e: KeyboardEvent): string | null {
  if (MODIFIER_KEY_VALUES.has(e.key)) return null;
  const baseKey = e.key.toUpperCase();
  if (!/^[A-Z0-9]$/.test(baseKey)) return null;

  const modState: Record<ModifierKey, boolean> = {
    Ctrl: e.ctrlKey,
    Alt: e.altKey,
    Shift: e.shiftKey,
    Meta: e.metaKey,
  };
  const parts = MODIFIER_KEYS.filter((m) => modState[m]);
  parts.push(baseKey);

  return parts.join("+");
}

// Modifiers must match exactly, so a binding of "Q" deliberately does not fire
// while Shift is held — that combo belongs to "Shift+Q".
export function matchesBinding(event: KeyboardEvent, binding: string): boolean {
  if (!binding) return false;

  const parts = binding.split("+");
  const storedKey = parts[parts.length - 1].toUpperCase();
  const mods = new Set(parts.slice(0, -1) as ModifierKey[]);

  const modState: Record<ModifierKey, boolean> = {
    Ctrl: event.ctrlKey,
    Alt: event.altKey,
    Shift: event.shiftKey,
    Meta: event.metaKey,
  };

  return (
    event.key.toUpperCase() === storedKey &&
    MODIFIER_KEYS.every((m) => mods.has(m) === modState[m])
  );
}
