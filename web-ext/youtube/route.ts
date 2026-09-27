import { YOUTUBE_QUERY_PARAM, YOUTUBE_SYSTEM_PLAYLIST_ID, YOUTUBE_URL_PATH } from "./urls";

export type RouteName = "watch" | "playlist" | "shorts" | "home" | "search" | "other";

export type Route =
  | { name: "watch"; videoId: string | null; playlistId: string | null }
  | { name: "playlist"; playlistId: string | null; system: boolean }
  | { name: "shorts"; shortId: string | null }
  | { name: "home" }
  | { name: "search" }
  | { name: "other" };

export function routeFor(url: URL): Route {
  const { pathname, searchParams } = url;
  if (pathname.startsWith(YOUTUBE_URL_PATH.WATCH)) {
    return {
      name: "watch",
      videoId: searchParams.get(YOUTUBE_QUERY_PARAM.VIDEO_ID),
      playlistId: searchParams.get(YOUTUBE_QUERY_PARAM.PLAYLIST_ID),
    };
  }
  if (pathname.startsWith(YOUTUBE_URL_PATH.PLAYLIST)) {
    const playlistId = searchParams.get(YOUTUBE_QUERY_PARAM.PLAYLIST_ID);
    const system = playlistId === YOUTUBE_SYSTEM_PLAYLIST_ID.WATCH_LATER || playlistId === YOUTUBE_SYSTEM_PLAYLIST_ID.LIKED;
    return { name: "playlist", playlistId, system };
  }
  if (pathname.startsWith(YOUTUBE_URL_PATH.SHORTS)) {
    return { name: "shorts", shortId: pathname.split("/")[2] || null };
  }
  if (pathname === "/") return { name: "home" };
  if (pathname.startsWith("/results")) return { name: "search" };
  return { name: "other" };
}

// YouTube is a single-page app; it announces each completed navigation with
// this event, which is why the content script needs no help from the
// background to know where it is.
export function onNavigate(listener: (route: Route) => void): void {
  const notify = () => listener(routeFor(new URL(location.href)));
  document.addEventListener("yt-navigate-finish", notify);
  notify();
}
