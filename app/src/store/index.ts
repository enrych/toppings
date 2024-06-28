import youtubeConfig from "../content_scripts/workers/youtube/config";
import udemyConfig from "../content_scripts/workers/udemy/config";

export const DEFAULT_CONFIG = {
  globalSettings: {
    isExtensionEnabled: true,
  },
  workers: {
    youtube: {
      ...youtubeConfig,
    },
    udemy: {
      ...udemyConfig,
    },
  },
};

export type Config = typeof DEFAULT_CONFIG;

const GLOBAL_CONTEXT = Object.freeze({
  MAX_PLAYBACK_RATE: 16.0,
  MIN_PLAYBACK_RATE: 0.0625,
});

export default GLOBAL_CONTEXT;
