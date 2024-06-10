import { type WebAppURL, parseWebAppURL } from './webAppURL'
import webAppContextParser from './webAppContextParsers'

export interface UnSupportedWebAppContext {
  appName: null
  isSupported: false
  contextData: {
    webAppURL: WebAppURL
  }
}

export interface SupportedWebAppContext {
  appName: string
  isSupported: true
  contextData: {
    webAppURL: WebAppURL
    [key: string]: any
  }
}

export type WebAppContext = UnSupportedWebAppContext | SupportedWebAppContext

export const getWebAppContext = (href: string): WebAppContext => {
  const webAppURL = parseWebAppURL(href)
  const origin = webAppURL.origin

  switch (origin) {
    case 'https://www.youtube.com': {
      return webAppContextParser.YouTube(webAppURL)
    }
    case 'https://www.udemy.com': {
      return webAppContextParser.Udemy(webAppURL)
    }
    default: {
      const webAppContext: WebAppContext = {
        appName: null,
        isSupported: false,
        contextData: { webAppURL }
      }
      return webAppContext
    }
  }
}

export const sendWebAppContextToTab = (tabId: number, webAppContext: WebAppContext): void => {
  void chrome.tabs.sendMessage(tabId, webAppContext)
}
