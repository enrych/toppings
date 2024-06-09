import { type WebAppInfo } from '../common/interfaces'
import onInstallToppings from './onInstallToppings'
import { getWebAppInfo, sendWebAppInfoToTab } from './webAppInfo'

const UNINSTALL_URL: string = 'https://grabtoppings.xyz/#/farewell'

let toggleOn: boolean // Represents the current toggle state of the Toppings extension.

if (process.env.NODE_ENV === 'production') {
  void chrome.runtime.setUninstallURL(UNINSTALL_URL) // This URL will be redirected to when users uninstall the extension.
}
chrome.runtime.onInstalled.addListener(onInstallToppings) // Set up the extension when installed or updated.

/**
 * Listens for changes in storage and updates the extension state accordingly.
 * This function executes when storage data changes.
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes?.toggleOn != null) {
      toggleOn = changes.toggleOn.newValue
    }
  }
})

// Set up webNavigation listeners to send WebAppInfo to content scripts when page loading completes or history state updates.

chrome.webNavigation.onCompleted.addListener((details) => {
  const tabId = details.tabId
  const webAppInfo: WebAppInfo = getWebAppInfo(details.url)

  chrome.storage.sync.get('toggleOn', (storage) => {
    toggleOn = storage.toggleOn
    if (webAppInfo.status === 'unsupported' || !toggleOn) return
    sendWebAppInfoToTab(tabId, webAppInfo)
  })
})

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  const tabId = details.tabId
  const webAppInfo: WebAppInfo = getWebAppInfo(details.url)

  chrome.storage.sync.get('toggleOn', (storage) => {
    toggleOn = storage.toggleOn
    if (webAppInfo.status === 'unsupported' || !toggleOn) return
    sendWebAppInfoToTab(tabId, webAppInfo)
  })
})

/**
 * Listens for keyboard shortcuts defined in the manifest and triggers
 * corresponding actions.
 */

