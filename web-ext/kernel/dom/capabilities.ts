import { EXTENSION_VERSION } from "@/lib/version";
import { CHROME_STORAGE_LOCAL_KEY } from "@/lib/storageKeys";
import type { PrimitiveResolution } from "./resolve";

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

// Kept in extension storage, not IndexedDB: content scripts write the cache,
// and their IndexedDB belongs to youtube.com, out of reach of the options page
// and background that read it. One key per primitive, so features recording
// at the same moment never overwrite each other.
const PREFIX = CHROME_STORAGE_LOCAL_KEY.CAPABILITY_PREFIX;

export async function getCapabilityStatus(primitiveId: string): Promise<CapabilityStatus> {
  const key = PREFIX + primitiveId;
  const entry = (await chrome.storage.local.get(key))[key] as CapabilityCacheEntry | undefined;
  if (!entry || entry.extensionVersion !== EXTENSION_VERSION) return "untested";
  return entry.status;
}

export async function setCapabilityStatus(primitiveId: string, scope: PrimitiveScope, resolution: PrimitiveResolution): Promise<void> {
  const entry: CapabilityCacheEntry = {
    primitiveId,
    scope,
    status: resolution.resolved ? "supported" : "unsupported",
    resolvedStrategyIndex: resolution.resolved ? resolution.strategyIndex : null,
    lastCheckedAt: Date.now(),
    extensionVersion: EXTENSION_VERSION,
  };
  // Swallowed: a content script outliving an extension reload can no longer
  // reach storage, and a lost entry only costs a re-check on the next page.
  await chrome.storage.local.set({ [PREFIX + primitiveId]: entry }).catch(() => {});
}

async function capabilityKeys(): Promise<string[]> {
  return Object.keys(await chrome.storage.local.get()).filter((key) => key.startsWith(PREFIX));
}

export async function getAllCapabilityEntries(): Promise<CapabilityCacheEntry[]> {
  const keys = await capabilityKeys();
  if (keys.length === 0) return [];
  return Object.values(await chrome.storage.local.get(keys)) as CapabilityCacheEntry[];
}

export async function clearCapabilityCache(): Promise<void> {
  const keys = await capabilityKeys();
  if (keys.length) await chrome.storage.local.remove(keys);
}
