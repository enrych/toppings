import { EXTENSION_DEFAULT_STORE } from "toppings-constants";

export const DEFAULT_STORE = EXTENSION_DEFAULT_STORE;

function deepMerge(defaults: any, stored: any): any {
  if (!stored || typeof stored !== "object" || typeof defaults !== "object") {
    return stored ?? defaults;
  }
  const result = { ...defaults };
  for (const key of Object.keys(stored)) {
    if (
      key in defaults &&
      typeof defaults[key] === "object" &&
      !Array.isArray(defaults[key])
    ) {
      result[key] = deepMerge(defaults[key], stored[key]);
    } else {
      result[key] = stored[key];
    }
  }
  return result;
}

export const getStorage = async (): Promise<Storage> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(undefined, (storage) => {
      resolve(deepMerge(DEFAULT_STORE, storage) as Storage);
    });
  });
};

export type Storage = typeof DEFAULT_STORE;
