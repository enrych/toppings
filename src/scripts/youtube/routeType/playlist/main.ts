import addMetadataToppings from './addMetadataToppings'

const onPlaylistPage = (contentId: string): void => {
  const checkActionBarInterval = setInterval(() => {
    if (document.querySelector('.metadata-action-bar') !== null) {
      void addMetadataToppings(contentId)
      clearInterval(checkActionBarInterval)
      clearTimeout(checkActionBarTimeout)
    }
  }, 500)

  const checkActionBarTimeout = setTimeout(() => {
    clearInterval(checkActionBarInterval)
  }, 10000)
}

export default onPlaylistPage
