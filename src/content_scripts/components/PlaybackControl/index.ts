import PlaybackControlButton from './PlaybackControlButton'
import PlaybackControlMenu from './PlaybackControlMenu'

const DEFAULT_PLAYBACK_RATES = [
  '0.25',
  '0.5',
  '0.75',
  '1',
  '1.25',
  '1.5',
  '1.75',
  '2'
]

class PlaybackControl {
  PlaybackControlButton: HTMLButtonElement
  PlaybackControlMenu: HTMLDivElement

  private readonly videoPlayer: HTMLVideoElement

  constructor (videoPlayer?: HTMLVideoElement, playbackRates = DEFAULT_PLAYBACK_RATES) {
    this.videoPlayer = videoPlayer ?? document.querySelector('video') as HTMLVideoElement
    this.PlaybackControlButton = PlaybackControlButton()
    this.PlaybackControlMenu = PlaybackControlMenu(this.videoPlayer, playbackRates)
    this._connectedCallback()
  }

  private _connectedCallback (): void {
    this.PlaybackControlButton.addEventListener('click', this._toggleMenu.bind(this))

    document.body.addEventListener('click', (event: Event) => {
      if (!this.PlaybackControlMenu.contains(event.target as Node) && event.target !== this.PlaybackControlButton) {
        this.PlaybackControlMenu.style.display = 'none'
      }
    })
  }

  private _toggleMenu (): void {
    this.PlaybackControlMenu.style.display = (this.PlaybackControlMenu.style.display === 'none' || this.PlaybackControlMenu.style.display === '') ? 'initial' : 'none'
  }
}

export default PlaybackControl
