import fetchToppingsAPI from '../../../lib/fetchToppingsAPI'
import { createMetadataSection, createSectionItem } from 'blendora'
import { formatRuntime } from '../../../lib/utility'

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

const addMetadataToppings = async (playlistID: string): Promise<void> => {
  const metadataActionBar = document.querySelector('.metadata-action-bar') as HTMLDivElement
  let MetadataToppings = document.querySelector('#metadata-toppings') as HTMLDivElement
  if (MetadataToppings === null) {
    if (playlistID === 'WL' || playlistID === 'LL') {
      return
    }
    MetadataToppings = document.createElement('div')
    MetadataToppings.className =
        'metadata-text-wrapper style-scope ytd-playlist-header-renderer'
    MetadataToppings.id = 'metadata-toppings'

    const ToppingsHeader = document.createElement('div')
    ToppingsHeader.id = 'toppings-header'

    const ToppingsIcon = document.createElement('img')
    ToppingsIcon.src = chrome.runtime.getURL('assets/icons/icon128.png')
    ToppingsIcon.id = 'toppings-icon'

    const ToppingsHeading = document.createElement('h2')
    ToppingsHeading.id = 'toppings-heading'
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
      }).then((response: PlaylistInfo) => {
        const averageRuntimeValueElement = document.getElementById('average-runtime')?.querySelector('.item-value') as HTMLSpanElement
        const totalRuntimeValueElement = document.getElementById('total-runtime')?.querySelector('.item-value') as HTMLSpanElement
        if (averageRuntimeValueElement !== null && totalRuntimeValueElement !== null) {
          averageRuntimeValueElement.textContent = response.data.avg_runtime
          totalRuntimeValueElement.textContent = formatRuntime(response.data.total_runtime)
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
  AverageRuntimeLabel.setAttribute('class', 'average-runtime item-label')
  AverageRuntimeLabel.appendChild(document.createTextNode('Average Runtime: '))

  const AverageRuntimeValue = document.createElement('span')
  AverageRuntimeValue.setAttribute('class', 'average-runtime item-value')
  AverageRuntimeValue.textContent = response.data.avg_runtime

  const AverageRuntime = createSectionItem({
    id: 'average-runtime',
    children: [AverageRuntimeLabel, AverageRuntimeValue]
  })

  // Total Runtime
  const TotalRuntimeLabel = document.createElement('span')
  TotalRuntimeLabel.setAttribute('class', 'total-runtime item-label')
  TotalRuntimeLabel.appendChild(document.createTextNode('Total Runtime: '))

  const TotalRuntimeValue = document.createElement('span')
  TotalRuntimeValue.setAttribute('class', 'total-runtime item-value')
  TotalRuntimeValue.textContent = formatRuntime(response.data.total_runtime)

  const TotalRuntime = createSectionItem({
    id: 'total-runtime',
    children: [TotalRuntimeLabel, TotalRuntimeValue]
  })

  const PlaylistRuntimeSection = createMetadataSection({
    sectionId: 'playlist-runtime-section',
    items: [AverageRuntime, TotalRuntime]
  })

  return PlaylistRuntimeSection
}

export default addMetadataToppings
