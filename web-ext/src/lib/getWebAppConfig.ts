export interface WebAppConfig {
  generalSettings: WebAppGeneralSettings;
  routes?: Record<string, WebAppRouteConfig>;
}

export interface WebAppGeneralSettings {
  isEnabled: boolean;
}

export interface WebAppRouteConfig {
  isEnabled: boolean;
  keybindings?: Record<string, string>;
  preferences?: Record<string, any>;
}

const getWebAppConfig = async (webAppName: string): Promise<WebAppConfig> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get("webApps", (storage) => {
      resolve(storage.webApps[webAppName]);
    });
  });
};

export default getWebAppConfig;
