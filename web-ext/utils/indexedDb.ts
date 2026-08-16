import { BROWSER_STORAGE_IDB_STORE } from "../data/core";

const DB_NAME = "toppings";

/** Object stores the extension needs, with their key paths. */
const REQUIRED_STORES: ReadonlyArray<readonly [string, string]> = [
  [BROWSER_STORAGE_IDB_STORE.VIDEO_PREFERENCE, "videoId"],
  [BROWSER_STORAGE_IDB_STORE.CAPABILITY_CACHE, "primitiveId"],
  [BROWSER_STORAGE_IDB_STORE.LOOP_SEGMENT, "videoId"],
  [BROWSER_STORAGE_IDB_STORE.SEGMENT_DATA, "videoId"],
];

let dbPromise: Promise<IDBDatabase> | null = null;

function upgradeDatabase(db: IDBDatabase): void {
  for (const [name, keyPath] of REQUIRED_STORES) {
    if (!db.objectStoreNames.contains(name)) {
      db.createObjectStore(name, { keyPath });
    }
  }
}

/**
 * Open the database. Omitting `version` adopts whatever version is already
 * stored, so we can never request one lower than the browser holds — that
 * fails with VersionError and takes every storage read down with it.
 */
function open(version?: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request =
      version === undefined
        ? indexedDB.open(DB_NAME)
        : indexedDB.open(DB_NAME, version);

    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB open failed"));
    request.onupgradeneeded = () => upgradeDatabase(request.result);
    request.onsuccess = () => resolve(request.result);
  });
}

export function openExtensionDatabase(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await open();

      // A brand-new DB is created by the versionless open above (at version 1,
      // running onupgradeneeded). An existing DB may predate a store we added
      // since — bump the version once to create whatever is missing.
      const missing = REQUIRED_STORES.some(
        ([name]) => !db.objectStoreNames.contains(name),
      );
      if (!missing) return db;

      const next = db.version + 1;
      db.close();
      return open(next);
    })().catch((error) => {
      dbPromise = null; // allow a later retry
      throw error;
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
