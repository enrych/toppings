import { DEFAULT_STORE, getStorage } from "./store";
import { type IContext, getContext, dispatchContext } from "./context";

const INSTALL_URL = "https://enrych.github.io/toppings/greetings";
const UNINSTALL_URL = "https://enrych.github.io/toppings/farewell";

chrome.runtime.onInstalled.addListener(
  ({ reason }: { reason: chrome.runtime.OnInstalledReason }): void => {
    if (reason === "install" || reason === "update") {
      if (process.env.NODE_ENV === "production") {
        void chrome.tabs.create({ url: INSTALL_URL });
      }
      if (process.env.NODE_ENV === "production") {
        void chrome.runtime.setUninstallURL(UNINSTALL_URL);
      }

      void chrome.storage.sync.set(DEFAULT_STORE);
    }
  },
);

chrome.webNavigation.onCompleted.addListener(async (details) => {
  const tabId = details.tabId;
  const ctx = await getContext(details.url);
  const store = await getStorage();
  const isExtensionEnabled = store.globalSettings.isExtensionEnabled;

  if (!ctx.isSupported || !isExtensionEnabled) return;
  await dispatchContext(tabId, ctx);
});

chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
  const tabId = details.tabId;
  const ctx = await getContext(details.url);
  const store = await getStorage();
  const isExtensionEnabled = store.globalSettings.isExtensionEnabled;

  if (!ctx.isSupported || !isExtensionEnabled) return;
  await dispatchContext(tabId, ctx);
});
