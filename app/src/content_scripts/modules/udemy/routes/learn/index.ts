import GLOBAL_CONTEXT from '../../../../common/global'
import loadElement from '../../../../utils/loadElement'
import ForgeDOM from '../../forgeDOM'
import { type UdemyContext } from '../../../../../background/webAppContextParsers'
import { type Nullable } from '../../../../../common/interfaces'
import { type UdemyPlayer, type LectureData } from './interfaces'

const toggleSpeedShortcut: string = 'X'
const seekBackwardShortcut: string = 'A'
const seekForwardShortcut: string = 'D'
const increaseSpeedShortcut: string = 'W'
const decreaseSpeedShortcut: string = 'S'
const toggleTheatreShortcut: string = 'T'
const customSpeedList: string[] = [
  '0.50',
  '0.75',
  '1.00',
  '1.25',
  '1.50',
  '1.75',
  '2.00'
]
const defaultSpeed: string = '1'
const toggleSpeed: string = '1.5'
const seekForward: string = '15'
const seekBackward: string = '15'
const increaseSpeed: string = '0.25'
const decreaseSpeed: string = '0.25'

let lastPlaybackRate: string
let player: Nullable<UdemyPlayer>
let playerPlaybackButton: Nullable<HTMLElement>
let customSpeed: string
let customSpeedButton: HTMLLIElement

const addLearnToppings = async (context: UdemyContext): Promise<void> => {
  const { lectureID, courseName } = context.contextData
  player = await loadPlayer({ lectureID, courseName })
  if (player !== null) {
    setDefaults()
    playerPlaybackButton = await loadPlaybackBtn()
    document.addEventListener('keydown', useShortcuts)
    if (playerPlaybackButton !== null) {
      playerPlaybackButton.removeEventListener('click', onPlaybackSpeedMenu)
      playerPlaybackButton.addEventListener('click', onPlaybackSpeedMenu)
    }
  }
}

const setDefaults = (): void => {
  const defaultInterval = setInterval(() => {
    if (Number((player as UdemyPlayer).playbackRate) > 0 && !(player as UdemyPlayer).paused) {
      changePlaybackSpeed(Number(defaultSpeed))
      clearInterval(defaultInterval)
    }
  }, 100)
}

const loadPlayer = async (lectureData: LectureData): Promise<Nullable<UdemyPlayer>> => {
  const playerVideoElement = await loadElement('video', 10000, 500) as Nullable<HTMLVideoElement>
  if (playerVideoElement !== null) {
    playerVideoElement.addEventListener('play', function (event) {
      if (lastPlaybackRate !== undefined) {
        changePlaybackSpeed(Number(lastPlaybackRate))
      }
    })
    playerVideoElement.addEventListener('pause', function (event) {
      lastPlaybackRate = playerVideoElement.playbackRate.toFixed(2)
    })

    const udemyPlayer: UdemyPlayer = {
      videoElement: playerVideoElement,

      get playbackRate () {
        return this.videoElement.playbackRate.toFixed(2)
      },

      set playbackRate (rate: string | number) {
        this.videoElement.playbackRate = Number(rate)
      },

      get currentTime () {
        return this.videoElement.currentTime
      },

      set currentTime (time: number) {
        this.videoElement.currentTime = time
      },

      get paused () {
        return this.videoElement.paused
      },

      ...lectureData
    }
    return udemyPlayer
  }
  return null
}

const loadPlaybackBtn = async (): Promise<Nullable<HTMLElement>> => {
  const playerPlaybackButton = await loadElement('[aria-label="Playback rate"]', 10000, 500)
  if (playerPlaybackButton !== null) {
    playerPlaybackButton.children[0].textContent = `${Number((player as UdemyPlayer).playbackRate)}x`
  }
  return playerPlaybackButton
}

const onPlaybackSpeedMenu = (): void => {
  const playbackRateMenu = document.querySelector('[data-purpose="playback-rate-menu"]') as HTMLElement
  const toppingsSpeedButtons = document.getElementsByClassName('toppings__speed-buttons')
  if (toppingsSpeedButtons[0] === undefined) {
    playbackRateMenu.replaceChildren(...getToppingsSpeedButtons())
    const currentSpeedButton = document.querySelector(`.toppings__speed-buttons button[data-speed='${(player as UdemyPlayer).playbackRate}']`) as HTMLElement
    if (currentSpeedButton !== null) {
      currentSpeedButton.setAttribute('aria-checked', 'true')
    } else {
      customSpeedButton.style.display = ''
      const customSpeedLabelElement = customSpeedButton.querySelector('span.ud-text-bold')
      if (customSpeedLabelElement !== null) {
        customSpeedLabelElement.textContent = `Custom(${Number((player as UdemyPlayer).playbackRate)}x)`
      }
      customSpeedButton.children[0].setAttribute('aria-checked', 'true')
    }
  } else {
    (document.querySelector('.toppings__speed-buttons [aria-checked="true"]') as HTMLElement).setAttribute('aria-checked', 'false')
    const currentSpeedButton = document.querySelector(`.toppings__speed-buttons button[data-speed='${(player as UdemyPlayer).playbackRate}']`) as HTMLElement
    if (currentSpeedButton !== null) {
      currentSpeedButton.setAttribute('aria-checked', 'true')
    } else {
      customSpeedButton.style.display = ''
      const customSpeedLabelElement = customSpeedButton.querySelector('span.ud-text-bold')
      if (customSpeedLabelElement !== null) {
        customSpeedLabelElement.textContent = `Custom(${Number((player as UdemyPlayer).playbackRate)}x)`
      }
      customSpeedButton.children[0].setAttribute('aria-checked', 'true')
    }
  }
}

