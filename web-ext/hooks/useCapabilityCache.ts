import { useEffect, useState } from "react";
import {
  getAllCapabilityEntries,
  clearCapabilityCache,
  type CapabilityCacheEntry,
  type CapabilityStatus,
} from "../utils/storage/capabilityCache";

export type CapabilityMap = Map<string, CapabilityCacheEntry>;

interface UseCapabilityCacheResult {
  capabilities: CapabilityMap;
  isLoading: boolean;
  getStatus: (primitiveId: string) => CapabilityStatus;
  rescan: () => Promise<void>;
}

/**
 * Read the capability cache and expose per-primitive support status to the
 * options UI. Provides a `rescan` function that clears the cache and triggers
 * a re-read (the actual re-probe happens on the next YouTube page navigation).
 */
export function useCapabilityCache(): UseCapabilityCacheResult {
  const [capabilities, setCapabilities] = useState<CapabilityMap>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const entries = await getAllCapabilityEntries();
    setCapabilities(new Map(entries.map((e) => [e.primitiveId, e])));
    setIsLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const getStatus = (primitiveId: string): CapabilityStatus => {
    return capabilities.get(primitiveId)?.status ?? "untested";
  };

  const rescan = async () => {
    await clearCapabilityCache();
    await load();
  };

  return { capabilities, isLoading, getStatus, rescan };
}
