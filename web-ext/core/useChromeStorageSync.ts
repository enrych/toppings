import { useContext } from "react";
import { produce } from "immer";
import StoreContext from "./storeContext";
import { Storage } from "../app/background/store";

type Recipe = (draft: Storage) => void;

export function useChromeStorageSync(): {
  store: Storage;
  update: (recipe: Recipe) => void;
} {
  const { store, setStore } = useContext(StoreContext)!;

  const update = (recipe: Recipe) => {
    const next = produce(store, recipe);
    setStore(next);
    chrome.storage.sync.set(next);
  };

  return { store, update };
}
