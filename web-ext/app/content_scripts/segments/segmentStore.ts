import { withStore } from "../../../utils/indexedDb";
import { BROWSER_STORAGE_IDB_STORE } from "../../../data/core";
import type { VideoSegmentData, SegmentConfig, SegmentAutoLoadPin } from "./types";
import { createFreshConfig } from "./factories";

// Retained only to read records written before segments replaced loop segments.
interface LegacyLoopSegment {
  videoId: string;
  startTime: number;
  endTime: number;
  savedAt: number;
}

async function migrateLegacyLoopSegment(
  videoId: string,
): Promise<VideoSegmentData | null> {
  let legacy: LegacyLoopSegment | null = null;
  try {
    legacy = await withStore<LegacyLoopSegment | undefined>(
      BROWSER_STORAGE_IDB_STORE.LOOP_SEGMENT,
      "readonly",
      (store) => store.get(videoId),
    ).then((r) => r ?? null);
  } catch {
    return null;
  }
  if (!legacy) return null;

  const segId = crypto.randomUUID();
  const stepId = crypto.randomUUID();
  const config: SegmentConfig = {
    id: crypto.randomUUID(),
    label: "Restored Loop",
    segments: [
      { id: segId, startTime: legacy.startTime, endTime: legacy.endTime },
    ],
    sequence: [
      {
        id: stepId,
        segmentIds: [segId],
        count: 0,
        playbackRate: null,
        perIterationRates: [],
      },
    ],
    shortcutKey: "",
    createdAt: legacy.savedAt,
    updatedAt: legacy.savedAt,
  };

  const data: VideoSegmentData = {
    videoId,
    lastUsed: config,
    configs: [],
    defaultConfigId: null,
    savedAt: legacy.savedAt,
  };

  // Written back immediately so the legacy record is converted once, not on every load.
  await withStore(BROWSER_STORAGE_IDB_STORE.SEGMENT_DATA, "readwrite", (store) =>
    store.put(data),
  );
  return data;
}

// Reading also migrates: a video last touched by an older version has no
// new-format record until this runs.
export async function getVideoSegmentData(
  videoId: string,
): Promise<VideoSegmentData | null> {
  const existing = await withStore<VideoSegmentData | undefined>(
    BROWSER_STORAGE_IDB_STORE.SEGMENT_DATA,
    "readonly",
    (store) => store.get(videoId),
  ).then((r) => r ?? null);

  if (existing) return existing;

  return migrateLegacyLoopSegment(videoId);
}

export async function saveVideoSegmentData(
  data: VideoSegmentData,
): Promise<void> {
  await withStore(BROWSER_STORAGE_IDB_STORE.SEGMENT_DATA, "readwrite", (store) =>
    store.put({ ...data, savedAt: Date.now() }),
  );
}

export async function getLastUsed(
  videoId: string,
): Promise<SegmentConfig | null> {
  const data = await getVideoSegmentData(videoId);
  return data?.lastUsed ?? null;
}

export async function setLastUsed(
  videoId: string,
  config: SegmentConfig | null,
): Promise<void> {
  const data = (await getVideoSegmentData(videoId)) ?? {
    videoId,
    lastUsed: null,
    configs: [],
    defaultConfigId: null,
    savedAt: 0,
  };
  await saveVideoSegmentData({ ...data, lastUsed: config });
}

export async function getSavedConfigs(
  videoId: string,
): Promise<SegmentConfig[]> {
  const data = await getVideoSegmentData(videoId);
  return data?.configs ?? [];
}

export async function saveNamedConfig(
  videoId: string,
  config: SegmentConfig,
): Promise<void> {
  const data = (await getVideoSegmentData(videoId)) ?? {
    videoId,
    lastUsed: null,
    configs: [],
    defaultConfigId: null,
    savedAt: 0,
  };
  const idx = data.configs.findIndex((c) => c.id === config.id);
  const newConfigs =
    idx >= 0
      ? data.configs.map((c) => (c.id === config.id ? config : c))
      : [...data.configs, config];
  await saveVideoSegmentData({ ...data, configs: newConfigs });
}

export async function deleteNamedConfig(
  videoId: string,
  configId: string,
): Promise<void> {
  const data = await getVideoSegmentData(videoId);
  if (!data) return;
  const newConfigs = data.configs.filter((c) => c.id !== configId);
  const newDefaultId =
    data.defaultConfigId === configId ? null : data.defaultConfigId;
  await saveVideoSegmentData({
    ...data,
    configs: newConfigs,
    defaultConfigId: newDefaultId,
  });
}

export async function setDefaultConfig(
  videoId: string,
  configId: string | null,
): Promise<void> {
  const data = await getVideoSegmentData(videoId);
  if (!data) return;
  await saveVideoSegmentData({ ...data, defaultConfigId: configId });
}

export async function getDefaultConfig(
  videoId: string,
): Promise<SegmentConfig | null> {
  const data = await getVideoSegmentData(videoId);
  if (!data || !data.defaultConfigId) return null;
  return data.configs.find((c) => c.id === data.defaultConfigId) ?? null;
}

// A per-video pin outranks the global preference. Returning null means "leave
// segments off" — callers must not substitute a fresh config for it.
export async function getAutoloadConfig(
  videoId: string,
  _videoDuration: number,
  globalAutoLoad: "off" | "last-used" | "default" = "off",
): Promise<SegmentConfig | null> {
  const data = await getVideoSegmentData(videoId);

  const pin: SegmentAutoLoadPin = data?.autoLoadPin ?? null;
  const effective: "off" | "last-used" | "default" | { configId: string } =
    pin !== null ? pin : globalAutoLoad;

  if (effective === "off") return null;

  if (effective === "last-used") return data?.lastUsed ?? null;

  if (effective === "default") {
    return (
      data?.configs.find((c) => c.id === data.defaultConfigId) ?? null
    );
  }

  if (typeof effective === "object" && "configId" in effective) {
    return data?.configs.find((c) => c.id === effective.configId) ?? null;
  }

  return null;
}

export async function setAutoLoadPin(
  videoId: string,
  pin: SegmentAutoLoadPin,
): Promise<void> {
  const data = (await getVideoSegmentData(videoId)) ?? {
    videoId,
    lastUsed: null,
    configs: [],
    defaultConfigId: null,
    savedAt: 0,
  };
  await saveVideoSegmentData({ ...data, autoLoadPin: pin });
}

export async function getAutoLoadPin(
  videoId: string,
): Promise<SegmentAutoLoadPin> {
  const data = await getVideoSegmentData(videoId);
  return data?.autoLoadPin ?? null;
}
