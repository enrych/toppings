import { ExtensionConfig } from "../extension.config";

const getExtensionConfig = async (): Promise<ExtensionConfig> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(undefined, (storage) => {
      resolve(storage as ExtensionConfig);
    });
  });
};

export default getExtensionConfig;
