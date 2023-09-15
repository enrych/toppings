import onYouTubeLoaded from './youtube/main'
import { type YouTubeAppInfo, type WebAppInfo } from './interfaces'
import { extendHTMLVideoElement } from 'easyfront'

extendHTMLVideoElement()

const youtubeEnabled: boolean = true

const runApp = (webAppInfo: WebAppInfo): void => {
  const { appName } = webAppInfo
  if (appName === 'youtube' && youtubeEnabled) {
    const youtubeAppInfo = webAppInfo as YouTubeAppInfo
    onYouTubeLoaded(youtubeAppInfo)
  }
}

chrome.runtime.onMessage.addListener(runApp)
