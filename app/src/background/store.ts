import youtubeConfig from "../content_scripts/workers/youtube/config";
import udemyConfig from "../content_scripts/workers/udemy/config";

export const SERVER_BASE_URI =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://toppings.pythonanywhere.com/v1";

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

export default DEFAULT_CONFIG;
