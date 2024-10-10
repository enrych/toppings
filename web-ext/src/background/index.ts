import DEFAULT_CONFIG from "../extension.config";
import getExtensionConfig from "../lib/getExtensionConfig";
import {
  type WebAppContext,
  getWebAppContext,
  dispatchWebAppContext,
} from "./webAppContext";

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

      void chrome.storage.sync.set(DEFAULT_CONFIG);
    }
  },
);

chrome.webNavigation.onCompleted.addListener(async (details) => {
  const tabId = details.tabId;
  const webAppContext: WebAppContext = await getWebAppContext(details.url);
  const config = await getExtensionConfig();
  const isExtensionEnabled = config.globalSettings.isExtensionEnabled;

  if (!webAppContext.isSupported || !isExtensionEnabled) return;
  await dispatchWebAppContext(tabId, webAppContext);
});

chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
  const tabId = details.tabId;
  const webAppContext: WebAppContext = await getWebAppContext(details.url);
  const config = await getExtensionConfig();
  const isExtensionEnabled = config.globalSettings.isExtensionEnabled;

  if (!webAppContext.isSupported || !isExtensionEnabled) return;
  await dispatchWebAppContext(tabId, webAppContext);
});
