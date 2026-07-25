import { EXTENSION_VERSION } from "../data/version";
import { withStore } from "../utils/indexedDb";
import { BROWSER_STORAGE_IDB_STORE } from "../data/core";
import type { PrimitiveResolution } from "../utils/primitive";

export type CapabilityStatus = "supported" | "unsupported" | "untested";

export type PrimitiveScope =
  | "watch"
  | "home"
  | "search"
  | "shorts"
  | "playlist";

export interface CapabilityCacheEntry {
  primitiveId: string; // e.g. "watch.sidebar"
  scope: PrimitiveScope;
  status: CapabilityStatus;
  resolvedStrategyIndex: number | null;
  lastCheckedAt: number; // unix ms
  // Stamped so an upgrade that adds selector strategies invalidates the entry:
  // a primitive recorded as unsupported may resolve under the new version.
  extensionVersion: string;
}

export async function getCapabilityStatus(
  primitiveId: string,
): Promise<CapabilityStatus> {
  try {
    const entry = await withStore<CapabilityCacheEntry | undefined>(
      BROWSER_STORAGE_IDB_STORE.CAPABILITY_CACHE,
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
      BROWSER_STORAGE_IDB_STORE.CAPABILITY_CACHE,
      "readwrite",
      (store) => store.put(entry),
    );
  } catch {
    // Swallowed: the cache is an optimisation, and a failed write only costs a
    // re-resolution on the next page load.
  }
}

export async function getAllCapabilityEntries(): Promise<
  CapabilityCacheEntry[]
> {
  try {
    return await withStore<CapabilityCacheEntry[]>(
      BROWSER_STORAGE_IDB_STORE.CAPABILITY_CACHE,
      "readonly",
      (store) => store.getAll(),
    );
  } catch {
    return [];
  }
}

export async function clearCapabilityCache(): Promise<void> {
  try {
    await withStore<undefined>(BROWSER_STORAGE_IDB_STORE.CAPABILITY_CACHE, "readwrite", (store) =>
      store.clear(),
    );
  } catch {
    // Swallowed for the same reason as setCapabilityStatus.
  }
}
