import { AutoRouter, cors, error } from "itty-router";
import { ResponseEntity } from "./utils";
import { playlistRouter } from "./routers/playlist";

const { preflight, corsify } = cors();

const router = AutoRouter({
  base: "/api",
  before: [preflight],
  finally: [corsify],
  catch: error,
});

router.get("/ping", () => ResponseEntity.ok("pong"));

router.all("/v1/playlist/*", playlistRouter);

export default router;
