import type { Context } from "@/app/background/context";
import type { Storage } from "@/lib/store";
import { bootFeatures } from "@/kernel/features";
import { onNavigate } from "@/youtube/route";
import { playlistRuntime } from "@/features/playlist-runtime";
import { shorts } from "@/features/shorts";
import { playback } from "@/features/playback";
import { profiles } from "@/features/profiles";

import onWatchPage from "@/features/playback/watch";
import { EXTENSION_CONTEXT_SCOPE } from "@/lib/protocol";
import { EXTENSION_MESSAGE_EVENT, EXTENSION_MESSAGE_TYPE } from "@/lib/protocol";

const scopeHandlers: Record<string, Function> = {
  [EXTENSION_CONTEXT_SCOPE.WATCH]: onWatchPage,
};

function runApp(message: any): undefined {
  (async () => {
    const parsed = JSON.parse(message) as Record<string, unknown>;
    const { type, payload } = parsed;

    if (type !== EXTENSION_MESSAGE_TYPE.CONTEXT) return;
    const ctx = payload as Exclude<Context, null>;

    const { scope, store } = ctx;

    const handler = scopeHandlers[scope];

    // Scopes without a handler here belong to features that run on the kernel.
    if (!handler) return;

    if (!store.preferences.watch.isEnabled) return;

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

bootFeatures([playlistRuntime, shorts, playback, profiles], onNavigate);
