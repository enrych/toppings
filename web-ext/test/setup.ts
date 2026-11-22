import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

// Browsers fire ratechange, as a queued task, whenever playbackRate changes;
// happy-dom never does, and features follow the event rather than their own writes.
const rate = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "playbackRate")!;
Object.defineProperty(HTMLMediaElement.prototype, "playbackRate", {
  ...rate,
  set(this: HTMLMediaElement, value: number) {
    const changed = value !== rate.get!.call(this);
    rate.set!.call(this, value);
    if (changed) setTimeout(() => this.dispatchEvent(new Event("ratechange")), 0);
  },
});

type ChangeListener = (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>, area: string) => void;
const listeners = new Set<ChangeListener>();

// An in-memory stand-in for the parts of the extension API the kernel uses,
// including change events so subscriptions behave as they do in the browser.
function memoryArea(name: string) {
  let data: Record<string, unknown> = {};
  const notify = (next: Record<string, unknown>) => {
    const keys = new Set([...Object.keys(data), ...Object.keys(next)]);
    const changes = Object.fromEntries([...keys].filter((k) => data[k] !== next[k]).map((k) => [k, { oldValue: data[k], newValue: next[k] }]));
    data = next;
    if (Object.keys(changes).length) for (const listener of listeners) listener(changes, name);
  };
  return {
    async get(keys?: string | string[] | null) {
      if (keys == null) return { ...data };
      const list = Array.isArray(keys) ? keys : [keys];
      return Object.fromEntries(list.filter((k) => k in data).map((k) => [k, data[k]]));
    },
    async set(items: Record<string, unknown>) {
      notify({ ...data, ...items });
    },
    async remove(keys: string | string[]) {
      const next = { ...data };
      for (const k of Array.isArray(keys) ? keys : [keys]) delete next[k];
      notify(next);
    },
    async clear() {
      notify({});
    },
  };
}

Object.assign(globalThis, {
  chrome: {
    storage: {
      sync: memoryArea("sync"),
      local: memoryArea("local"),
      onChanged: {
        addListener: (listener: ChangeListener) => listeners.add(listener),
        removeListener: (listener: ChangeListener) => listeners.delete(listener),
      },
    },
    runtime: {
      getURL: (path: string) => `chrome-extension://test/${path}`,
      onMessage: { addListener() {} },
      sendMessage: async () => undefined,
    },
  },
});
