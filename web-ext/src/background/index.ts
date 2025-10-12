import { DEFAULT_STORE } from "./store";
import { getContext } from "./context";
import { dispatchContext } from "./utils/dispatchContext";
import {
  EVENT_TYPE,
  INSTALL_REASON,
  INSTALL_URL,
  MESSAGE_TYPE,
  NODE_ENV,
  UNINSTALL_URL,
} from "../constants/global.constants";

// Handle Events
chrome.runtime.onInstalled.addListener(onInitialize);
chrome.runtime.onMessage.addListener(onConnected);
chrome.webNavigation.onHistoryStateUpdated.addListener(onWebNavigation);

type InitializeDetails = Parameters<
  Parameters<typeof chrome.runtime.onInstalled.addListener>[0]
>[0];
function onInitialize({ reason }: InitializeDetails): void {
  if (reason === INSTALL_REASON.INSTALL || reason === INSTALL_REASON.UPDATE) {
    if (process.env.NODE_ENV === NODE_ENV.PRODUCTION) {
      void chrome.tabs.create({ url: INSTALL_URL });
      void chrome.runtime.setUninstallURL(UNINSTALL_URL);
    }
    void chrome.storage.sync.set(DEFAULT_STORE);
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
    // This function handles the initial handshake between the content script and the background script.
    const { type, payload } = JSON.parse(message);
    if (type !== MESSAGE_TYPE.EVENT) return;

    const event = payload;
    if (event !== EVENT_TYPE.CONNECTED) return;

    const tabId = sender.tab?.id;
    if (!tabId) return;

    const url = sender.url;
    if (!url) return;

    const ctx = await getContext(url);
    if (!ctx?.store.isExtensionEnabled) return;

    sendResponse(JSON.stringify({ type: "context", payload: ctx }));
  })();

  // Return true to indicate that sendResponse will be called asynchronously
  return true;
}
