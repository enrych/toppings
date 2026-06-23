const DB_NAME = "toppings";
const DB_VERSION = 4;

export const VIDEO_PREFERENCE_STORE = "video_preference";
const VIDEO_PREFERENCE_KEY_PATH = "videoId";

export const CAPABILITY_CACHE_STORE = "capability_cache";
const CAPABILITY_CACHE_KEY_PATH = "primitiveId";

export const LOOP_SEGMENT_STORE = "loop_segment";
const LOOP_SEGMENT_KEY_PATH = "videoId";

export const SEGMENT_DATA_STORE = "segment_data";
const SEGMENT_DATA_KEY_PATH = "videoId";

let dbPromise: Promise<IDBDatabase> | null = null;

function upgradeDatabase(db: IDBDatabase): void {
  if (!db.objectStoreNames.contains(VIDEO_PREFERENCE_STORE)) {
    db.createObjectStore(VIDEO_PREFERENCE_STORE, {
      keyPath: VIDEO_PREFERENCE_KEY_PATH,
    });
  }
  if (!db.objectStoreNames.contains(CAPABILITY_CACHE_STORE)) {
    db.createObjectStore(CAPABILITY_CACHE_STORE, {
      keyPath: CAPABILITY_CACHE_KEY_PATH,
    });
  }
  if (!db.objectStoreNames.contains(LOOP_SEGMENT_STORE)) {
    db.createObjectStore(LOOP_SEGMENT_STORE, {
      keyPath: LOOP_SEGMENT_KEY_PATH,
    });
  }
  if (!db.objectStoreNames.contains(SEGMENT_DATA_STORE)) {
    db.createObjectStore(SEGMENT_DATA_STORE, {
      keyPath: SEGMENT_DATA_KEY_PATH,
    });
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
