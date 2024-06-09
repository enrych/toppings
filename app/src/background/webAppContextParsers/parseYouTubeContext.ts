import { type WebAppURL } from '../webAppURL'
import { type WebAppContext } from '../webAppContext'

export interface YouTubeContext extends WebAppContext {
  contextData: {
    webAppURL: WebAppURL
    contentId?: string
    [key: string]: any
  }
}

export default function parseYoutubeContext (webAppURL: WebAppURL): YouTubeContext {
  const activeRoute = webAppURL.route[0]
  switch (activeRoute) {
    case 'playlist': {
      const playlistID = webAppURL.searchParams.get('list')
      if (playlistID != null) {
        return {
          appName: 'youtube',
          isSupported: true,
          contextData: {
            webAppURL,
            contentId: playlistID
          }
        }
      }
      break
    }

    case 'watch': {
      const videoID = webAppURL.searchParams.get('v')
      if (videoID != null) {
        return {
          appName: 'youtube',
          isSupported: true,
          contextData: {
            webAppURL,
            contentId: videoID
          }
        }
      }
      break
    }
  }

  return {
    appName: 'youtube',
    isSupported: true,
    contextData: {
      webAppURL
    }
  }
}
