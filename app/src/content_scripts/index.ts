import { type YouTubeAppInfo, type WebAppInfo, type UdemyContext } from '../common/interfaces'

const youtubeEnabled: boolean = true

async function runApp(webAppInfo: WebAppInfo): Promise<undefined> {
  const { appName } = webAppInfo

  switch (appName) {
    case 'youtube':
      const youtubeAppInfo = webAppInfo as YouTubeAppInfo
      const { default: onYouTubeLoaded } = await import(/* webpackIgnore: true */ chrome.runtime.getURL('modules/youtube.js'))
      void onYouTubeLoaded(youtubeAppInfo)
      break
    case 'udemy':
      const udemyContext = webAppInfo as UdemyContext
      const { default: onUdemyLoaded } = await import(/* webpackIgnore: true */ chrome.runtime.getURL('modules/udemy.js'))
      void onUdemyLoaded(udemyContext)
      break
  }
}

chrome.runtime.onMessage.addListener((webAppInfo: WebAppInfo): undefined => {void runApp(webAppInfo)})
