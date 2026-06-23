import { defaultTo } from "../utils/access";
import { isNull } from "../utils/validation";
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
      areaName: string,
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
