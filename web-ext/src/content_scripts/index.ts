import type { Context } from "../background/context";
import type { Storage } from "../background/store";

import onPlaylistPage from "./routes/playlist";
import onShortsPage from "./routes/shorts";
import onWatchPage from "./routes/watch";
import "./index.css";

const handlers: Record<keyof Storage["preferences"], Function> = {
  playlist: onPlaylistPage,
  shorts: onShortsPage,
  watch: onWatchPage,
};

function runApp(message: any): undefined {
  (async () => {
    const { type, payload } = JSON.parse(message);

    if (type !== "context") return;
    const ctx = payload as Exclude<Context, null>;

    const { name, store } = ctx;
    const handler = handlers[name];

    if (!handler) {
      console.warn(`No handler found: ${name}`);
      return;
    }

    const isEnabled = store.preferences[name].isEnabled;
    if (!isEnabled) return;

    await handler(ctx);
  })();
}

// Handle Events
chrome.runtime.sendMessage({ type: "event", payload: "connected" }, {}, runApp);
chrome.runtime.onMessage.addListener(runApp);
