import { EXTENSION_VERSION } from "@toppings/constants";
import {
  RELEASE_ITEM_KIND,
  RELEASE_VERSION,
  RELEASES,
  type ReleaseEntry,
  type ReleaseItem,
} from "./releases.data";

export function getLatestRelease(): ReleaseEntry | undefined {
  return RELEASES.find((r) => r.version !== RELEASE_VERSION.WIP);
}

export function getRelease(version: string): ReleaseEntry | undefined {
  return RELEASES.find((r) => r.version === version);
}

export function getCurrentRelease(): ReleaseEntry {
  const entry = getRelease(EXTENSION_VERSION);
  if (!entry) {
    throw new Error(
      `No RELEASES entry for version "${EXTENSION_VERSION}". Update website/lib/releases.data.ts.`,
    );
  }
  return entry;
}

export function userFacingItems(items: ReleaseItem[]): ReleaseItem[] {
  return items.filter((i) => i.kind !== RELEASE_ITEM_KIND.INTERNAL);
}
