// Each feature owns one settings slice under its own storage key, so writing
// one feature's settings can never touch another's. The slice is read with its
// defaults merged in, which is also how a new setting reaches existing users.

export type StorageArea = "sync" | "local";

export interface SettingsOptions<T extends object> {
  // Sync by default; local for data too large or too personal to roam.
  area?: StorageArea;
  legacy?: (store: Record<string, unknown>) => Partial<T> | undefined;
}

export interface Settings<T extends object> {
  key: string;
  area: StorageArea;
  defaults: T;
  get(): Promise<T>;
  set(patch: Partial<T>): Promise<void>;
  subscribe(listener: (value: T) => void): () => void;
  legacy?: (store: Record<string, unknown>) => Partial<T> | undefined;
}

export function defineSettings<T extends object>(
  id: string,
  defaults: T,
  { area = "sync", legacy }: SettingsOptions<T> = {},
): Settings<T> {
  const key = `settings:${id}`;
  const storage = chrome.storage[area];

  const get = async (): Promise<T> => {
    const stored = await storage.get(key);
    return { ...defaults, ...(stored[key] as Partial<T> | undefined) };
  };

  return {
    key,
    area,
    defaults,
    legacy,
    get,
    async set(patch) {
      const current = await get();
      await storage.set({ [key]: { ...current, ...patch } });
    },
    subscribe(listener) {
      const onChanged = (changes: Record<string, chrome.storage.StorageChange>, changedArea: string) => {
        if (changedArea !== area || !(key in changes)) return;
        listener({ ...defaults, ...(changes[key].newValue as Partial<T> | undefined) });
      };
      chrome.storage.onChanged.addListener(onChanged);
      return () => chrome.storage.onChanged.removeListener(onChanged);
    },
  };
}

// Runs once per slice: copies the value out of the pre-kernel store shape
// when the slice has never been written.
export async function migrateSettings(slices: Settings<object>[]): Promise<void> {
  const stores = {
    sync: (await chrome.storage.sync.get(undefined)) as Record<string, unknown>,
    local: (await chrome.storage.local.get(undefined)) as Record<string, unknown>,
  };
  for (const slice of slices) {
    const all = stores[slice.area];
    if (!slice.legacy || slice.key in all) continue;
    // A mapper may hand back undefined for fields the old store lacked; those
    // must not shadow the defaults.
    const value = Object.fromEntries(Object.entries(slice.legacy(all) ?? {}).filter(([, v]) => v !== undefined));
    if (Object.keys(value).length) await chrome.storage[slice.area].set({ [slice.key]: { ...slice.defaults, ...value } });
  }
}
