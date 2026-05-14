import { AutoRouter, error } from "itty-router";
import { BACKEND_ROUTE, BACKEND_RESPONSE_BODY } from "toppings-constants";
import { preflight, corsify } from "./middlewares/cors";
import ResponseEntity from "./utils/responseEntity";
import { playlistRouter } from "./routers/playlist";

const router = AutoRouter({
  before: [preflight],
  finally: [corsify],
  catch: error,
});

router.get(BACKEND_ROUTE.PING, () => {
  return ResponseEntity.ok(BACKEND_RESPONSE_BODY.PING_OK);
});

router.all(BACKEND_ROUTE.PLAYLIST_MOUNT, playlistRouter);

export default router;
