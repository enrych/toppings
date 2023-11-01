import { type UdemyAppInfo } from '../../../common/interfaces'
import onLearnPage from './routes/learn'

const learnEnabled: boolean = true

// chrome.storage.sync.get(['learnEnabled'], (storage) => {
//   learnEnabled = storage.learnEnabled
// })

const onUdemyLoaded = async (udemyAppInfo: UdemyAppInfo): Promise<void> => {
  const { routeType } = udemyAppInfo.details
  if (routeType === 'learn' && learnEnabled) {
    await onLearnPage(udemyAppInfo)
  }
}

export default onUdemyLoaded
