import { keybindings } from "@/kernel/keys";
import { appSettings } from "@/app/settings";
import { migrateSettings, type Settings } from "@/kernel/settings";
import { playlistRuntimeSettings } from "@/features/playlist-runtime/settings";
import { shortsSettings } from "@/features/shorts/settings";
import { playbackSettings } from "@/features/playback/settings";
import { profilesSettings } from "@/features/profiles/settings";
import { profileStore } from "@/features/profiles/store";
import { segmentsSettings } from "@/features/segments/settings";

// Where each action's binding lived in the pre-kernel store, by action id.
const LEGACY_BINDINGS: Record<string, string> = {
  "playback.toggleRate": "preferences.watch.togglePlaybackRate.key",
  "playback.increaseRate": "preferences.watch.increasePlaybackRate.key",
  "playback.decreaseRate": "preferences.watch.decreasePlaybackRate.key",
  "playback.seekBackward": "preferences.watch.seekBackward.key",
  "playback.seekForward": "preferences.watch.seekForward.key",
  "profiles.cycle": "preferences.watch.cycleProfiles.key",
  "segments.toggle": "preferences.watch.toggleLoopSegment.key",
  "segments.fresh": "preferences.watch.segments.freshSlateKey",
  "segments.setStart": "preferences.watch.setLoopSegmentBegin.key",
  "segments.setEnd": "preferences.watch.setLoopSegmentEnd.key",
  "segments.save": "preferences.watch.saveLoopSegment.key",
  "segments.nudgeStartBackward": "preferences.watch.nudgeLoopSegment.startBackwardKey",
  "segments.nudgeStartForward": "preferences.watch.nudgeLoopSegment.startForwardKey",
  "segments.nudgeEndBackward": "preferences.watch.nudgeLoopSegment.endBackwardKey",
  "segments.nudgeEndForward": "preferences.watch.nudgeLoopSegment.endForwardKey",
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

// The pre-kernel store lived under these three keys; once every slice has
// had its chance to copy from them they are dropped.
const LEGACY_KEYS = ["isExtensionEnabled", "ui", "preferences"];

export async function migrateLegacyStore(): Promise<void> {
  await migrateSettings([appSettings, playlistRuntimeSettings, shortsSettings, playbackSettings, profilesSettings, profileStore, segmentsSettings, legacyKeybindings]);
  await chrome.storage.sync.remove(LEGACY_KEYS);
}
