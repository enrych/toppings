import { useEffect, useState } from "preact/hooks";

// One local-area key as component state, for per-device UI preferences.
export function useChromeStorageLocal<T>(key: string, fallback: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    void chrome.storage.local.get(key).then((result) => {
      if (result[key] != null) setValue(result[key] as T);
    });
    const onChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === "local" && key in changes) setValue((changes[key].newValue as T | undefined) ?? fallback);
    };
    chrome.storage.onChanged.addListener(onChange);
    return () => chrome.storage.onChanged.removeListener(onChange);
  }, [key]);

  return [value, (next) => void chrome.storage.local.set({ [key]: next })];
}
