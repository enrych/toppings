import { getFeatureReports, markRecovered, removeFeatureReport } from "@/kernel/dom/featureReports";
import { getCapabilityStatus } from "@/kernel/dom/capabilities";
import { URLS } from "@/lib/urls";
import { appSettings } from "@/app/settings";
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
  await migrateLegacyStore();
  if (reason === "update") void checkRecoveredFeatures();
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

// An update can add selector strategies that fix a primitive the user reported,
// so anything now resolving is marked recovered for the options page to surface.
async function checkRecoveredFeatures(): Promise<void> {
  for (const report of await getFeatureReports()) {
    if ((await getCapabilityStatus(report.primitiveId)) !== "supported") continue;
    await markRecovered(report.primitiveId);
    await removeFeatureReport(report.primitiveId);
  }
}
