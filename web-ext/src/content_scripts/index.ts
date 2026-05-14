import type { Context } from "../background/context";
import type { Storage } from "../background/store";

import onPlaylistPage from "./pages/playlist";
import onShortsPage from "./pages/shorts";
import onWatchPage from "./pages/watch";
import "./index.css";
import {
  EVENT_TYPE,
  JSON_MESSAGE_FIELD,
  MESSAGE_TYPE,
  WARNING_MESSAGE,
} from "toppings-constants";

const pageHandlers: Record<keyof Storage["preferences"], Function> = {
  playlist: onPlaylistPage,
  shorts: onShortsPage,
  watch: onWatchPage,
};

function runApp(message: any): undefined {
  (async () => {
    const parsed = JSON.parse(message) as Record<string, unknown>;
    const type = parsed[JSON_MESSAGE_FIELD.TYPE];
    const payload = parsed[JSON_MESSAGE_FIELD.PAYLOAD];

    if (type !== MESSAGE_TYPE.CONTEXT) return;
    const ctx = payload as Exclude<Context, null>;

    const { pathname, store } = ctx;
    const handler = pageHandlers[pathname];

    if (!handler) {
      console.warn(WARNING_MESSAGE.NO_HANDLER_FOUND, pathname);
      return;
    }

    const isEnabled = store.preferences[pathname].isEnabled;
    if (!isEnabled) return;

    await handler(ctx);
  })();
}

// Handle Events
chrome.runtime.sendMessage(
  chrome.runtime.id,
  JSON.stringify({
    [JSON_MESSAGE_FIELD.TYPE]: MESSAGE_TYPE.EVENT,
    [JSON_MESSAGE_FIELD.PAYLOAD]: EVENT_TYPE.CONNECTED,
  }),
  {},
  runApp,
);
chrome.runtime.onMessage.addListener(runApp);
