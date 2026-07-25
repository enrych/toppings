// Reports are kept locally and never sent anywhere. Their only consumer is the
// post-update re-scan, which flags a reported primitive that now resolves so the
// options page can tell the user it started working.

import { getCurrentVersion } from "../utils/version";
import { CHROME_STORAGE_LOCAL_KEY } from "../data/core";

const REPORT_STORE_KEY = CHROME_STORAGE_LOCAL_KEY.FEATURE_REPORTS;
const RECOVERED_KEY = CHROME_STORAGE_LOCAL_KEY.FEATURE_RECOVERED;

export interface FeatureReport {
  primitiveId: string;
  reportedAt: number; // Unix timestamp (ms)
  reportedVersion: string; // Extension version at time of report
}

export interface RecoveredFeature {
  primitiveId: string;
  recoveredAt: number;
  dismissedAt: number | null;
}

export async function getFeatureReports(): Promise<FeatureReport[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(REPORT_STORE_KEY, (result) => {
      const stored = result[REPORT_STORE_KEY];
      resolve(Array.isArray(stored) ? (stored as FeatureReport[]) : []);
    });
  });
}

export async function addFeatureReport(primitiveId: string): Promise<void> {
  const reports = await getFeatureReports();
  // One report per primitive: the button stays tappable and must not stack.
  if (reports.some((r) => r.primitiveId === primitiveId)) return;

  const version = await getCurrentVersion();
  const newReport: FeatureReport = {
    primitiveId,
    reportedAt: Date.now(),
    reportedVersion: version,
  };

  await new Promise<void>((resolve) => {
    chrome.storage.local.set(
      { [REPORT_STORE_KEY]: [...reports, newReport] },
      resolve,
    );
  });
}

export async function removeFeatureReport(primitiveId: string): Promise<void> {
  const reports = await getFeatureReports();
  const filtered = reports.filter((r) => r.primitiveId !== primitiveId);
  await new Promise<void>((resolve) => {
    chrome.storage.local.set({ [REPORT_STORE_KEY]: filtered }, resolve);
  });
}

// ---------------------------------------------------------------------------
// Recovered features (set by background on update)
// ---------------------------------------------------------------------------

export async function getRecoveredFeatures(): Promise<RecoveredFeature[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(RECOVERED_KEY, (result) => {
      const stored = result[RECOVERED_KEY];
      resolve(Array.isArray(stored) ? (stored as RecoveredFeature[]) : []);
    });
  });
}

export async function markRecovered(primitiveId: string): Promise<void> {
  const existing = await getRecoveredFeatures();
  if (existing.some((r) => r.primitiveId === primitiveId && r.dismissedAt === null)) {
    return; // Already pending dismissal — don't duplicate
  }
  const entry: RecoveredFeature = {
    primitiveId,
    recoveredAt: Date.now(),
    dismissedAt: null,
  };
  const filtered = existing.filter((r) => r.primitiveId !== primitiveId);
  await new Promise<void>((resolve) => {
    chrome.storage.local.set(
      { [RECOVERED_KEY]: [...filtered, entry] },
      resolve,
    );
  });
}

export async function dismissRecovered(primitiveId: string): Promise<void> {
  const existing = await getRecoveredFeatures();
  const updated = existing.map((r) =>
    r.primitiveId === primitiveId
      ? { ...r, dismissedAt: Date.now() }
      : r,
  );
  await new Promise<void>((resolve) => {
    chrome.storage.local.set({ [RECOVERED_KEY]: updated }, resolve);
  });
}

export async function getUndismissedRecovered(): Promise<RecoveredFeature[]> {
  const all = await getRecoveredFeatures();
  return all.filter((r) => r.dismissedAt === null);
}
