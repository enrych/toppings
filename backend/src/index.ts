import { AutoRouter, cors } from "itty-router";
import getPlaylist from "./routes/playlist";

const { preflight, corsify } = cors();

const router = AutoRouter({
  before: [preflight],
  finally: [corsify],
});

router.get("/playlist/:playlistID", getPlaylist);

router.all(
  "*",
  () =>
    new Response(JSON.stringify({ error_message: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    }),
);

export default router;
