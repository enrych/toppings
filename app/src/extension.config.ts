import udemyConfig from "./content_scripts/webApps/udemy/webApp.config";
import youtubeConfig from "./content_scripts/webApps/youtube/webApp.config";

const DEFAULT_CONFIG = {
  globalSettings: {
    isExtensionEnabled: true as boolean,
  },
  webApps: {
    youtube: youtubeConfig,
    udemy: udemyConfig,
  },
};

export type ExtensionConfig = typeof DEFAULT_CONFIG;
export type WebApps = keyof typeof DEFAULT_CONFIG.webApps;

export default DEFAULT_CONFIG;
