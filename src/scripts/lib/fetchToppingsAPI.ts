import { type FetchToppingsAPIRequest } from '../interfaces'

// The base URI of Toppings API
const baseURI = 'https://toppings.pythonanywhere.com/v1'

/**
 * Fetches data from the Toppings API based on the provided request.
 *
 * @param {FetchToppingsAPIRequest} request - The request object specifying the details of the data to fetch.
 * @returns {Promise<object>} - A Promise that resolves to the fetched data as an object.
 */
const fetchToppingsAPI = async (request: FetchToppingsAPIRequest): Promise<object> => {
  let endpoint, contentId

  if (request.appName === 'youtube') {
    if (request.body.routeType === 'playlist') {
      endpoint = 'playlists'
      contentId = request.body.contentId
      if (request.body.contentId === undefined) {
        contentId = new URLSearchParams(window.location.search).get('list')
      }
    }
  }

  const apiUrl = `${baseURI}/${endpoint}/${contentId}`

  const httpResponse = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  })

  const response = await httpResponse.json()
  return response
}

export default fetchToppingsAPI
