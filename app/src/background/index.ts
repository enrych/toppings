import { type WebAppContext, getWebAppContext, sendWebAppContextToTab } from './webAppContext'
import onExtensionInstalled from './onExtensionInstalled'

const UNINSTALL_URL: string = 'https://enrych.github.io/toppings-web/#/farewell'

let isExtensionActive: boolean

chrome.runtime.onInstalled.addListener(onExtensionInstalled)

if (process.env.NODE_ENV === 'production') {
  void chrome.runtime.setUninstallURL(UNINSTALL_URL)
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes?.isExtensionActive != null) {
      isExtensionActive = changes.isExtensionActive.newValue
    }
  }
})

chrome.webNavigation.onCompleted.addListener((details) => {
  const tabId = details.tabId
  const webAppContext: WebAppContext = getWebAppContext(details.url)

  chrome.storage.sync.get('isExtensionActive', (storage) => {
    isExtensionActive = storage.isExtensionActive
    if (!webAppContext.isSupported || !isExtensionActive) return
    sendWebAppContextToTab(tabId, webAppContext)
  })
})

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  const tabId = details.tabId
  const webAppContext: WebAppContext = getWebAppContext(details.url)

  chrome.storage.sync.get('isExtensionActive', (storage) => {
    isExtensionActive = storage.isExtensionActive
    if (!webAppContext.isSupported || !isExtensionActive) return
    sendWebAppContextToTab(tabId, webAppContext)
  })
})
