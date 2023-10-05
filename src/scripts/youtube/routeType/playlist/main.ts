import loadElement from '../../../lib/loadElement'
import addMetadataToppings from './addMetadataToppings'

const onPlaylistPage = async (contentId: string): Promise<void> => {
  const metadataActionBar = await loadElement('.metadata-action-bar', 10000, 500)
  if (metadataActionBar !== null) {
    await addMetadataToppings(contentId)
  }
}

export default onPlaylistPage
