import { BASE_URI } from '../../../../common/server'
import { type YouTubeToppingsRequest, type YouTubeToppingsResponse } from '../common/interfaces'

/**
 * Fetches data from the Toppings API for YouTube.
 *
 * @param {YouTubeToppingsRequest} request - The request object for the data to fetch.
 * @returns {Promise<YouTubeToppingsResponse>} - A Promise that resolves to the fetched data.
 */
const fetchYouTubeToppings = async (request: YouTubeToppingsRequest): Promise<YouTubeToppingsResponse> => {
  let endpoint, contentId

  if (request.body.routeType === 'playlist') {
    endpoint = 'playlists'
    contentId = request.body.contentId
  }

  const apiURI = `${BASE_URI}/${endpoint}/${contentId}`

  const httpResponse = await fetch(apiURI, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  })

  const response = await httpResponse.json()
  return response
}

export default fetchYouTubeToppings
