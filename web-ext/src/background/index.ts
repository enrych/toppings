import { syncStorageWithDefaults } from "./store";
import { getContext } from "./context";
import { dispatchContext } from "./utils/dispatchContext";
import {
  INSTALL_REASON,
  INSTALL_URL,
  MESSAGE_EVENT,
  MESSAGE_FIELD,
  MESSAGE_TYPE,
  NODE_ENV,
} from "@toppings/constants";

chrome.runtime.onInstalled.addListener(onInitialize);
chrome.runtime.onMessage.addListener(onConnected);
chrome.webNavigation.onHistoryStateUpdated.addListener(onWebNavigation);

type InitializeDetails = Parameters<
  Parameters<typeof chrome.runtime.onInstalled.addListener>[0]
>[0];
function onInitialize({ reason }: InitializeDetails): void {
  if (
    reason === INSTALL_REASON.INSTALL ||
    reason === INSTALL_REASON.UPDATE
  ) {
    if (process.env.NODE_ENV === NODE_ENV.PRODUCTION) {
      void chrome.tabs.create({ url: INSTALL_URL.GREETINGS });
      void chrome.runtime.setUninstallURL(INSTALL_URL.FAREWELL);
    }
    void syncStorageWithDefaults();
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
    const type = parsed[MESSAGE_FIELD.TYPE];
    const payload = parsed[MESSAGE_FIELD.PAYLOAD];
    if (type !== MESSAGE_TYPE.EVENT) return;

    const event = payload;
    if (event !== MESSAGE_EVENT.CONNECTED) return;

    const tabId = sender.tab?.id;
    if (!tabId) return;

    const url = sender.url;
    if (!url) return;

    const ctx = await getContext(url);
    if (!ctx?.store.isExtensionEnabled) return;

    sendResponse(
      JSON.stringify({
        [MESSAGE_FIELD.TYPE]: MESSAGE_TYPE.CONTEXT,
        [MESSAGE_FIELD.PAYLOAD]: ctx,
      }),
    );
  })();

  return true;
}
