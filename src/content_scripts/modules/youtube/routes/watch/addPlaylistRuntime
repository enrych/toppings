import fetchToppingsAPI from '../../utils/fetchToppingsAPI'
import { createMetadataSection, createSectionItem } from 'blendora'
import { formatRuntime } from '../../../../utils/formatRuntime'

interface PlaylistInfo {
  data: {
    avg_runtime: string
    num_videos: string
    playlist_id: string
    total_runtime: {
      days: number
      seconds: number
    }
  }
  description: string
  message: string
  status: number
}

const addPlaylistRuntime = async (playlistID: string): Promise<void> => {
  const metadataActionBar = document.querySelector('.metadata-action-bar') as HTMLDivElement
  let MetadataToppings = document.querySelector('#toppings__metadata-toppings') as HTMLDivElement
  if (MetadataToppings === null) {
    if (playlistID === 'WL' || playlistID === 'LL') {
      return
    }
    MetadataToppings = document.createElement('div')
    MetadataToppings.className =
        'metadata-text-wrapper style-scope ytd-playlist-header-renderer'
    MetadataToppings.id = 'toppings__metadata-toppings'

    const ToppingsHeader = document.createElement('div')
    ToppingsHeader.id = 'toppings__toppings-header'

    const ToppingsIcon = document.createElement('img')
    ToppingsIcon.src = chrome.runtime.getURL('assets/icons/icon128.png')
    ToppingsIcon.id = 'toppings__toppings-icon'

    const ToppingsHeading = document.createElement('h2')
    ToppingsHeading.id = 'toppings__toppings-heading'
    ToppingsHeading.textContent = 'Toppings'

    ToppingsHeader.append(ToppingsIcon, ToppingsHeading)
    MetadataToppings.appendChild(ToppingsHeader)
    MetadataToppings.append(await addRuntimeSection(playlistID))

    if (metadataActionBar.lastChild !== null) {
      metadataActionBar.insertBefore(
        MetadataToppings,
        metadataActionBar.lastChild.previousSibling
      )
    }
  } else {
    if (playlistID === 'WL' || playlistID === 'LL') {
      MetadataToppings.remove()
    } else {
      await fetchToppingsAPI({
        appName: 'youtube',
        body: {
          routeType: 'playlist',
          contentId: playlistID
        }
      }).then((response: any) => {
        const playlistInfo = response as PlaylistInfo;
        const averageRuntimeValueElement = document.getElementById('toppings__average-runtime')?.querySelector('.toppings__item-value') as HTMLSpanElement
        const totalRuntimeValueElement = document.getElementById('toppings__total-runtime')?.querySelector('.toppings__item-value') as HTMLSpanElement
        if (averageRuntimeValueElement !== null && totalRuntimeValueElement !== null) {
          averageRuntimeValueElement.textContent = playlistInfo.data.avg_runtime
          totalRuntimeValueElement.textContent = formatRuntime(playlistInfo.data.total_runtime)
        }
      })
    }
  }
}

const addRuntimeSection = async (playlistID: string): Promise<HTMLElement> => {
  const response: PlaylistInfo = await fetchToppingsAPI({
    appName: 'youtube',
    body: {
      routeType: 'playlist',
      contentId: playlistID
    }
  }) as PlaylistInfo

  // Average Runtime
  const AverageRuntimeLabel = document.createElement('span')
  AverageRuntimeLabel.setAttribute('class', 'toppings__average-runtime toppings__item-label')
  AverageRuntimeLabel.appendChild(document.createTextNode('Average Runtime: '))

  const AverageRuntimeValue = document.createElement('span')
  AverageRuntimeValue.setAttribute('class', 'toppings__average-runtime toppings__item-value')
  AverageRuntimeValue.textContent = response.data.avg_runtime

  const AverageRuntime = createSectionItem({
    id: 'toppings__average-runtime',
    children: [AverageRuntimeLabel, AverageRuntimeValue]
  })

  // Total Runtime
  const TotalRuntimeLabel = document.createElement('span')
  TotalRuntimeLabel.setAttribute('class', 'toppings__total-runtime toppings__item-label')
  TotalRuntimeLabel.appendChild(document.createTextNode('Total Runtime: '))

  const TotalRuntimeValue = document.createElement('span')
  TotalRuntimeValue.setAttribute('class', 'toppings__total-runtime toppings__item-value')
  TotalRuntimeValue.textContent = formatRuntime(response.data.total_runtime)

  const TotalRuntime = createSectionItem({
    id: 'toppings__total-runtime',
    children: [TotalRuntimeLabel, TotalRuntimeValue]
  })

  const PlaylistRuntimeSection = createMetadataSection({
    sectionId: 'toppings__playlist-runtime-section',
    items: [AverageRuntime, TotalRuntime]
  })

  return PlaylistRuntimeSection
}

export default addPlaylistRuntime