import {
  type YouTubeToppingsRequest,
  type YouTubeToppingsResponse,
} from "../common/interfaces";

export const SERVER_BASE_URI =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://toppings.onrender.com";

/**
 * Fetches data from the Toppings API for YouTube.
 *
 * @param {YouTubeToppingsRequest} request - The request object for the data to fetch.
 * @returns {Promise<YouTubeToppingsResponse>} - A Promise that resolves to the fetched data.
 */
const fetchYouTubeToppings = async <T extends YouTubeToppingsResponse>(
  request: YouTubeToppingsRequest,
): Promise<T> => {
  let endpoint, contentId;

  if (request.body.routeType === "playlist") {
    endpoint = "youtube/playlist";
    contentId = request.body.contentId;
  }

  const apiURI = `${SERVER_BASE_URI}/${endpoint}/${contentId}`;

  const httpResponse = await fetch(apiURI, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const response = await httpResponse.json();
  return response;
};

export default fetchYouTubeToppings;
