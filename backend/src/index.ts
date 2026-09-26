import { CORS, HttpError, json } from "./http";
import { playlistRuntime } from "./playlist";

const PLAYLIST = /^\/api\/v1\/playlist\/([^/]+)$/;

async function route(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url);

  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (request.method !== "GET") throw new HttpError(405, "Method not allowed");

  if (pathname === "/api/ping") return json("pong");

  const playlist = PLAYLIST.exec(pathname);
  if (playlist) {
    const playlistId = decodeURIComponent(playlist[1]);
    return json({
      scope: "playlist",
      payload: await playlistRuntime(playlistId, env.YOUTUBE_DATA_API_V3_KEY),
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
