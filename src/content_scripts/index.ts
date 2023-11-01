import onYouTubeLoaded from './modules/youtube'
import { type YouTubeAppInfo, type WebAppInfo, type UdemyAppInfo } from '../common/interfaces'
import onUdemyLoaded from './modules/udemy'

const youtubeEnabled: boolean = true
let checkAppLoaded: string = ''

const runApp = (webAppInfo: WebAppInfo): undefined => {
  if (checkAppLoaded !== window.location.href) {
    checkAppLoaded = window.location.href
    const { appName } = webAppInfo
    if (appName === 'youtube' && youtubeEnabled) {
      const youtubeAppInfo = webAppInfo as YouTubeAppInfo
      void onYouTubeLoaded(youtubeAppInfo)
    } else if (appName === 'udemy') {
      const udemyAppInfo = webAppInfo as UdemyAppInfo
      void onUdemyLoaded(udemyAppInfo)
    }
  }
}

chrome.runtime.onMessage.addListener(runApp)
