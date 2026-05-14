import type {
  ExtensionFeatureDefinition,
  ExtensionWhatsNewEntry,
} from "toppings-constants";
import {
  EXTENSION_FEATURE_DEFINITIONS,
  EXTENSION_WHATS_NEW,
  FEATURE_STATUS,
} from "toppings-constants";
import type { IconName } from "./components/primitives/Icon";

export type FeatureStatus = ExtensionFeatureDefinition["status"];

export interface FeatureEntry extends Omit<ExtensionFeatureDefinition, "icon"> {
  icon: IconName;
}

export const FEATURES = EXTENSION_FEATURE_DEFINITIONS as FeatureEntry[];

export type WhatsNewEntry = ExtensionWhatsNewEntry;

export const WHATS_NEW = EXTENSION_WHATS_NEW;

/** Look up a feature by id. Returns undefined if not found. */
export function getFeature(id: string): FeatureEntry | undefined {
  return FEATURES.find((f) => f.id === id);
}

/** Return all features marked as new — useful for "What's new" cards. */
export function getNewFeatures(): FeatureEntry[] {
  return FEATURES.filter((f) => f.status === FEATURE_STATUS.NEW);
}
