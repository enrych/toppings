import type { Context } from "@/app/background/context";
import type { Storage } from "@/lib/store";

import onPlaylistPage from "@/features/playlist/page";
import onShortsPage from "@/features/shorts/page";
import onWatchPage from "@/features/playback/watch";
import onYoutubePage from "@/features/profiles/youtubePage";
import { setupNativeSettings } from "@/features/profiles/nativeSettings";
import { EXTENSION_CONTEXT_SCOPE } from "@/lib/protocol";
import { EXTENSION_MESSAGE_EVENT, EXTENSION_MESSAGE_TYPE } from "@/lib/protocol";

const scopeHandlers: Record<string, Function> = {
  [EXTENSION_CONTEXT_SCOPE.PLAYLIST]: onPlaylistPage,
  [EXTENSION_CONTEXT_SCOPE.SHORTS]: onShortsPage,
  [EXTENSION_CONTEXT_SCOPE.WATCH]: onWatchPage,
  [EXTENSION_CONTEXT_SCOPE.YOUTUBE]: onYoutubePage,
};

function runApp(message: any): undefined {
  (async () => {
    const parsed = JSON.parse(message) as Record<string, unknown>;
    const { type, payload } = parsed;

    if (type !== EXTENSION_MESSAGE_TYPE.CONTEXT) return;
    const ctx = payload as Exclude<Context, null>;

    const { scope, store } = ctx;

    // Native settings sidebar — runs on every YouTube navigation, independent
    // of scope. Feature-gated by store.ui.nativeSettingsEnabled.
    setupNativeSettings(
      !!(store.isExtensionEnabled && store.ui?.nativeSettingsEnabled),
    );

    const handler = scopeHandlers[scope];

    if (!handler) {
      console.warn("[Toppings] No content script handler for scope:", scope);
      return;
    }

    // The YOUTUBE scope has no preferences entry — it's always enabled when the
    // extension is enabled (checked above via store.isExtensionEnabled).
    const prefs = store.preferences[scope as keyof typeof store.preferences];
    const isEnabled = prefs ? prefs.isEnabled : true;
    if (!isEnabled) return;

    await handler(ctx);
  })();
}

chrome.runtime.sendMessage(
  chrome.runtime.id,
  JSON.stringify({
    type: EXTENSION_MESSAGE_TYPE.EVENT,
    payload: EXTENSION_MESSAGE_EVENT.CONNECTED,
  }),
  {},
  runApp,
);
chrome.runtime.onMessage.addListener(runApp);
