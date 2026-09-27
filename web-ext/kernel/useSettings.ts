import { useEffect, useState } from "preact/hooks";
import type { Settings } from "./settings";

// Component binding for a settings slice, for the popup and options pages.
export function useSettings<T extends object>(settings: Settings<T>): {
  value: T;
  update: (patch: Partial<T>) => void;
} {
  const [value, setValue] = useState<T>(settings.defaults);

  useEffect(() => {
    let live = true;
    void settings.get().then((v) => live && setValue(v));
    const unsubscribe = settings.subscribe(setValue);
    return () => {
      live = false;
      unsubscribe();
    };
  }, [settings]);

  return {
    value,
    update: (patch) => {
      setValue((v) => ({ ...v, ...patch }));
      void settings.set(patch);
    },
  };
}
