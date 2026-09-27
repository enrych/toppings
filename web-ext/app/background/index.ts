import { syncStorageWithDefaults } from "@/lib/store";
import { getFeatureReports, markRecovered, removeFeatureReport } from "@/kernel/dom/featureReports";
import { getCapabilityStatus } from "@/kernel/dom/capabilities";
import { URLS } from "@/lib/urls";
import { servePlaylistRuntime } from "@/features/playlist-runtime/background";
import { openOptions } from "@/features/profiles/messages";
import { migrateLegacyStore } from "./migrations";

servePlaylistRuntime();
openOptions.handle(() => chrome.runtime.openOptionsPage());

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== "install" && reason !== "update") return;
  if (process.env.NODE_ENV === "production") {
    void chrome.tabs.create({ url: URLS.GREETINGS });
    void chrome.runtime.setUninstallURL(URLS.FAREWELL);
  }
  // Before the resync, which drops legacy keys the slices still read.
  await migrateLegacyStore();
  void syncStorageWithDefaults();
  if (reason === "update") void checkRecoveredFeatures();
});

// An update can add selector strategies that fix a primitive the user reported,
// so anything now resolving is marked recovered for the options page to surface.
async function checkRecoveredFeatures(): Promise<void> {
  for (const report of await getFeatureReports()) {
    if ((await getCapabilityStatus(report.primitiveId)) !== "supported") continue;
    await markRecovered(report.primitiveId);
    await removeFeatureReport(report.primitiveId);
  }
}
