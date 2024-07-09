import workersConfig from "./worker";

export const DEFAULT_CONFIG = {
  globalSettings: {
    isExtensionEnabled: true as boolean,
  },
  workers: workersConfig,
};

export type Config = typeof DEFAULT_CONFIG;

export default DEFAULT_CONFIG;
