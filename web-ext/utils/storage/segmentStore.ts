import {
  SEGMENT_DATA_STORE,
  LOOP_SEGMENT_STORE,
  withStore,
} from "./indexedDb";
import type { VideoSegmentData, SegmentConfig, SegmentAutoLoadPin } from "../segments/types";
import { createFreshConfig } from "../segments/factories";

// ---------------------------------------------------------------------------
// Legacy loop segment type (for migration only)
// ---------------------------------------------------------------------------
interface LegacyLoopSegment {
  videoId: string;
  startTime: number;
  endTime: number;
  savedAt: number;
}

// ---------------------------------------------------------------------------
// Migration helper
// ---------------------------------------------------------------------------

/**
 * Attempt to migrate a legacy `SavedLoopSegment` record into `VideoSegmentData`.
 * Returns migrated data or null if no legacy record exists.
 */
async function migrateLegacyLoopSegment(
  videoId: string,
): Promise<VideoSegmentData | null> {
  let legacy: LegacyLoopSegment | null = null;
  try {
    legacy = await withStore<LegacyLoopSegment | undefined>(
      LOOP_SEGMENT_STORE,
      "readonly",
      (store) => store.get(videoId),
    ).then((r) => r ?? null);
  } catch {
    return null;
  }
  if (!legacy) return null;

  // Convert to a single-segment config with infinite loop.
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

  // Persist migrated data so we don't re-migrate on next load.
  await withStore(SEGMENT_DATA_STORE, "readwrite", (store) =>
    store.put(data),
  );
  return data;
}

// ---------------------------------------------------------------------------
// Public CRUD API
// ---------------------------------------------------------------------------

/**
 * Retrieve all segment data for a video.
 * On first access, transparently migrates any legacy loop segment record.
 */
export async function getVideoSegmentData(
  videoId: string,
): Promise<VideoSegmentData | null> {
  const existing = await withStore<VideoSegmentData | undefined>(
    SEGMENT_DATA_STORE,
    "readonly",
    (store) => store.get(videoId),
  ).then((r) => r ?? null);

  if (existing) return existing;

  // No new-format record — try to migrate from old loop segment store.
  return migrateLegacyLoopSegment(videoId);
}

/** Persist (upsert) the full data record for a video. */
export async function saveVideoSegmentData(
  data: VideoSegmentData,
): Promise<void> {
  await withStore(SEGMENT_DATA_STORE, "readwrite", (store) =>
    store.put({ ...data, savedAt: Date.now() }),
  );
}

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

/** Get the last-used (volatile) config for a video. */
export async function getLastUsed(
  videoId: string,
): Promise<SegmentConfig | null> {
  const data = await getVideoSegmentData(videoId);
  return data?.lastUsed ?? null;
}

/**
 * Update the last-used slot. Creates a new VideoSegmentData record if needed.
 * Pass `null` to clear the last-used slot.
 */
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

/** Get all explicitly saved named configs for a video. */
export async function getSavedConfigs(
  videoId: string,
): Promise<SegmentConfig[]> {
  const data = await getVideoSegmentData(videoId);
  return data?.configs ?? [];
}

/**
 * Save (upsert) a named config. If a config with the same ID already exists,
 * it is replaced. Otherwise it is appended.
 */
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

/** Delete a named config by ID. Clears defaultConfigId if it pointed to it. */
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

/** Mark one of the saved configs as the "default" slot. Pass null to unset. */
export async function setDefaultConfig(
  videoId: string,
  configId: string | null,
): Promise<void> {
  const data = await getVideoSegmentData(videoId);
  if (!data) return;
  await saveVideoSegmentData({ ...data, defaultConfigId: configId });
}

/** Get the config designated as the default slot, or null. */
export async function getDefaultConfig(
  videoId: string,
): Promise<SegmentConfig | null> {
  const data = await getVideoSegmentData(videoId);
  if (!data || !data.defaultConfigId) return null;
  return data.configs.find((c) => c.id === data.defaultConfigId) ?? null;
}

/**
 * Determine which config (if any) to auto-load on page open.
 *
 * Resolution order:
 *   1. Per-video `autoLoadPin` (stored in VideoSegmentData) — overrides global
 *   2. `globalAutoLoad` argument — from the user's watch-page preference
 *
 * Returns `null` when the effective setting is "off" or no matching config
 * exists (caller should keep segments disabled rather than creating a fresh one).
 */
export async function getAutoloadConfig(
  videoId: string,
  _videoDuration: number,
  globalAutoLoad: "off" | "last-used" | "default" = "off",
): Promise<SegmentConfig | null> {
  const data = await getVideoSegmentData(videoId);

  // Effective setting: per-video pin wins over global.
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

/** Set or clear the per-video auto-load pin. */
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

/** Get the current per-video auto-load pin. */
export async function getAutoLoadPin(
  videoId: string,
): Promise<SegmentAutoLoadPin> {
  const data = await getVideoSegmentData(videoId);
  return data?.autoLoadPin ?? null;
}
