/**
 * Defines the structure of data sent from the web application to the extension.
 *
 * @property {string} status - Indicates if the web app is supported or unsupported by the extension.
 * @property {string} appName - The name of the web application.
 * @property {Object} details - Additional details associated with the web application, if available.
 */
export interface WebAppInfo {
  status: 'supported' | 'unsupported'
  appName?: string
  details?: Record<string, any>
}

export interface YouTubeAppInfo extends WebAppInfo {
  details: {
    routeType: string
    contentId?: string
    queryParams?: Record<string, string | null>
  }
}
