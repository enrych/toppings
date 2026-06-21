import { EXTENSION_VERSION } from "../../data/version";
import { CAPABILITY_CACHE_STORE, withStore } from "./indexedDb";
import type { PrimitiveResolution } from "../primitive";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CapabilityStatus = "supported" | "unsupported" | "untested";

export type PrimitiveScope =
  | "watch"
  | "home"
  | "search"
  | "shorts"
  | "playlist";

export interface CapabilityCacheEntry {
  /** Unique identifier for the primitive, e.g. "watch.sidebar". */
  primitiveId: string;
  /** YouTube page scope the primitive operates on. */
  scope: PrimitiveScope;
  /** Whether the primitive resolved successfully on this user's YouTube. */
  status: CapabilityStatus;
  /**
   * Index into the primitive's strategies array that resolved, or null if
   * the primitive is unsupported / untested.
   */
  resolvedStrategyIndex: number | null;
  /** Unix timestamp (ms) of the last resolution attempt. */
  lastCheckedAt: number;
  /**
   * Extension version at time of last check.
   * Used to invalidate stale cache entries after updates that add new
   * selector strategies — a previously-unsupported primitive may now work.
   */
  extensionVersion: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Read the cached capability status for a primitive.
 *
 * Returns `"untested"` when:
 * - No entry exists for this primitive yet.
 * - The cached entry was written by an older extension version (stale).
 *
 * Staleness check: if the stored `extensionVersion` differs from the current
 * version, we treat the entry as untested so the primitive retries resolution
 * with any newly added selector strategies.
 */
export async function getCapabilityStatus(
  primitiveId: string,
): Promise<CapabilityStatus> {
  try {
    const entry = await withStore<CapabilityCacheEntry | undefined>(
      CAPABILITY_CACHE_STORE,
      "readonly",
      (store) => store.get(primitiveId),
    );
    if (!entry) return "untested";
    if (entry.extensionVersion !== EXTENSION_VERSION) return "untested";
    return entry.status;
  } catch {
    return "untested";
  }
}

/**
 * Persist the result of a primitive resolution attempt to the cache.
 *
 * @param primitiveId - Unique primitive identifier, e.g. "watch.sidebar".
 * @param scope       - YouTube page scope for this primitive.
 * @param resolution  - The result returned by `resolveTarget`.
 */
export async function setCapabilityStatus(
  primitiveId: string,
  scope: PrimitiveScope,
  resolution: PrimitiveResolution,
): Promise<void> {
  const entry: CapabilityCacheEntry = {
    primitiveId,
    scope,
    status: resolution.resolved ? "supported" : "unsupported",
    resolvedStrategyIndex: resolution.resolved
      ? resolution.strategyIndex
      : null,
    lastCheckedAt: Date.now(),
    extensionVersion: EXTENSION_VERSION,
  };
  try {
    await withStore<IDBValidKey>(
      CAPABILITY_CACHE_STORE,
      "readwrite",
      (store) => store.put(entry),
    );
  } catch {
    // Cache write failure is non-fatal — the extension continues to work;
    // the primitive will simply re-attempt resolution on the next page load.
  }
}

/**
 * Read all cached entries — used by the options UI to render supported /
 * unsupported states for every primitive.
 */
export async function getAllCapabilityEntries(): Promise<
  CapabilityCacheEntry[]
> {
  try {
    return await withStore<CapabilityCacheEntry[]>(
      CAPABILITY_CACHE_STORE,
      "readonly",
      (store) => store.getAll(),
    );
  } catch {
    return [];
  }
}

/**
 * Clear all capability cache entries, forcing every primitive to re-attempt
 * DOM resolution on the next page load.
 *
 * Exposed to the options UI as "Re-scan / Refresh capabilities".
 */
export async function clearCapabilityCache(): Promise<void> {
  try {
    await withStore<undefined>(CAPABILITY_CACHE_STORE, "readwrite", (store) =>
      store.clear(),
    );
  } catch {
    // Non-fatal.
  }
}
