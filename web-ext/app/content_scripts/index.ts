import type { Context } from "../background/context";
import type { Storage } from "../background/store";

import onPlaylistPage from "./pages/playlist";
import onShortsPage from "./pages/shorts";
import onWatchPage from "./pages/watch";
import onYoutubePage from "./pages/youtube";
import { setupNativeSettings } from "./pages/nativeSettings";
import "./index.css";
import { ERROR, EXTENSION_CONTEXT_SCOPE } from "@toppings/constants";
import {
  EXTENSION_MESSAGE_BODY,
  EXTENSION_MESSAGE_EVENT,
  EXTENSION_MESSAGE_TYPE,
} from "../../data/extension.data";

const scopeHandlers: Record<string, Function> = {
  [EXTENSION_CONTEXT_SCOPE.PLAYLIST]: onPlaylistPage,
  [EXTENSION_CONTEXT_SCOPE.SHORTS]: onShortsPage,
  [EXTENSION_CONTEXT_SCOPE.WATCH]: onWatchPage,
  [EXTENSION_CONTEXT_SCOPE.YOUTUBE]: onYoutubePage,
};

function runApp(message: any): undefined {
  (async () => {
    const parsed = JSON.parse(message) as Record<string, unknown>;
    const type = parsed[EXTENSION_MESSAGE_BODY.TYPE];
    const payload = parsed[EXTENSION_MESSAGE_BODY.PAYLOAD];

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
      console.warn(ERROR.NO_CONTENT_HANDLER, scope);
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
    [EXTENSION_MESSAGE_BODY.TYPE]: EXTENSION_MESSAGE_TYPE.EVENT,
    [EXTENSION_MESSAGE_BODY.PAYLOAD]: EXTENSION_MESSAGE_EVENT.CONNECTED,
  }),
  {},
  runApp,
);
chrome.runtime.onMessage.addListener(runApp);
