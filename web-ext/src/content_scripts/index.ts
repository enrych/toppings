import type { Context } from "../background/context";
import type { Storage } from "../background/store";

import onPlaylistPage from "./pages/playlist";
import onShortsPage from "./pages/shorts";
import onWatchPage from "./pages/watch";
import "./index.css";
import {
  EVENT_TYPE,
  MESSAGE_TYPE,
  WARNING_MESSAGE,
} from "../constants/global.constants";

const pageHandlers: Record<keyof Storage["preferences"], Function> = {
  playlist: onPlaylistPage,
  shorts: onShortsPage,
  watch: onWatchPage,
};

function runApp(message: any): undefined {
  (async () => {
    const { type, payload } = JSON.parse(message);

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
  JSON.stringify({ type: MESSAGE_TYPE.EVENT, payload: EVENT_TYPE.CONNECTED }),
  {},
  runApp,
);
chrome.runtime.onMessage.addListener(runApp);
