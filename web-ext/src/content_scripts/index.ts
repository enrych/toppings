import type {
  Context,
  PlaylistContext,
  ShortsContext,
  WatchContext,
} from "../background/context";
//
import onPlaylistPage from "./routes/playlist";
import onShortsPage from "./routes/shorts";
import onWatchPage from "./routes/watch";
import "./index.css";

async function runApp(ctx: Context): Promise<undefined> {
  const { endpoint, store } = ctx;

  switch (endpoint) {
    case "watch": {
      const isWatchEnabled = store.routes.watch.isEnabled;
      isWatchEnabled && (await onWatchPage(ctx as WatchContext));
      break;
    }
    case "playlist": {
      const isPlaylistEnabled = store.routes.playlist.isEnabled;
      isPlaylistEnabled && (await onPlaylistPage(ctx as PlaylistContext));
      break;
    }
    case "shorts": {
      const isShortsEnabled = store.routes.shorts.isEnabled;
      isShortsEnabled && (await onShortsPage(ctx as ShortsContext));
      break;
    }
    default:
      break;
  }
}

chrome.runtime.onMessage.addListener((ctx: string): undefined => {
  const parsedWebAppContext = JSON.parse(ctx);
  void runApp(parsedWebAppContext);
});
