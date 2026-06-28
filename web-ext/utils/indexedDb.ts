import { BROWSER_STORAGE_IDB } from "../data/core";

const DB_NAME = "toppings";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function upgradeDatabase(db: IDBDatabase): void {
  if (!db.objectStoreNames.contains(BROWSER_STORAGE_IDB.VIDEO_PREFERENCE)) {
    db.createObjectStore(BROWSER_STORAGE_IDB.VIDEO_PREFERENCE, { keyPath: "videoId" });
  }
  if (!db.objectStoreNames.contains(BROWSER_STORAGE_IDB.CAPABILITY_CACHE)) {
    db.createObjectStore(BROWSER_STORAGE_IDB.CAPABILITY_CACHE, { keyPath: "primitiveId" });
  }
  if (!db.objectStoreNames.contains(BROWSER_STORAGE_IDB.LOOP_SEGMENT)) {
    db.createObjectStore(BROWSER_STORAGE_IDB.LOOP_SEGMENT, { keyPath: "videoId" });
  }
  if (!db.objectStoreNames.contains(BROWSER_STORAGE_IDB.SEGMENT_DATA)) {
    db.createObjectStore(BROWSER_STORAGE_IDB.SEGMENT_DATA, { keyPath: "videoId" });
  }
}

export function openExtensionDatabase(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        dbPromise = null;
        reject(request.error ?? new Error("IndexedDB open failed"));
      };

      request.onupgradeneeded = () => {
        upgradeDatabase(request.result);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  return dbPromise;
}

export async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>,
): Promise<T> {
  const db = await openExtensionDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const outcome = run(store);

    const finish = (value: T) => {
      tx.oncomplete = () => resolve(value);
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
    };

    if (outcome instanceof IDBRequest) {
      outcome.onsuccess = () => finish(outcome.result as T);
      outcome.onerror = () =>
        reject(outcome.error ?? new Error("IndexedDB request failed"));
    } else {
      outcome.then(finish).catch(reject);
    }
  });
}
