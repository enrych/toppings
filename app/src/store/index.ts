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
