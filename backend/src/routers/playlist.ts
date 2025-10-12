import { AutoRouter, IRequest } from "itty-router";
import PlaylistService from "../services/playlists";
import ResponseEntity from "../utils/responseEntity";

const router = AutoRouter({
  base: "/playlist",
});

router.get("/:playlistId", async (request: IRequest, env: Env) => {
  const { playlistId } = request.params;

  if (!playlistId) return ResponseEntity.badRequest("Missing playlistId");

  return ResponseEntity.ok(
    await PlaylistService.getPlaylistMetadata(playlistId, env),
  );
});

export const playlistRouter = router.fetch;
