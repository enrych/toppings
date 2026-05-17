import type { Context } from "../background/context";
import type { Storage } from "../background/store";

import onPlaylistPage from "./pages/playlist";
import onShortsPage from "./pages/shorts";
import onWatchPage from "./pages/watch";
import "./index.css";
import {
  ERROR,
  MESSAGE_EVENT,
  MESSAGE_FIELD,
  MESSAGE_TYPE,
} from "@toppings/constants";

const pageHandlers: Record<keyof Storage["preferences"], Function> = {
  playlist: onPlaylistPage,
  shorts: onShortsPage,
  watch: onWatchPage,
};

function runApp(message: any): undefined {
  (async () => {
    const parsed = JSON.parse(message) as Record<string, unknown>;
    const type = parsed[MESSAGE_FIELD.TYPE];
    const payload = parsed[MESSAGE_FIELD.PAYLOAD];

    if (type !== MESSAGE_TYPE.CONTEXT) return;
    const ctx = payload as Exclude<Context, null>;

    const { pathname, store } = ctx;
    const handler = pageHandlers[pathname];

    if (!handler) {
      console.warn(ERROR.NO_CONTENT_HANDLER, pathname);
      return;
    }

    const isEnabled = store.preferences[pathname].isEnabled;
    if (!isEnabled) return;

    await handler(ctx);
  })();
}

chrome.runtime.sendMessage(
  chrome.runtime.id,
  JSON.stringify({
    [MESSAGE_FIELD.TYPE]: MESSAGE_TYPE.EVENT,
    [MESSAGE_FIELD.PAYLOAD]: MESSAGE_EVENT.CONNECTED,
  }),
  {},
  runApp,
);
chrome.runtime.onMessage.addListener(runApp);
