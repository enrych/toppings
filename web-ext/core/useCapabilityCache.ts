import { useEffect, useState } from "react";
import {
  getAllCapabilityEntries,
  clearCapabilityCache,
  type CapabilityCacheEntry,
  type CapabilityStatus,
} from "../core/capabilityCache";

export type CapabilityMap = Map<string, CapabilityCacheEntry>;

interface UseCapabilityCacheResult {
  capabilities: CapabilityMap;
  isLoading: boolean;
  getStatus: (primitiveId: string) => CapabilityStatus;
  rescan: () => Promise<void>;
}

// rescan only clears the cache — the actual re-probe happens on the next
// YouTube navigation, so the UI cannot show fresh results immediately.
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
