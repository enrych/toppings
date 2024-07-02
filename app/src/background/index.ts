import { getConfig } from "./getWorkerConfig";
import { DEFAULT_CONFIG, type Config } from "./store";
import {
  type WebAppContext,
  getWebAppContext,
  dispatchWebAppContext,
} from "./webAppContext";

// TODO: Build the new website and update these links
const INSTALL_URL = "https://enrych.github.io/toppings-web/#/greetings";
const UNINSTALL_URL = "https://enrych.github.io/toppings-web/#/farewell";

chrome.runtime.onInstalled.addListener(
  ({ reason }: { reason: chrome.runtime.OnInstalledReason }): void => {
    if (reason === "install" || reason === "update") {
      if (process.env.NODE_ENV === "production") {
        void chrome.tabs.create({ url: INSTALL_URL });
      }
      if (process.env.NODE_ENV === "production") {
        void chrome.runtime.setUninstallURL(UNINSTALL_URL);
      }

      void chrome.storage.sync.set(DEFAULT_CONFIG);
    }
  },
);

chrome.webNavigation.onCompleted.addListener(async (details) => {
  const tabId = details.tabId;
  const webAppContext: WebAppContext = await getWebAppContext(details.url);
  const config = await getConfig();
  const isExtensionEnabled = config.globalSettings.isExtensionEnabled;

  if (!webAppContext.isSupported || !isExtensionEnabled) return;
  await dispatchWebAppContext(tabId, webAppContext);
});

chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
  const tabId = details.tabId;
  const webAppContext: WebAppContext = await getWebAppContext(details.url);
  const config = await getConfig();
  const isExtensionEnabled = config.globalSettings.isExtensionEnabled;

  if (!webAppContext.isSupported || !isExtensionEnabled) return;
  await dispatchWebAppContext(tabId, webAppContext);
});
