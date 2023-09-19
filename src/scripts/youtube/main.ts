import { type YouTubeAppInfo } from '../interfaces'
import onWatchPage from './routeType/watch/main'
import onPlaylistPage from './routeType/playlist/main'

let playlistEnabled: boolean
let watchEnabled: boolean

chrome.storage.sync.get(['playlistEnabled', 'watchEnabled'], (storage) => {
  playlistEnabled = storage.playlistEnabled
  watchEnabled = storage.watchEnabled
})

const onYouTubeLoaded = async (youtubeAppInfo: YouTubeAppInfo): Promise<void> => {
  const { routeType, contentId } = youtubeAppInfo.details
  if (routeType === 'watch' && watchEnabled) {
    await onWatchPage(contentId)
  } else if (routeType === 'playlist' && playlistEnabled) {
    onPlaylistPage(contentId)
  }
}

export default onYouTubeLoaded
