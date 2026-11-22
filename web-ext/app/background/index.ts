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

chrome.runtime.onInstalled.addListener(async ({ reason, previousVersion }) => {
  if (reason !== "install" && reason !== "update") return;
  if (process.env.NODE_ENV === "production") {
    if (reason === "install") void chrome.tabs.create({ url: URLS.GREETINGS });
    void chrome.runtime.setUninstallURL(URLS.FAREWELL);
  }
  await migrateLegacyStore();
  // A 3.x content script does not know the takeover handshake, and Chrome
  // leaves it running, so a second copy beside it would fire every shortcut
  // twice. Those tabs get Toppings back when they reload.
  const fromBeforeTakeover = previousVersion !== undefined && Number(previousVersion.split(".")[0]) < 4;
  if (!fromBeforeTakeover) await startInOpenTabs();
});

// Tabs open across an install or update have no working Toppings until they
// reload, since the old content script is cut off; this starts the new one.
async function startInOpenTabs(): Promise<void> {
  for (const tab of await chrome.tabs.query({ url: "https://www.youtube.com/*" })) {
    if (tab.id === undefined) continue;
    // A discarded or still-loading tab refuses; it gets the script when it loads.
    void chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["/content.js"] }).catch(() => {});
  }
}

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
