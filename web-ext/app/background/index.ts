import { syncStorageWithDefaults } from "@/lib/store";
import { getActiveProfile } from "@/features/profiles/profileStore";
import {
  getFeatureReports,
  markRecovered,
  removeFeatureReport,
} from "@/features/profiles/featureReports";
import { getCapabilityStatus } from "@/kernel/dom/capabilities";
import { getContext } from "./context";
import { URLS } from "@/lib/urls";
import { EXTENSION_MESSAGE_EVENT, EXTENSION_MESSAGE_TYPE } from "@/lib/protocol";
import { servePlaylistRuntime } from "@/features/playlist-runtime/background";
import { migrateLegacyStore } from "./migrations";

servePlaylistRuntime();

chrome.runtime.onInstalled.addListener(onInitialize);
chrome.runtime.onMessage.addListener(onConnected);
chrome.webNavigation.onHistoryStateUpdated.addListener(onWebNavigation);

type InitializeDetails = Parameters<
  Parameters<typeof chrome.runtime.onInstalled.addListener>[0]
>[0];
async function onInitialize({ reason }: InitializeDetails): Promise<void> {
  if (reason === "install" || reason === "update") {
    if (process.env.NODE_ENV === "production") {
      void chrome.tabs.create({ url: URLS.GREETINGS });
      void chrome.runtime.setUninstallURL(URLS.FAREWELL);
    }
    // Before the resync, which drops legacy keys the slices still read.
    await migrateLegacyStore();
    void syncStorageWithDefaults();
    // Read purely for its side effect: this is what writes the default profile
    // store on a fresh install.
    void getActiveProfile();
    if (reason === "update") {
      void checkRecoveredFeatures();
    }
  }
}

// An update can add selector strategies that fix a primitive the user reported,
// so anything now resolving is marked recovered for the options page to surface.
async function checkRecoveredFeatures(): Promise<void> {
  const reports = await getFeatureReports();
  for (const report of reports) {
    const status = await getCapabilityStatus(report.primitiveId);
    if (status === "supported") {
      await markRecovered(report.primitiveId);
      await removeFeatureReport(report.primitiveId);
    }
  }
}

type WebNavigationDetails = Parameters<
  Parameters<typeof chrome.webNavigation.onCompleted.addListener>[0]
>[0];
async function onWebNavigation(details: WebNavigationDetails) {
  const tabId = details.tabId;

  const ctx = await getContext(details.url);
  if (!ctx?.store.isExtensionEnabled) return;
  await chrome.tabs.sendMessage(
    tabId,
    JSON.stringify({ type: EXTENSION_MESSAGE_TYPE.CONTEXT, payload: ctx }),
  );
}

function onConnected(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void,
) {
  if (typeof message !== "string") return false;
  (async () => {
    const parsed = JSON.parse(message) as Record<string, unknown>;
    const { type, payload } = parsed;
    if (type !== EXTENSION_MESSAGE_TYPE.EVENT) return;

    const event = payload;
    if (event !== EXTENSION_MESSAGE_EVENT.CONNECTED) return;

    const tabId = sender.tab?.id;
    if (!tabId) return;

    const url = sender.url;
    if (!url) return;

    const ctx = await getContext(url);
    if (!ctx?.store.isExtensionEnabled) return;

    sendResponse(
      JSON.stringify({ type: EXTENSION_MESSAGE_TYPE.CONTEXT, payload: ctx }),
    );
  })();

  return true;
}
