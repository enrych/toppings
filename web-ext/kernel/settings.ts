// Each feature owns one settings slice under its own storage key, so writing
// one feature's settings can never touch another's. The slice is read with its
// defaults merged in, which is also how a new setting reaches existing users.

export interface Settings<T extends object> {
  key: string;
  defaults: T;
  get(): Promise<T>;
  set(patch: Partial<T>): Promise<void>;
  subscribe(listener: (value: T) => void): () => void;
  legacy?: (store: Record<string, unknown>) => Partial<T> | undefined;
}

export function defineSettings<T extends object>(
  id: string,
  defaults: T,
  legacy?: (store: Record<string, unknown>) => Partial<T> | undefined,
): Settings<T> {
  const key = `settings:${id}`;

  const get = async (): Promise<T> => {
    const stored = await chrome.storage.sync.get(key);
    return { ...defaults, ...(stored[key] as Partial<T> | undefined) };
  };

  return {
    key,
    defaults,
    legacy,
    get,
    async set(patch) {
      const current = await get();
      await chrome.storage.sync.set({ [key]: { ...current, ...patch } });
    },
    subscribe(listener) {
      const onChanged = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
        if (area !== "sync" || !(key in changes)) return;
        listener({ ...defaults, ...(changes[key].newValue as Partial<T> | undefined) });
      };
      chrome.storage.onChanged.addListener(onChanged);
      return () => chrome.storage.onChanged.removeListener(onChanged);
    },
  };
}

// Runs once per slice: copies the value out of the pre-kernel store shape
// when the slice has never been written. Called before the legacy store is
// resynced with its defaults, which would drop the old key.
export async function migrateSettings(slices: Settings<object>[]): Promise<void> {
  const all = (await chrome.storage.sync.get(undefined)) as Record<string, unknown>;
  for (const slice of slices) {
    if (!slice.legacy || slice.key in all) continue;
    const value = slice.legacy(all);
    if (value) await chrome.storage.sync.set({ [slice.key]: { ...slice.defaults, ...value } });
  }
}
