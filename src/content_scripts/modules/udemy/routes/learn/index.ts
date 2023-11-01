import { type UdemyAppInfo, type Nullable } from '../../../../../common/interfaces'
import { type UdemyPlayer, type LearnPageInfo, type LectureInfo } from './interfaces'
import { MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE } from '../../../../common/global'
import loadElement from '../../../../utils/loadElement'
import { createMenuButton } from '../../dom'

const toggleSpeedShortcut: string = 'X'
const seekBackwardShortcut: string = 'A'
const seekForwardShortcut: string = 'D'
const increaseSpeedShortcut: string = 'W'
const decreaseSpeedShortcut: string = 'S'
const customSpeedList: string[] = [
  '0.50',
  '0.75',
  '1.00',
  '1.25',
  '1.50',
  '1.75',
  '2.00'
]
const toggleSpeed: string = '1.5'
const seekForward: string = '15'
const seekBackward: string = '15'
const increaseSpeed: string = '0.25'
const decreaseSpeed: string = '0.25'

let currentSpeed: string
let player: Nullable<UdemyPlayer>
let playerPlaybackButton: Nullable<HTMLElement>
let customSpeed: string
let customSpeedButton: HTMLLIElement

const onLearnPage = async (udemyAppInfo: UdemyAppInfo): Promise<void> => {
  const { lectureId, courseName } = (udemyAppInfo as LearnPageInfo).details
  player = await loadPlayer({ lectureId, courseName })
  if (player !== null) {
    currentSpeed = player.videoElement.playbackRate.toFixed(2)
    playerPlaybackButton = await loadPlaybackBtn()
    document.addEventListener('keydown', useShortcuts)
    if (playerPlaybackButton !== null) {
      playerPlaybackButton.removeEventListener('click', onPlaybackSpeedMenu)
      playerPlaybackButton.addEventListener('click', onPlaybackSpeedMenu)
    }
  }
}

const loadPlayer = async (lectureInfo: LectureInfo): Promise<Nullable<UdemyPlayer>> => {
  const playerVideoElement = await loadElement('video', 10000, 500) as Nullable<HTMLVideoElement>
  if (playerVideoElement !== null) {
    const udemyPlayer = { videoElement: playerVideoElement, lectureId: lectureInfo.lectureId, courseName: lectureInfo.courseName }
    return udemyPlayer
  }
  return null
}

const loadPlaybackBtn = async (): Promise<Nullable<HTMLElement>> => {
  const playerPlaybackButton = await loadElement('[aria-label="Playback rate"]', 10000, 500)
  if (playerPlaybackButton !== null) {
    playerPlaybackButton.children[0].textContent = `${Number(currentSpeed)}x`
  }
  return playerPlaybackButton
}

const onPlaybackSpeedMenu = (): void => {
  const playbackRateMenu = document.querySelector('[data-purpose="playback-rate-menu"]') as HTMLElement
  const toppingsSpeedButtons = document.getElementsByClassName('toppings__speed-buttons')
  if (toppingsSpeedButtons[0] === undefined) {
    playbackRateMenu.replaceChildren(...getToppingsSpeedButtons())
    if (customSpeedList.includes(currentSpeed)) {
      const currentSpeedButton = document.querySelector(`.toppings__speed-buttons button[data-speed='${currentSpeed}']`) as HTMLElement
      if (currentSpeedButton !== null) {
        currentSpeedButton.ariaChecked = 'true'
      }
    } else {
      customSpeedButton.style.display = ''
      const customSpeedLabelElement = customSpeedButton.querySelector('span.ud-text-bold')
      if (customSpeedLabelElement !== null) {
        customSpeedLabelElement.textContent = `Custom(${Number(customSpeed)}x)`
      }
      customSpeedButton.children[0].setAttribute('aria-checked', 'true')
    }
  } else {
    for (const item of document.getElementsByClassName('toppings__speed-buttons')) {
      item.children[0].ariaChecked = 'false'
    }
    if (customSpeedList.includes(currentSpeed)) {
      const currentSpeedButton = document.querySelector(`.toppings__speed-buttons button[data-speed='${currentSpeed}']`) as HTMLElement
      if (currentSpeedButton !== null) {
        currentSpeedButton.ariaChecked = 'true'
      }
    } else {
      customSpeedButton.style.display = ''
      const customSpeedLabelElement = customSpeedButton.querySelector('span.ud-text-bold')
      if (customSpeedLabelElement !== null) {
        customSpeedLabelElement.textContent = `Custom(${Number(customSpeed)}x)`
      }
      customSpeedButton.children[0].setAttribute('aria-checked', 'true')
    }
  }
}

const getToppingsSpeedButtons = (): HTMLLIElement[] => {
  customSpeedButton = createMenuButton({
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
      return createMenuButton({
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
      if (currentSpeed !== '1.00') {
        changePlaybackSpeed(1)
      } else {
        changePlaybackSpeed(Number(toggleSpeed))
      }
    } else if (event.key === `${seekBackwardShortcut.toLowerCase()}`) {
      (player as UdemyPlayer).videoElement.currentTime -= +seekBackward
      // onDoubleTapSeek('back', seekBackward)
    } else if (event.key === `${seekForwardShortcut.toLowerCase()}`) {
      (player as UdemyPlayer).videoElement.currentTime += +seekForward
      // onDoubleTapSeek('forward', seekForward)
    } else if (event.key === `${increaseSpeedShortcut.toLowerCase()}`) {
      const increasedSpeed = Number((Number((+currentSpeed).toFixed(2)) + Number((+increaseSpeed).toFixed(2))).toFixed(2))
      if (increasedSpeed > MAX_PLAYBACK_RATE) {
        return
      }
      changePlaybackSpeed(increasedSpeed)
    } else if (event.key === `${decreaseSpeedShortcut.toLowerCase()}`) {
      const decreasedSpeed = Number((Number((+currentSpeed).toFixed(2)) - Number((+decreaseSpeed).toFixed(2))).toFixed(2))
      if (decreasedSpeed < MIN_PLAYBACK_RATE) {
        return
      }
      changePlaybackSpeed(decreasedSpeed)
    }
  }
}

const changePlaybackSpeed = (speed: number): void => {
  if (document.getElementsByClassName('toppings__speed-buttons')[0] !== undefined) {
    if (customSpeedList.includes(currentSpeed)) {
      const currentSpeedButton = document.querySelector(`.toppings__speed-buttons button[data-speed='${currentSpeed}']`) as HTMLElement
      if (currentSpeedButton !== null) {
        currentSpeedButton.ariaChecked = 'false'
      }
    } else {
      customSpeedButton.children[0].setAttribute('aria-checked', 'false')
    }
  }

  (player as UdemyPlayer).videoElement.playbackRate = speed
  currentSpeed = speed.toFixed(2)

  if (document.getElementsByClassName('toppings__speed-buttons')[0] !== undefined) {
    if (customSpeedList.includes(currentSpeed)) {
      const currentSpeedButton = document.querySelector(`.toppings__speed-buttons button[data-speed='${currentSpeed}']`) as HTMLElement
      if (currentSpeedButton !== null) {
        currentSpeedButton.ariaChecked = 'true'
      }
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
    playerPlaybackButton.children[0].textContent = `${Number(currentSpeed)}x`
  }
}

export default onLearnPage
