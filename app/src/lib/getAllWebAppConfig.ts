import { WebAppConfig } from "./getWebAppConfig";

const getAllWebAppConfig = async (): Promise<Record<string, WebAppConfig>> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get("webApps", (storage) => {
      resolve(storage.webApps);
    });
  });
};

export default getAllWebAppConfig;
