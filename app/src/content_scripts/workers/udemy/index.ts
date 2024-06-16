import { type UdemyContext } from '../../../background/webAppContextParsers'
import addLearnToppings from './routes/learn'
import { type LearnPageContext } from './routes/learn/interfaces'

const isLearnEnabled: boolean = true

// chrome.storage.sync.get(['isLearnEnabled'], (storage) => {
//   isLearnEnabled = storage.isLearnEnabled
// })

const addUdemyToppings = async (context: UdemyContext): Promise<void> => {
  const { route } = context.contextData.webAppURL
  const activeRoute = route[0]
  switch (activeRoute) {
    case 'learn':
      isLearnEnabled && await addLearnToppings(context as LearnPageContext)
  }
}

export default addUdemyToppings
