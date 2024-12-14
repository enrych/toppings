import { DEFAULT_STORE } from "./store";
import { getContext, dispatchContext } from "./context";

const INSTALL_URL = "https://enrych.github.io/toppings/greetings";
const UNINSTALL_URL = "https://enrych.github.io/toppings/farewell";

// Handle Events
chrome.runtime.onInstalled.addListener(onInitialize);
chrome.runtime.onMessage.addListener(onConnected);
chrome.webNavigation.onHistoryStateUpdated.addListener(onWebNavigation);

type InitializeDetails = Parameters<
  Parameters<typeof chrome.runtime.onInstalled.addListener>[0]
>[0];
function onInitialize({ reason }: InitializeDetails): void {
  if (reason === "install" || reason === "update") {
    if (process.env.NODE_ENV === "production") {
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
  const isExtensionEnabled = ctx.store.globalSettings.isExtensionEnabled;

  if (!ctx.isSupported || !isExtensionEnabled) return;
  await dispatchContext(tabId, ctx);
}

function onConnected(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void,
) {
  (async () => {
    const event = message.event;
    if (event !== "connected") return;

    const tabId = sender.tab?.id;
    if (!tabId) return;

    const url = sender.url;
    if (!url) return;

    const ctx = await getContext(url);
    const isExtensionEnabled = ctx.store.globalSettings.isExtensionEnabled;

    if (!ctx.isSupported || !isExtensionEnabled) return;
    await dispatchContext(tabId, ctx);

    sendResponse(true);
  })().catch((err) => {
    console.error("Error in onConnected:", err);
    sendResponse(false); // or handle error as needed
  });

  // Return true to indicate that sendResponse will be called asynchronously
  return true;
}
