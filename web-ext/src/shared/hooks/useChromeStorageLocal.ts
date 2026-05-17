import { defaultTo, isNull } from "@toppings/utils";
import { useEffect, useState } from "react";

export function useChromeStorageLocal<T>(
  key: string,
  fallback: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    chrome.storage.local.get(key, (result) => {
      if (!isNull(result[key])) setValue(result[key] as T);
    });

    const onChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: chrome.storage.AreaName,
    ) => {
      if (areaName !== "local") return;
      if (key in changes) {
        const next = changes[key].newValue as T | undefined;
        setValue(defaultTo(next, fallback));
      }
    };
    chrome.storage.onChanged.addListener(onChange);
    return () => chrome.storage.onChanged.removeListener(onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = (next: T) => {
    setValue(next);
    chrome.storage.local.set({ [key]: next });
  };

  return [value, update];
}

export function useChromeStorageLocalCount(prefix: string): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      chrome.storage.local.get(null, (items) => {
        setCount(Object.keys(items).filter((k) => k.startsWith(prefix)).length);
      });
    };
    refresh();
    const onChange = (
      _changes: Record<string, chrome.storage.StorageChange>,
      areaName: chrome.storage.AreaName,
    ) => {
      if (areaName === "local") refresh();
    };
    chrome.storage.onChanged.addListener(onChange);
    return () => chrome.storage.onChanged.removeListener(onChange);
  }, [prefix]);

  return count;
}
