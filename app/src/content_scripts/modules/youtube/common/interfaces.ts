import { type ToppingsRequest } from '../../../../common/interfaces'

/**
 * Defines the structure of a request object for fetching data from the Toppings YouTube API.
 *
 */
export interface YouTubeToppingsRequest extends ToppingsRequest {
  body: {
    routeType: string
    contentId?: string
    queryParams?: Record<string, string | null>
  }
}

export type YouTubeToppingsResponse = Record<string, any>

export interface YouTubePlaylistMetadata extends YouTubeToppingsResponse {
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

export interface ToppingsPanelHeader {
  panelId: string
  panelClass?: string
  btnLabel: string
  btnOnClick: (event: Event) => void
  panelTitle: string
  panelOptions?: { optionsTitle: string, optionsOnClick: (event: Event) => void }
  options?: (target: HTMLDivElement) => void
}

export interface ToppingsMenuItem {
  itemId: string
  itemClass?: string
  hasAriaPopUp?: string
  hasAriaChecked?: string
  itemRole?: string
  itemTabIndex?: string
  itemIconPath?: string
  itemLabel?: string
  itemContent?: Node
  itemOnClick: (event: Event) => void
  options?: (target: HTMLDivElement) => void
}

export interface ToppingsMetadataSection {
  sectionId: string
  sectionClass?: string
  headerIcon?: string
  headerTitle?: string
  items?: HTMLElement[]
  options?: (target: HTMLDivElement) => void
}

export interface ToppingsSectionItem {
  id: string
  className?: string
  children: HTMLElement[]
  options?: (target: HTMLDivElement) => void
}
