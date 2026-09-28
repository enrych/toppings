import { getFeatureReports, markRecovered, removeFeatureReport } from "@/kernel/dom/featureReports";
import type { CapabilityCacheEntry } from "@/kernel/dom/capabilities";
import { CHROME_STORAGE_LOCAL_KEY } from "@/lib/storageKeys";
import { URLS } from "@/lib/urls";
import { appSettings } from "@/app/settings";
import { servePlaylistRuntime } from "@/features/playlist-runtime/background";
import { runSchedules } from "@/features/schedules/background";
import { migrateLegacyStore } from "./migrations";

servePlaylistRuntime();
runSchedules();

// Also on every start, not only on install: on a new device, sync can deliver
// the old settings after the install event has already run. Each slice is
// migrated once, so repeating this is harmless.
void migrateLegacyStore();

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== "install" && reason !== "update") return;
  if (process.env.NODE_ENV === "production") {
    void chrome.tabs.create({ url: URLS.GREETINGS });
    void chrome.runtime.setUninstallURL(URLS.FAREWELL);
  }
  await migrateLegacyStore();
});

// The toolbar icon greys out while the master switch is off.
function setIcon(enabled: boolean): void {
  const prefix = enabled ? "" : "disabled_";
  const path = Object.fromEntries([16, 32, 48, 128].map((size) => [size, `/assets/icons/${prefix}icon${size}.png`]));
  // Firefox still ships MV2, where the toolbar button is browserAction.
  // @ts-expect-error chrome-types only declares MV3
  void (chrome.action ?? chrome.browserAction).setIcon({ path });
}
void appSettings.get().then((app) => setIcon(app.enabled));
appSettings.subscribe((app) => setIcon(app.enabled));

// A reported primitive that a content script now finds is marked recovered
// for the options page to surface; after an update adds strategies, that is
// the first YouTube page the new version loads.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  for (const [key, change] of Object.entries(changes)) {
    const entry = change.newValue as CapabilityCacheEntry | undefined;
    if (key.startsWith(CHROME_STORAGE_LOCAL_KEY.CAPABILITY_PREFIX) && entry?.status === "supported") void resolveReport(entry.primitiveId);
  }
});

async function resolveReport(primitiveId: string): Promise<void> {
  if (!(await getFeatureReports()).some((report) => report.primitiveId === primitiveId)) return;
  await markRecovered(primitiveId);
  await removeFeatureReport(primitiveId);
}
