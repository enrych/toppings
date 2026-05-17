import {
  ERROR,
  EXTENSION_VERSION,
  RELEASE_ITEM_KIND,
  RELEASE_VERSION,
  RELEASES,
  type ReleaseEntry,
  type ReleaseItem,
} from "@toppings/constants";
import { interpolateTemplate } from "./string";
import { isNull } from "./validation";

export function getLatestRelease(): ReleaseEntry | undefined {
  return RELEASES.find((r) => r.version !== RELEASE_VERSION.WIP);
}

export function getRelease(version: string): ReleaseEntry | undefined {
  return RELEASES.find((r) => r.version === version);
}

export function getCurrentRelease(): ReleaseEntry {
  const entry = getRelease(EXTENSION_VERSION);
  if (isNull(entry)) {
    throw new Error(
      interpolateTemplate(ERROR.MISSING_RELEASE_ENTRY, {
        version: EXTENSION_VERSION,
      }),
    );
  }
  return entry;
}

export function userFacingItems(items: ReleaseItem[]): ReleaseItem[] {
  return items.filter((i) => i.kind !== RELEASE_ITEM_KIND.INTERNAL);
}
