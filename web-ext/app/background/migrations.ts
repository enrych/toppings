import { keybindings } from "@/kernel/keys";
import { migrateSettings, type Settings } from "@/kernel/settings";
import { playlistRuntimeSettings } from "@/features/playlist-runtime/settings";
import { shortsSettings } from "@/features/shorts/settings";

// Where each action's binding lived in the pre-kernel store, by action id.
const LEGACY_BINDINGS: Record<string, string> = {
  "shorts.toggleRate": "preferences.shorts.togglePlaybackRate.key",
  "shorts.seekBackward": "preferences.shorts.seekBackward.key",
  "shorts.seekForward": "preferences.shorts.seekForward.key",
};

function read(store: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], store);
}

const legacyKeybindings: Settings<Record<string, string>> = {
  ...keybindings,
  legacy(store) {
    const bindings: Record<string, string> = {};
    for (const [action, path] of Object.entries(LEGACY_BINDINGS)) {
      const value = read(store, path);
      if (typeof value === "string") bindings[action] = value;
    }
    return Object.keys(bindings).length ? bindings : undefined;
  },
};

export function migrateLegacyStore(): Promise<void> {
  return migrateSettings([playlistRuntimeSettings, shortsSettings, legacyKeybindings]);
}
