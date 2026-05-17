import { AutoRouter, error } from "itty-router";
import { ENDPOINTS } from "@toppings/constants";
import { preflight, corsify } from "./middlewares/cors";
import ResponseEntity from "./utils/responseEntity";
import { playlistRouter } from "./routers/playlist";

const router = AutoRouter({
  before: [preflight],
  finally: [corsify],
  catch: error,
});

router.get(ENDPOINTS.PING, () => ResponseEntity.ok("pong"));

router.all("/api/v1/playlist/*", playlistRouter);

export default router;
