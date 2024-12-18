import type { Context } from "../background/context";
import type { Storage } from "../background/store";

import onPlaylistPage from "./pages/playlist";
import onShortsPage from "./pages/shorts";
import onWatchPage from "./pages/watch";
import "./index.css";

const pageHandlers: Record<keyof Storage["preferences"], Function> = {
  playlist: onPlaylistPage,
  shorts: onShortsPage,
  watch: onWatchPage,
};

function runApp(message: any): undefined {
  (async () => {
    const { type, payload } = JSON.parse(message);

    if (type !== "context") return;
    const ctx = payload as Exclude<Context, null>;

    const { pageName, store } = ctx;
    const handler = pageHandlers[pageName];

    if (!handler) {
      console.warn(`No handler found: ${pageName}`);
      return;
    }

    const isEnabled = store.preferences[pageName].isEnabled;
    if (!isEnabled) return;

    await handler(ctx);
  })();
}

// Handle Events
chrome.runtime.sendMessage(
  chrome.runtime.id,
  JSON.stringify({ type: "event", payload: "connected" }),
  {},
  runApp,
);
chrome.runtime.onMessage.addListener(runApp);
