// Secrets are set with `wrangler secret put` and are invisible to `wrangler types`
// unless a .dev.vars file happens to exist, so they are declared here by hand.
interface Env {
  YOUTUBE_DATA_API_V3_KEY: string;
}
