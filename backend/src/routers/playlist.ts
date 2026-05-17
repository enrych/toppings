import { AutoRouter, IRequest } from "itty-router";
import { ERROR } from "@toppings/constants";
import PlaylistService from "../services/playlists";
import ResponseEntity from "../utils/responseEntity";

const router = AutoRouter({
  base: "/api/v1/playlist",
});

router.get("/:playlistId", async (request: IRequest, env: Env) => {
  const { playlistId } = request.params;

  if (!playlistId)
    return ResponseEntity.badRequest(ERROR.MISSING_PLAYLIST_ID);

  return ResponseEntity.ok(
    await PlaylistService.getPlaylistMetadata(playlistId, env),
  );
});

export const playlistRouter = router.fetch;
