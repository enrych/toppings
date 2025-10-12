import { AutoRouter, Router, error } from "itty-router";
import { preflight, corsify } from "./middlewares/cors";
import ResponseEntity from "./utils/responseEntity";
import { playlistRouter } from "./routers/playlist";

const router = AutoRouter({
  before: [preflight],
  finally: [corsify],
  catch: error,
});

router.get("/ping", () => {
  return ResponseEntity.ok("pong");
});

router.all("/playlist/*", playlistRouter);

export default router;
