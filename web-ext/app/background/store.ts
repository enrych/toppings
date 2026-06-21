import { mergeDefaults } from "../../utils/access";
import { DEFAULT_STORE } from "../../data/store.data";

export { DEFAULT_STORE };

export const getStorage = async (): Promise<Storage> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(undefined, (storage) => {
      resolve(mergeDefaults(DEFAULT_STORE, storage));
    });
  });
};

export const syncStorageWithDefaults = async (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(undefined, (storage) => {
      const merged = mergeDefaults(DEFAULT_STORE, storage);
      void chrome.storage.sync.set(merged, () => resolve());
    });
  });
};

export type Storage = typeof DEFAULT_STORE;
