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

/**
 * Dispatches the provided WebApp context to the specified tab using `chrome.tabs.sendMessage`.
 *
 * @param {number} tabId - The ID of the tab to send the message to.
 * @param {SupportedWebAppContext} webAppContext - The context to be sent to the tab.
 * @returns {Promise<void>} A promise that resolves when the message is sent.
 *
 * @remarks
 * - **Serialization in different browsers:**
 *   - **Firefox**: Uses the Structured Clone Algorithm.
 *   - **Chrome**: Currently uses JSON serialization, but may adopt the Structured Clone Algorithm in the future (Chrome issue 248548).
 *
 * - **Structured Clone Algorithm** (used by Firefox):
 *   - Supports a broader range of object types compared to JSON serialization.
 *
 * - **JSON Serialization** (used by Chrome):
 *   - Does not handle certain object types like DOM objects natively.
 *   - Objects with a `toJSON()` method (e.g., `URL`, `PerformanceEntry`) can be serialized with JSON, but they are still not structured cloneable.
 *
 * @note For extensions relying on `toJSON()`, use `JSON.stringify()` followed by `JSON.parse()` to ensure the message is structurally cloneable across browsers.
 */
export const dispatchWebAppContext = async (
  tabId: number,
  webAppContext: SupportedWebAppContext,
): Promise<void> => {
  // For URL, ensure the message is structurally cloneable across browsers.
  const serializedWebAppContext = JSON.stringify(webAppContext);
  return await chrome.tabs.sendMessage(tabId, serializedWebAppContext);
};
