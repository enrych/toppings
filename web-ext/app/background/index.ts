import { syncStorageWithDefaults } from "./store";
import { getActiveProfile } from "../../core/profileStore";
import {
  getFeatureReports,
  markRecovered,
  removeFeatureReport,
} from "../../core/featureReports";
import { getCapabilityStatus } from "../../core/capabilityCache";
import { getContext } from "./context";
import { dispatchContext } from "./utils/dispatchContext";
import { URLS } from "../../data/urls";
import {
  EXTENSION_INSTALL_REASON,
  EXTENSION_MESSAGE_BODY,
  EXTENSION_MESSAGE_EVENT,
  EXTENSION_MESSAGE_TYPE,
  NODE_ENV,
} from "../../data/core";

chrome.runtime.onInstalled.addListener(onInitialize);
chrome.runtime.onMessage.addListener(onConnected);
chrome.webNavigation.onHistoryStateUpdated.addListener(onWebNavigation);

type InitializeDetails = Parameters<
  Parameters<typeof chrome.runtime.onInstalled.addListener>[0]
>[0];
function onInitialize({ reason }: InitializeDetails): void {
  if (
    reason === EXTENSION_INSTALL_REASON.INSTALL ||
    reason === EXTENSION_INSTALL_REASON.UPDATE
  ) {
    if (process.env.NODE_ENV === NODE_ENV.PRODUCTION) {
      void chrome.tabs.create({ url: URLS.GREETINGS });
      void chrome.runtime.setUninstallURL(URLS.FAREWELL);
    }
    void syncStorageWithDefaults();
    // Read purely for its side effect: this is what writes the default profile
    // store on a fresh install.
    void getActiveProfile();
    if (reason === EXTENSION_INSTALL_REASON.UPDATE) {
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
  await dispatchContext(tabId, ctx);
}

function onConnected(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void,
) {
  (async () => {
    const parsed = JSON.parse(message) as Record<string, unknown>;
    const type = parsed[EXTENSION_MESSAGE_BODY.TYPE];
    const payload = parsed[EXTENSION_MESSAGE_BODY.PAYLOAD];
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
      JSON.stringify({
        [EXTENSION_MESSAGE_BODY.TYPE]: EXTENSION_MESSAGE_TYPE.CONTEXT,
        [EXTENSION_MESSAGE_BODY.PAYLOAD]: ctx,
      }),
    );
  })();

  return true;
}
