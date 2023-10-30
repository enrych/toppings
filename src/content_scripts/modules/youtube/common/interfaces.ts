/**
 * Defines the structure of a request object for fetching data from the Toppings API.
 *
 * @property {string} appName - The name of the web application for which data is being requested.
 * @property {Object} body - The request body containing optional parameters.
 * @property {string} body.routeType - The type of route being requested (e.g., 'playlist', 'watch', etc.).
 * @property {string} body.contentId - The content identifier associated with the requested data.
 * @property {Object} body.queryParams - Optional query parameters to be included in the request.
 *                                      These parameters can be used to refine the data being fetched.
 *                                      Each parameter is represented as a key-value pair, where the
 *                                      key is the parameter name and the value is the parameter value
 *                                      or null if no value is provided.
 */
export interface FetchToppingsAPIRequest {
  appName: string
  body: {
    routeType?: string
    contentId?: string
    queryParams?: Record<string, string | null>
  }
}
