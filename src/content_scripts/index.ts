import onYouTubeLoaded from './modules/youtube'
import { type YouTubeAppInfo, type WebAppInfo, type UdemyContext } from '../common/interfaces'
import addUdemyToppings from './modules/udemy'

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
      const udemyContext = webAppInfo as UdemyContext
      void addUdemyToppings(udemyContext)
    }
  }
}

chrome.runtime.onMessage.addListener(runApp)
