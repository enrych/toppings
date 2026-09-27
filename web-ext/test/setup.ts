import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

// An in-memory stand-in for the parts of the extension API the kernel uses.
function memoryArea() {
  let data: Record<string, unknown> = {};
  return {
    async get(keys?: string | string[] | null) {
      if (keys == null) return { ...data };
      const list = Array.isArray(keys) ? keys : [keys];
      return Object.fromEntries(list.filter((k) => k in data).map((k) => [k, data[k]]));
    },
    async set(items: Record<string, unknown>) {
      data = { ...data, ...items };
    },
    async remove(keys: string | string[]) {
      for (const k of Array.isArray(keys) ? keys : [keys]) delete data[k];
    },
    async clear() {
      data = {};
    },
  };
}

Object.assign(globalThis, {
  chrome: {
    storage: {
      sync: memoryArea(),
      local: memoryArea(),
      onChanged: { addListener() {}, removeListener() {} },
    },
    runtime: {
      getURL: (path: string) => `chrome-extension://test/${path}`,
      onMessage: { addListener() {} },
      sendMessage: async () => undefined,
    },
  },
});
