import { useContext } from "react";
import { produce } from "immer";
import StoreContext from "../store";
import { Storage } from "../../background/store";

type Recipe = (draft: Storage) => void;

/**
 * Returns a function that applies an immer recipe to the store, syncs to
 * chrome.storage.sync, and returns the updated state. Centralizes the
 * "produce + setStore + chrome.storage.sync.set" trio used everywhere.
 */
export function useStoreUpdater(): {
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
