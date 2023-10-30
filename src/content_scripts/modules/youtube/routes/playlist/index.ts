import loadElement from '../../../../utils/loadElement'
import addMetadataToppings from './addMetadataToppings'
import './index.css'

const onPlaylistPage = async (contentId: string): Promise<void> => {
  const metadataActionBar = await loadElement('.metadata-action-bar', 10000, 500)
  if (metadataActionBar !== null) {
    await addMetadataToppings(contentId)
  }
}

export default onPlaylistPage
