import type { Context } from "../background/context";
import type { Storage } from "../background/store";

import onPlaylistPage from "./routes/playlist";
import onShortsPage from "./routes/shorts";
import onWatchPage from "./routes/watch";
import "./index.css";

const eventHandlers: Record<keyof Storage["preferences"], Function> = {
  watch: onWatchPage,
  playlist: onPlaylistPage,
  shorts: onShortsPage,
};

function onEvent(context: string): undefined {
  (async () => {
    const ctx = JSON.parse(context) as Exclude<Context, null>;
    const { event, store } = ctx;
    const handler = eventHandlers[event];

    if (!handler) {
      console.warn(`No handler found for event: ${event}`);
      return;
    }

    const isFeatureEnabled = store.preferences[event].isEnabled;
    if (!isFeatureEnabled) return;

    await handler(ctx);
  })();
}

// Handle Events
chrome.runtime.sendMessage({ event: "connected" }, {}, onEvent);
chrome.runtime.onMessage.addListener(onEvent);
