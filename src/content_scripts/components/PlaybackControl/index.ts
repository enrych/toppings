import PlaybackControlButton from './PlaybackControlButton'
import PlaybackControlMenu from './PlaybackControlMenu'
import { changePlaybackRate } from './PlaybackMenuItems'

type Shortcuts = Record<string, { key: string, value: string }>
type PlaybackRates = string[]

interface ShortcutsEnabled {
  enableShortcuts: true
  shortcuts: Shortcuts
}

interface ShortcutsDisabled {
  enableShortcuts: false
}

interface DefaultOptions extends ShortcutsEnabled {}

type PlaybackControlOptions = DefaultOptions | ShortcutsDisabled

class PlaybackControl {
  private static readonly DEFAULT_PLAYBACK_RATES: PlaybackRates = [
    '0.25',
    '0.50',
    '0.75',
    '1.00',
    '1.25',
    '1.50',
    '1.75',
    '2.00'
  ]

  private static readonly DEFAULT_SHORTCUTS: Shortcuts = {
    toggleSpeed: {
      key: 'X',
      value: '1.5'
    },
    seekBackward: {
      key: 'A',
      value: '15'
    },
    seekForward: {
      key: 'D',
      value: '15'
    },
    decreaseSpeed: {
      key: 'S',
      value: '0.25'
    },
    increaseSpeed: {
      key: 'W',
      value: '0.25'
    }
  }

  PlaybackControlButton: HTMLButtonElement
  PlaybackControlMenu: HTMLDivElement

  private readonly videoPlayer: HTMLVideoElement

  constructor (videoPlayer?: HTMLVideoElement, playbackRates: PlaybackRates = PlaybackControl.DEFAULT_PLAYBACK_RATES, options: PlaybackControlOptions = { enableShortcuts: true, shortcuts: PlaybackControl.DEFAULT_SHORTCUTS }) {
    this.videoPlayer = videoPlayer ?? document.querySelector('video') as HTMLVideoElement
    this.PlaybackControlButton = PlaybackControlButton()
    this.PlaybackControlMenu = PlaybackControlMenu(this.videoPlayer, playbackRates)
    this._connectedCallback()
    if (options.enableShortcuts) {
      this._enableShortcuts(options.shortcuts)
    }
  }

  private _connectedCallback (): void {
    const currentRateItem = this.PlaybackControlMenu.querySelector('.toppings__playback-menu-button[data-rate=\'1.00\']') as HTMLElement
    currentRateItem.ariaChecked = 'true'

    this.PlaybackControlButton.addEventListener('click', () => {
      const prevRateItem = document.querySelector('.toppings__playback-menu-button[aria-checked=true]') as HTMLElement
      prevRateItem.ariaChecked = 'false'

      const nextRateItem = document.querySelector(`.toppings__playback-menu-button[data-rate='${this.videoPlayer.playbackRate.toFixed(2)}']`) ?? (document.querySelector('.toppings__playback-menu-button[data-rate=custom]') as HTMLElement)
      nextRateItem.ariaChecked = 'true'
      this._toggleMenu()
    })

    document.body.addEventListener('click', (event: Event) => {
      if (!this.PlaybackControlMenu.classList.contains('hidden')) {
        if (!this.PlaybackControlMenu.contains(event.target as Node) && event.target !== this.PlaybackControlButton) {
          event.stopImmediatePropagation()
          this.PlaybackControlMenu.classList.add('hidden')
        }
      }
    }, true)
  }

  private _toggleMenu (): void {
    this.PlaybackControlMenu.classList.toggle('hidden')
  }

  private _enableShortcuts (shortcuts: Shortcuts): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.target !== null &&
        (event.target as HTMLElement).tagName !== 'INPUT' &&
        (event.target as HTMLElement).tagName !== 'TEXTAREA'
      ) {
        if (event.key === `${shortcuts.toggleSpeed.key.toLowerCase()}`) {
          if (this.videoPlayer.playbackRate.toFixed(2) !== '1.00') {
            changePlaybackRate(this.videoPlayer, 1)
          } else {
            changePlaybackRate(this.videoPlayer, Number(shortcuts.toggleSpeed.value))
          }
        } else if (event.key === `${shortcuts.seekBackward.key.toLowerCase()}`) {
          this.videoPlayer.currentTime -= +shortcuts.seekBackward.value
        } else if (event.key === `${shortcuts.seekForward.key.toLowerCase()}`) {
          this.videoPlayer.currentTime += +shortcuts.seekForward.value
        } else if (event.key === `${shortcuts.increaseSpeed.key.toLowerCase()}`) {
          const increasedSpeed = Number((Number((+this.videoPlayer.playbackRate).toFixed(2)) + Number((+shortcuts.increaseSpeed.value).toFixed(2))).toFixed(2))
          if (increasedSpeed > 16) {
            return
          }
          changePlaybackRate(this.videoPlayer, increasedSpeed)
        } else if (event.key === `${shortcuts.decreaseSpeed.key.toLowerCase()}`) {
          const decreasedSpeed = Number((Number((+this.videoPlayer.playbackRate).toFixed(2)) - Number((+shortcuts.decreaseSpeed.value).toFixed(2))).toFixed(2))
          if (decreasedSpeed < 0.0625) {
            return
          }
          changePlaybackRate(this.videoPlayer, decreasedSpeed)
        }
      }
    })
  }
}

export default PlaybackControl