const getToppingsSpeedButtons = (): HTMLLIElement[] => {
  customSpeedButton = ForgeDOM.createMenuButton({
    dataName: 'speed',
    dataValue: 'custom',
    buttonClass: 'toppings__speed-buttons',
    hasAriaChecked: 'false',
    buttonRole: 'menuitemradio',
    buttonTabIndex: '-1',
    buttonLabel: `Custom(${Number(customSpeed)}x)`,
    buttonOnClick: (_) => {
      changePlaybackSpeed(Number(customSpeed))
    },
    options: (menuButton: HTMLLIElement) => {
      menuButton.style.display = 'none'
    }
  })

  const toppingsSpeedButtons = [customSpeedButton, ...customSpeedList
    .sort((a, b) => Number(a) - Number(b))
    .map((speed) => {
      return ForgeDOM.createMenuButton({
        dataName: 'speed',
        dataValue: speed,
        buttonClass: 'toppings__speed-buttons',
        hasAriaChecked: 'false',
        buttonRole: 'menuitemradio',
        buttonTabIndex: '-1',
        buttonLabel: `${Number(speed)}x`,
        buttonOnClick: (_) => {
          changePlaybackSpeed(Number(speed))
        }
      })
    })]
  return toppingsSpeedButtons
}

const useShortcuts = (event: KeyboardEvent): void => {
  if (event.target !== null &&
    (event.target as HTMLElement).tagName !== 'INPUT' &&
    (event.target as HTMLElement).tagName !== 'TEXTAREA'
  ) {
    if (event.key === `${toggleSpeedShortcut.toLowerCase()}`) {
      if ((player as UdemyPlayer).playbackRate !== '1.00') {
        changePlaybackSpeed(1)
      } else {
        changePlaybackSpeed(Number(toggleSpeed))
      }
    } else if (event.key === `${seekBackwardShortcut.toLowerCase()}`) {
      (player as UdemyPlayer).currentTime -= +seekBackward
      // onDoubleTapSeek('back', seekBackward)
    } else if (event.key === `${seekForwardShortcut.toLowerCase()}`) {
      (player as UdemyPlayer).currentTime += +seekForward
      // onDoubleTapSeek('forward', seekForward)
    } else if (event.key === `${increaseSpeedShortcut.toLowerCase()}`) {
      const increasedSpeed = Number((Number((+(player as UdemyPlayer).playbackRate).toFixed(2)) + Number((+increaseSpeed).toFixed(2))).toFixed(2))
      if (increasedSpeed > GLOBAL_CONTEXT.MAX_PLAYBACK_RATE) {
        return
      }
      changePlaybackSpeed(increasedSpeed)
    } else if (event.key === `${decreaseSpeedShortcut.toLowerCase()}`) {
      const decreasedSpeed = Number((Number((+(player as UdemyPlayer).playbackRate).toFixed(2)) - Number((+decreaseSpeed).toFixed(2))).toFixed(2))
      if (decreasedSpeed < GLOBAL_CONTEXT.MIN_PLAYBACK_RATE) {
        return
      }
      changePlaybackSpeed(decreasedSpeed)
    } else if (event.key === `${toggleTheatreShortcut.toLowerCase()}`) {
      const toggleTheatreButton = document.querySelector('button[data-purpose="theatre-mode-toggle-button"]') as HTMLButtonElement
      console.log(toggleTheatreButton)
      if (toggleTheatreButton !== null) {
        toggleTheatreButton.click()
      }
    }
  }
}

const changePlaybackSpeed = (speed: number): void => {
  if (document.getElementsByClassName('toppings__speed-buttons')[0] !== undefined) {
    const currentSpeedButton = document.querySelector(`.toppings__speed-buttons button[data-speed='${(player as UdemyPlayer).playbackRate}']`) as HTMLElement
    if (currentSpeedButton !== null) {
      currentSpeedButton.setAttribute('aria-checked', 'false')
    } else {
      customSpeedButton.children[0].setAttribute('aria-checked', 'false')
    }
  }

  (player as UdemyPlayer).playbackRate = speed
  lastPlaybackRate = speed.toFixed(2)

  if (document.getElementsByClassName('toppings__speed-buttons')[0] !== undefined) {
    const currentSpeedButton = document.querySelector(`.toppings__speed-buttons button[data-speed='${(player as UdemyPlayer).playbackRate}']`) as HTMLElement
    if (currentSpeedButton !== null) {
      currentSpeedButton.setAttribute('aria-checked', 'true')
    } else {
      customSpeed = speed.toFixed(2)
      customSpeedButton.style.display = ''
      const customSpeedLabelElement = customSpeedButton.querySelector('span.ud-text-bold')
      if (customSpeedLabelElement !== null) {
        customSpeedLabelElement.textContent = `Custom(${Number(customSpeed)}x)`
      }
      customSpeedButton.children[0].setAttribute('aria-checked', 'true')
    }
  }

  if (playerPlaybackButton !== null) {
    playerPlaybackButton.children[0].textContent = `${Number((player as UdemyPlayer).playbackRate)}x`
  }
}

export default addLearnToppings
