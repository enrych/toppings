import { type WebAppInfo, type YouTubeAppInfo } from '../common/interfaces'

/**
 * Retrieves information about the web application based on the provided URL.
 * This function determines if the web app is supported by the extension and
 * extracts relevant details if available.
 *
 * @param {string} url - The URL of the web application.
 * @returns {WebAppInfo} - Information about the web application.
 */
export const getWebAppInfo = (url: string): WebAppInfo => {
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
export const sendWebAppInfoToTab = (tabId: number, webAppInfo: WebAppInfo): void => {
  void chrome.tabs.sendMessage(tabId, webAppInfo)
}
