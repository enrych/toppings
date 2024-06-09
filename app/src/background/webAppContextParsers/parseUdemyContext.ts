import { type WebAppURL } from '../webAppURL'
import { type WebAppContext } from '../webAppContext'

export interface UdemyContext extends WebAppContext {
}

export default function parseUdemyContext (webAppURL: WebAppURL): UdemyContext {
  const regex = /https:\/\/www\.udemy\.com\/course\/([a-zA-Z0-9-]+)\/learn\/lecture\/(\d+)/
  const match = regex.exec(webAppURL.href)

  if (match !== null) {
    const courseName = match[1]
    const lectureID = match[2]
    const context: UdemyContext = {
      appName: 'udemy',
      isSupported: true,
      contextData: {
        webAppURL,
        courseName,
        lectureID
      }
    }
    return context
  }

  return {
    appName: 'udemy',
    isSupported: true,
    contextData: {
      webAppURL
    }
  }
}
