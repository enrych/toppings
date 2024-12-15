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

async function runApp(ctx: Exclude<Context, null>): Promise<void> {
  const { event, store } = ctx;
  const handler = eventHandlers[event];

  if (!handler) {
    console.warn(`No handler found for event: ${event}`);
    return;
  }

  const isFeatureEnabled = store.preferences[event].isEnabled;
  if (!isFeatureEnabled) return;

  await handler(ctx);
}

chrome.runtime.sendMessage({
  event: "connected",
});

chrome.runtime.onMessage.addListener((ctx: string): undefined => {
  const parsedWebAppContext = JSON.parse(ctx);
  void runApp(parsedWebAppContext);
});
