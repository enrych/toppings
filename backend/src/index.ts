import { CORS, HttpError, json } from "./http";
import { getPlaylistRuntime } from "./playlist";

const PLAYLIST_PATH = /^\/api\/v1\/playlist\/([^/]+)$/;
// Checked before any Data API call, so a junk ID costs no quota.
const PLAYLIST_ID = /^[\w-]{2,64}$/;

async function route(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url);

  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (request.method !== "GET") throw new HttpError(405, "Method not allowed");

  if (pathname === "/api/ping") return json("pong");

  const playlist = PLAYLIST_PATH.exec(pathname);
  if (playlist) {
    const playlistId = playlist[1];
    if (!PLAYLIST_ID.test(playlistId)) throw new HttpError(400, "Invalid playlist ID");
    if (!env.YOUTUBE_DATA_API_V3_KEY) {
      throw new HttpError(500, "YOUTUBE_DATA_API_V3_KEY is not set");
    }
    return json({
      scope: "playlist",
      payload: await getPlaylistRuntime(playlistId, env.YOUTUBE_DATA_API_V3_KEY),
    });
  }

  throw new HttpError(404, "Not found");
}

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ status: error.status, error: error.message }, error.status);
      }
      console.error(error);
      return json({ status: 500, error: "Internal error" }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
