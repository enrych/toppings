// A report is the user saying "this primitive shows as unavailable". Reports
// stay on the device; their only reader is the post-update check that marks
// a reported primitive as recovered once it resolves again, so the options
// page can say it started working.

import { getCurrentVersion } from "@/lib/version";
import { CHROME_STORAGE_LOCAL_KEY } from "@/lib/storageKeys";

export interface FeatureReport {
  primitiveId: string;
  reportedAt: number;
  reportedVersion: string;
}

export interface RecoveredFeature {
  primitiveId: string;
  recoveredAt: number;
  dismissedAt: number | null;
}

const REPORTS = CHROME_STORAGE_LOCAL_KEY.FEATURE_REPORTS;
const RECOVERED = CHROME_STORAGE_LOCAL_KEY.FEATURE_RECOVERED;

async function readList<T>(key: string): Promise<T[]> {
  const stored = (await chrome.storage.local.get(key))[key];
  return Array.isArray(stored) ? (stored as T[]) : [];
}

const writeList = (key: string, list: unknown[]) => chrome.storage.local.set({ [key]: list });

export const getFeatureReports = () => readList<FeatureReport>(REPORTS);

export async function addFeatureReport(primitiveId: string): Promise<void> {
  const reports = await getFeatureReports();
  if (reports.some((r) => r.primitiveId === primitiveId)) return;
  await writeList(REPORTS, [...reports, { primitiveId, reportedAt: Date.now(), reportedVersion: await getCurrentVersion() }]);
}

export async function removeFeatureReport(primitiveId: string): Promise<void> {
  await writeList(REPORTS, (await getFeatureReports()).filter((r) => r.primitiveId !== primitiveId));
}

export const getRecoveredFeatures = () => readList<RecoveredFeature>(RECOVERED);

export async function markRecovered(primitiveId: string): Promise<void> {
  const existing = await getRecoveredFeatures();
  if (existing.some((r) => r.primitiveId === primitiveId && r.dismissedAt === null)) return;
  await writeList(RECOVERED, [...existing.filter((r) => r.primitiveId !== primitiveId), { primitiveId, recoveredAt: Date.now(), dismissedAt: null }]);
}

export async function dismissRecovered(primitiveId: string): Promise<void> {
  const updated = (await getRecoveredFeatures()).map((r) => (r.primitiveId === primitiveId ? { ...r, dismissedAt: Date.now() } : r));
  await writeList(RECOVERED, updated);
}

export async function getUndismissedRecovered(): Promise<RecoveredFeature[]> {
  return (await getRecoveredFeatures()).filter((r) => r.dismissedAt === null);
}
