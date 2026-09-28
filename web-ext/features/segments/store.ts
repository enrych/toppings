import { withStore } from "@/lib/indexedDb";
import { BROWSER_STORAGE_IDB_STORE } from "@/lib/storageKeys";
import type { SegmentAutoLoadPin, SegmentConfig, VideoSegmentData } from "./types";

export type AutoLoad = "off" | "last-used" | "default";

// The persistence boundary, so the session can be driven by an in-memory
// store in tests and by IndexedDB in the extension.
export interface SegmentStorage {
  read(videoId: string): Promise<VideoSegmentData | null>;
  write(data: VideoSegmentData): Promise<void>;
}

interface LegacyLoopSegment {
  videoId: string;
  startTime: number;
  endTime: number;
  savedAt: number;
}

// A record from before segments replaced single loops is converted on first
// read and written back, so the conversion happens once.
async function readLegacyLoop(videoId: string): Promise<VideoSegmentData | null> {
  let legacy: LegacyLoopSegment | undefined;
  try {
    legacy = await withStore<LegacyLoopSegment | undefined>(BROWSER_STORAGE_IDB_STORE.LOOP_SEGMENT, "readonly", (store) => store.get(videoId));
  } catch {
    return null;
  }
  if (!legacy) return null;
  const segmentId = crypto.randomUUID();
  const config: SegmentConfig = {
    id: crypto.randomUUID(),
    label: "Restored Loop",
    segments: [{ id: segmentId, startTime: legacy.startTime, endTime: legacy.endTime }],
    sequence: [{ id: crypto.randomUUID(), segmentIds: [segmentId], count: 0, playbackRate: null, perIterationRates: [] }],
    shortcutKey: "",
    createdAt: legacy.savedAt,
    updatedAt: legacy.savedAt,
  };
  const data: VideoSegmentData = { videoId, lastUsed: config, configs: [], defaultConfigId: null, savedAt: legacy.savedAt };
  await indexedDbSegmentStorage.write(data);
  return data;
}

export const indexedDbSegmentStorage: SegmentStorage = {
  async read(videoId) {
    const existing = await withStore<VideoSegmentData | undefined>(BROWSER_STORAGE_IDB_STORE.SEGMENT_DATA, "readonly", (store) => store.get(videoId));
    return existing ?? readLegacyLoop(videoId);
  },
  async write(data) {
    await withStore(BROWSER_STORAGE_IDB_STORE.SEGMENT_DATA, "readwrite", (store) => store.put({ ...data, savedAt: Date.now() }));
  },
};

export function memorySegmentStorage(): SegmentStorage {
  const records = new Map<string, VideoSegmentData>();
  return {
    async read(videoId) {
      return records.get(videoId) ?? null;
    },
    async write(data) {
      records.set(data.videoId, data);
    },
  };
}

export interface VideoSegments {
  data(): Promise<VideoSegmentData>;
  getLastUsed(): Promise<SegmentConfig | null>;
  setLastUsed(config: SegmentConfig | null): Promise<void>;
  saveConfig(config: SegmentConfig): Promise<void>;
  deleteConfig(configId: string): Promise<void>;
  setDefaultConfig(configId: string | null): Promise<void>;
  setPin(pin: SegmentAutoLoadPin): Promise<void>;
  // null means "leave segments off"; callers must not substitute a fresh config.
  autoLoadConfig(globalAutoLoad: AutoLoad): Promise<SegmentConfig | null>;
}

// Everything the feature stores about one video, with the per-video record
// read and written as a unit.
export function openVideoSegments(storage: SegmentStorage, videoId: string): VideoSegments {
  const empty = (): VideoSegmentData => ({ videoId, lastUsed: null, configs: [], defaultConfigId: null, savedAt: 0 });
  // Writes are read-modify-write, so they run one at a time, and a read waits
  // for the writes queued before it; rapid edits then never clobber each other.
  let queue: Promise<unknown> = Promise.resolve();
  const data = async () => {
    await queue;
    return (await storage.read(videoId)) ?? empty();
  };
  const patch = (change: Partial<VideoSegmentData>) => {
    const write = queue.then(async () => storage.write({ ...((await storage.read(videoId)) ?? empty()), ...change }));
    queue = write.catch(() => undefined);
    return write;
  };

  return {
    data,
    getLastUsed: async () => (await data()).lastUsed,
    setLastUsed: (lastUsed) => patch({ lastUsed }),
    async saveConfig(config) {
      const { configs } = await data();
      const known = configs.some((c) => c.id === config.id);
      await patch({ configs: known ? configs.map((c) => (c.id === config.id ? config : c)) : [...configs, config] });
    },
    async deleteConfig(configId) {
      const { configs, defaultConfigId } = await data();
      await patch({ configs: configs.filter((c) => c.id !== configId), defaultConfigId: defaultConfigId === configId ? null : defaultConfigId });
    },
    setDefaultConfig: (defaultConfigId) => patch({ defaultConfigId }),
    setPin: (autoLoadPin) => patch({ autoLoadPin }),
    async autoLoadConfig(globalAutoLoad) {
      const record = await data();
      // A per-video pin outranks the global preference.
      const effective = record.autoLoadPin ?? globalAutoLoad;
      if (effective === "off") return null;
      if (effective === "last-used") return record.lastUsed;
      const wanted = effective === "default" ? record.defaultConfigId : effective.configId;
      return record.configs.find((c) => c.id === wanted) ?? null;
    },
  };
}
