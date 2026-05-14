import { AutoRouter, IRequest } from "itty-router";
import {
  BACKEND_ERROR_MESSAGE,
  PLAYLIST_ROUTER_BASE,
  PLAYLIST_ROUTE_PARAM,
} from "toppings-constants";
import PlaylistService from "../services/playlists";
import ResponseEntity from "../utils/responseEntity";

const router = AutoRouter({
  base: PLAYLIST_ROUTER_BASE,
});

router.get(PLAYLIST_ROUTE_PARAM.PLAYLIST_ID, async (request: IRequest, env: Env) => {
  const { playlistId } = request.params;

  if (!playlistId)
    return ResponseEntity.badRequest(BACKEND_ERROR_MESSAGE.MISSING_PLAYLIST_ID);

  return ResponseEntity.ok(
    await PlaylistService.getPlaylistMetadata(playlistId, env),
  );
});

export const playlistRouter = router.fetch;
