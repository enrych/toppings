import { type WebAppInfo, type YouTubeAppInfo } from './interfaces'

/// /////////////////
// Global Variables
/// /////////////////

/**
 *  The URL to redirect users when they uninstall the extension.
 */
const uninstallUrl: string = 'https://grabtoppings.xyz/#/farewell'

/**
 *  The URL to redirect users when they install the extension.
 */
const installUrl: string = 'https://www.grabtoppings.xyz/#/greetings'

/**
 * Represents the current toggle state of the Toppings extension.
 */
let toggleOn: boolean

/// /////////////////////
// Event Listeners
/// /////////////////////

/**
 * Set the uninstallation URL for the extension.
 * This URL will be redirected to when users uninstall the extension.
 */
chrome.runtime.setUninstallURL(uninstallUrl)

/**
 * Set up the extension when installed or updated.
 */
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install' || reason === 'update') {
    // Open the install URL in a new tab
    void chrome.tabs.create({ url: installUrl })

    // Define initial user preferences
    const initialPreferences = {
      // General
      toggleOn: true,
      // Shortcuts
      toggleSpeedShortcut: 'X',
      seekBackwardShortcut: 'A',
      seekForwardShortcut: 'D',
      increaseSpeedShortcut: 'W',
      decreaseSpeedShortcut: 'S',
      // Watch Toppings
      watchEnabled: true,
      customSpeedList: [
        '0.25',
        '0.5',
        '0.75',
        '1',
        '1.25',
        '1.5',
        '1.75',
        '2',
        '2.25',
        '2.5'
      ],
      toggleSpeed: '1.5',
      defaultSpeed: '1',
      seekForward: '15',
      seekBackward: '15',
      increaseSpeed: '0.25',
      decreaseSpeed: '0.25',
      // Playlist Toppings
      playlistEnabled: true
    }

    // Save the initial preferences to Chrome storage
    void chrome.storage.sync.set(initialPreferences)
  }
})

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

/// /////////////////
// Helper Functions
/// /////////////////

/**
 * Retrieves information about the web application based on the provided URL.
 * This function determines if the web app is supported by the extension and
 * extracts relevant details if available.
 *
 * @param {string} url - The URL of the web application.
 * @returns {WebAppInfo} - Information about the web application.
 */
const getWebAppInfo = (url: string): WebAppInfo => {
  if (url.includes('www.youtube.com/playlist')) {
    const queryParameters = url.split('?')[1]
    const searchParams = new URLSearchParams(queryParameters)
    const playlistID = searchParams.get('list')

    if (playlistID != null) {
      const webAppInfo: YouTubeAppInfo = {
        status: 'supported',
        appName: 'youtube',
        details: {
          routeType: 'playlist',
          contentId: playlistID,
          queryParams: {
            list: playlistID
          }
        }
      }
      return webAppInfo
    }
  } else if (url.includes('www.youtube.com/watch')) {
    const queryParameters = url.split('?')[1]
    const searchParams = new URLSearchParams(queryParameters)
    const videoID = searchParams.get('v')

    if (videoID != null) {
      const webAppInfo: YouTubeAppInfo = {
        status: 'supported',
        appName: 'youtube',
        details: {
          routeType: 'watch',
          contentId: videoID,
          queryParams: {
            v: videoID
          }
        }
      }
      return webAppInfo
    }
  }

  // If the URL doesn't match supported web apps or doesn't contain valid details,
  // mark it as unsupported.
  const webAppInfo: WebAppInfo = { status: 'unsupported' }
  return webAppInfo
}

/**
 * Sends web application information to a specific tab using Chrome's messaging API.
 *
 * @param {number} tabId - The ID of the tab to send the message to.
 * @param {WebAppInfo} webAppInfo - Information about the web application.
 */
const sendWebAppInfoToTab = (tabId: number, webAppInfo: WebAppInfo): void => {
  void chrome.tabs.sendMessage(tabId, webAppInfo)
}

/// /////////////////////
// Send Info to Content Scripts on Navigation
/// /////////////////////

/**
 * Listens for the completion of web navigation in a tab and sends web app information
 * to the content script. In case of unsupported pages or when toggleOn is set to false,
 * it simply returns without sending information.
 */
chrome.webNavigation.onCompleted.addListener((details) => {
  const tabId = details.tabId
  const webAppInfo: WebAppInfo = getWebAppInfo(details.url)

  chrome.storage.sync.get('toggleOn', (storage) => {
    toggleOn = storage.toggleOn
    if (webAppInfo.status === 'unsupported' || !toggleOn) return
    sendWebAppInfoToTab(tabId, webAppInfo)
  })
})

/**
 * Listens for updates to the history state in a tab and sends page information
 * to the content script. In case of INVALID pages or when toggleOn is set to false,
 * it simply returns without sending information.
 */
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
 * Event Listener: Chrome Commands
 * ------------------------------
 * Listens for keyboard shortcuts defined in the manifest and triggers
 * corresponding actions. In this case, it opens the extension's preferences page.
 */
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open_preferences') {
    void chrome.tabs.create({ url: 'pages/options/options.html' })
  }
})
