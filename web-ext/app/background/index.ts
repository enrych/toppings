import { syncStorageWithDefaults } from "./store";
import { getActiveProfile } from "../../utils/storage/profileStore";
import {
  getFeatureReports,
  markRecovered,
  removeFeatureReport,
} from "../../utils/storage/featureReports";
import { getCapabilityStatus } from "../../utils/storage/capabilityCache";
import { getContext } from "./context";
import { dispatchContext } from "./utils/dispatchContext";
import { URLS } from "../../data/urls";
import {
  EXTENSION_INSTALL_REASON,
  EXTENSION_MESSAGE_BODY,
  EXTENSION_MESSAGE_EVENT,
  EXTENSION_MESSAGE_TYPE,
  NODE_ENV,
} from "../../data/extension.data";

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
    // Touch the profile store so it initialises with defaults for new
    // installs and returns gracefully for existing users (no-op on update).
    void getActiveProfile();
    // On update: check whether any reported-unsupported primitives are now
    // resolved in the capability cache (user may have re-scanned on prior run).
    if (reason === EXTENSION_INSTALL_REASON.UPDATE) {
      void checkRecoveredFeatures();
    }
  }
}

/**
 * On extension update: compare reported-unsupported features against the
 * capability cache. If any were "unsupported" when reported but are now
 * "supported", mark them as recovered so the options page can show a banner.
 */
async function checkRecoveredFeatures(): Promise<void> {
  const reports = await getFeatureReports();
  for (const report of reports) {
    const status = await getCapabilityStatus(report.primitiveId);
    if (status === "supported") {
      await markRecovered(report.primitiveId);
      // Remove the report — the user has been notified.
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
