import { type UdemyContext } from '../../../common/interfaces'
import addLearnToppings from './routes/learn'
import { type LearnPageContext } from './routes/learn/interfaces'

const isLearnEnabled: boolean = true

// chrome.storage.sync.get(['isLearnEnabled'], (storage) => {
//   isLearnEnabled = storage.isLearnEnabled
// })

const addUdemyToppings = async (context: UdemyContext): Promise<void> => {
  const { routeType } = context.body
  switch (routeType) {
    case 'learn':
      isLearnEnabled && await addLearnToppings(context as LearnPageContext)
  }
}

export default addUdemyToppings
