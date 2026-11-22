import { CHROME_STORAGE_LOCAL_KEY } from "@/lib/storageKeys";
import type { SegmentConfig, VideoSegmentData } from "./types";

export type AutoLoad = "off" | "last-used" | "default";

export interface VideoSegments {
  data(): Promise<VideoSegmentData>;
  getLastUsed(): Promise<SegmentConfig | null>;
  setLastUsed(config: SegmentConfig): Promise<void>;
  saveConfig(config: SegmentConfig): Promise<void>;
  deleteConfig(configId: string): Promise<void>;
  setDefaultConfig(configId: string): Promise<void>;
  // null means "leave segments off"; callers must not substitute a fresh config.
  autoLoadConfig(autoLoad: AutoLoad): Promise<SegmentConfig | null>;
}

// Everything the feature stores about one video, read and written as a unit
// under one key, which exists only while there is something to keep.
export function openVideoSegments(videoId: string): VideoSegments {
  const key = `${CHROME_STORAGE_LOCAL_KEY.SEGMENTS_PREFIX}${videoId}`;
  const read = async (): Promise<VideoSegmentData> =>
    ((await chrome.storage.local.get(key))[key] as VideoSegmentData | undefined) ?? { v: 1, lastUsed: null, configs: [], defaultConfigId: null };
  // Writes are read-modify-write, so they run one at a time, and a read waits
  // for the writes queued before it; rapid edits then never clobber each other.
  let queue: Promise<unknown> = Promise.resolve();
  const data = async () => {
    await queue;
    return read();
  };
  const patch = (change: (current: VideoSegmentData) => Partial<VideoSegmentData>) => {
    const write = queue.then(async () => {
      const current = await read();
      const next = { ...current, ...change(current) };
      if (next.lastUsed || next.configs.length > 0) await chrome.storage.local.set({ [key]: next });
      else await chrome.storage.local.remove(key);
    });
    queue = write.catch(() => undefined);
    return write;
  };

  return {
    data,
    getLastUsed: async () => (await data()).lastUsed,
    setLastUsed: (lastUsed) => patch(() => ({ lastUsed })),
    saveConfig: (config) =>
      patch(({ configs }) => ({ configs: configs.some((c) => c.id === config.id) ? configs.map((c) => (c.id === config.id ? config : c)) : [...configs, config] })),
    deleteConfig: (configId) =>
      patch(({ configs, defaultConfigId }) => ({ configs: configs.filter((c) => c.id !== configId), defaultConfigId: defaultConfigId === configId ? null : defaultConfigId })),
    setDefaultConfig: (defaultConfigId) => patch(() => ({ defaultConfigId })),
    async autoLoadConfig(autoLoad) {
      const record = await data();
      if (autoLoad === "off") return null;
      if (autoLoad === "last-used") return record.lastUsed;
      return record.configs.find((c) => c.id === record.defaultConfigId) ?? null;
    },
  };
}
