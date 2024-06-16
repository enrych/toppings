import { type YouTubeContext } from '../../../background/webAppContextParsers'
import addWatchToppings from './routes/watch'
import addPlaylistToppings from './routes/playlist'

let isPlaylistEnabled: boolean
let isWatchEnabled: boolean

const addYouTubeToppings = async (context: YouTubeContext): Promise<void> => {
  chrome.storage.sync.get(['playlistEnabled', 'watchEnabled'], async (storage) => {
    isPlaylistEnabled = storage.playlistEnabled
    isWatchEnabled = storage.watchEnabled

    const { webAppURL: { route }, contentId } = context.contextData
    switch (route[0]) {
      case 'watch':
        isWatchEnabled && await addWatchToppings(contentId as string)
        break
      case 'playlist':
        isPlaylistEnabled && await addPlaylistToppings(contentId as string)
        break
      default:
        break
    }
  })
}

export default addYouTubeToppings
