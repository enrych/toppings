import { type YouTubeAppInfo } from '../../../common/interfaces'
import addWatchToppings from './routes/watch'
import addPlaylistToppings from './routes/playlist'

let isPlaylistEnabled: boolean
let isWatchEnabled: boolean

chrome.storage.sync.get(['playlistEnabled', 'watchEnabled'], (storage) => {
  isPlaylistEnabled = storage.playlistEnabled
  isWatchEnabled = storage.watchEnabled
})

const addYouTubeToppings = async (context: YouTubeAppInfo): Promise<void> => {
  const { routeType, contentId } = context.details
  switch (routeType) {
    case 'watch':
      isWatchEnabled && await addWatchToppings(contentId)
      break
    case 'playlist':
      isPlaylistEnabled && await addPlaylistToppings(contentId)
      break
    default:
      break
  }
}

export default addYouTubeToppings
