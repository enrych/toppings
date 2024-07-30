import { WebAppConfig } from "../lib/getWebAppConfig";
import webAppContextParser from "./parsers";

export interface UnSupportedWebAppContext {
  isSupported: false;
  appName: null;
}

export interface SupportedWebAppContext {
  isSupported: true;
  appName: string;
  webAppConfig: WebAppConfig;
  contextData: {
    webAppURL: URL;
    activeRoute?: string;
    payload?: ContextPayload | ContextPayload[];
    [key: string]: any;
  };
}

export interface ContextPayload {
  [key: string]: any;
}

export type WebAppContext = UnSupportedWebAppContext | SupportedWebAppContext;

export const getWebAppContext = async (
  href: string,
): Promise<WebAppContext> => {
  const webAppURL = new URL(href);
  const origin = webAppURL.origin;

  switch (origin) {
    case "https://www.youtube.com": {
      return await webAppContextParser.YouTube(webAppURL);
    }
    case "https://www.udemy.com": {
      return await webAppContextParser.Udemy(webAppURL);
    }
    default: {
      const webAppContext: WebAppContext = {
        appName: null,
        isSupported: false,
      };
      return webAppContext;
    }
  }
};

export const dispatchWebAppContext = async (
  tabId: number,
  webAppContext: SupportedWebAppContext,
): Promise<void> => {
  return await chrome.tabs.sendMessage(tabId, webAppContext);
};
