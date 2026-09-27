import { isTypingTarget, matchesBinding } from "@/lib/keybinding";
import { defineSettings } from "./settings";

export interface KeyDefinition {
  label: string;
  description?: string;
  defaultBinding: string;
}

// A feature declares its actions once, statically, so the options page can
// list them without mounting anything; handlers arrive at mount time.
export interface KeyGroup<K extends string = string> {
  id: string;
  title: string;
  keys: Record<K, KeyDefinition>;
}

export function defineKeys<K extends string>(group: KeyGroup<K>): KeyGroup<K> {
  return group;
}

// Only bindings the user changed are stored, by action id ("shorts.seekForward").
export const keybindings = defineSettings<Record<string, string>>("keybindings", {});

export function actionId(group: KeyGroup, key: string): string {
  return `${group.id}.${key}`;
}

export function bindingOf(group: KeyGroup, key: string, stored: Record<string, string>): string {
  return stored[actionId(group, key)] ?? group.keys[key].defaultBinding;
}

interface Binding {
  group: KeyGroup;
  key: string;
  run: () => void;
}

let active: Binding[] = [];
let stored: Record<string, string> = {};
let installed = false;

function install(): void {
  if (installed) return;
  installed = true;
  void keybindings.get().then((value) => (stored = value));
  keybindings.subscribe((value) => (stored = value));
  document.addEventListener("keydown", (event) => {
    if (isTypingTarget(event.target)) return;
    const hit = active.find((b) => matchesBinding(event, bindingOf(b.group, b.key, stored)));
    hit?.run();
  });
}

export function bindKeys<K extends string>(group: KeyGroup<K>, handlers: Record<K, () => void>): () => void {
  install();
  const added: Binding[] = (Object.keys(handlers) as K[]).map((key) => ({ group, key, run: handlers[key] }));
  active.push(...added);
  return () => {
    active = active.filter((b) => !added.includes(b));
  };
}
