import { createMenuItem } from '../../common/dom'
import YTPlayer from '../../common/VideoPlayer'
import loadElement from '../../../../utils/loadElement'
import { type Nullable } from '../../../../../common/interfaces'
import addPlaylistRuntime from './addPlaylistRuntime'

let toggleSpeedShortcut: string
let seekBackwardShortcut: string
let seekForwardShortcut: string
let increaseSpeedShortcut: string
let decreaseSpeedShortcut: string
let customSpeedList: string[]
let customPrecisionSpeedList: string[]
let toggleSpeed: string
let defaultSpeed: string
let seekForward: number
let seekBackward: number
let increaseSpeed: string
let decreaseSpeed: string
let isPlaylist: boolean

chrome.storage.sync.get(
  [
    'toggleSpeedShortcut',
    'seekBackwardShortcut',
    'seekForwardShortcut',
    'increaseSpeedShortcut',
    'decreaseSpeedShortcut',
    'customSpeedList',
    'toggleSpeed',
    'defaultSpeed',
    'seekForward',
    'seekBackward',
    'increaseSpeed',
    'decreaseSpeed'
  ],
  (storage) => {
    toggleSpeedShortcut = storage.toggleSpeedShortcut
    seekBackwardShortcut = storage.seekBackwardShortcut
    seekForwardShortcut = storage.seekForwardShortcut
    increaseSpeedShortcut = storage.increaseSpeedShortcut
    decreaseSpeedShortcut = storage.decreaseSpeedShortcut
    customSpeedList = storage.customSpeedList
    customPrecisionSpeedList = customSpeedList.map((speed) =>
      (+speed).toFixed(2)
    )
    toggleSpeed = Number(storage.toggleSpeed).toFixed(2)
    defaultSpeed = Number(storage.defaultSpeed).toFixed(2)
    seekForward = storage.seekForward
    seekBackward = storage.seekBackward
    increaseSpeed = Number(storage.increaseSpeed).toFixed(2)
    decreaseSpeed = Number(storage.decreaseSpeed).toFixed(2)
    currentSpeed = Number(defaultSpeed).toFixed(2)
  }
)

let currentSpeed: string
let doubleTapSeekElement: Nullable<HTMLElement>
let player: Nullable<YTPlayer>
let playerSettingsButton: Nullable<HTMLElement>
let playerPlaybackButton: Nullable<HTMLElement>
let customSpeed: string
let customSpeedButton: HTMLElement
let doubleTapSeekTimeout: ReturnType<typeof setTimeout>

const onWatchPage = async (contentID: string): Promise<void> => {
  player = await loadPlayer(contentID)
  if (player !== null) {
    setWatchDefaults()

    doubleTapSeekElement = document.querySelector('.ytp-doubletap-ui-legacy')

    playerSettingsButton = await loadSettingsBtn()
    document.addEventListener('keydown', useShortcuts)
    if (playerSettingsButton !== null) {
      playerSettingsButton.removeEventListener('click', onSettingsMenu)
      playerSettingsButton.addEventListener('click', onSettingsMenu, { once: true })
    }
    if (isPlaylist) {
      const metadataActionBar = await loadElement('.metadata-action-bar', 10000, 500)
  if (metadataActionBar !== null) {
    await addPlaylistRuntime(contentID)
  }
      
    }

  }
}

const setWatchDefaults = (): void => {
  currentSpeed = Number(defaultSpeed).toFixed(2);
  (player as YTPlayer).setPlaybackSpeed(parseFloat(defaultSpeed))

  const labels = document.querySelectorAll('.ytp-menuitem-label')
  if (labels.length === 0) {
    return
  }
  let playbackSpeedLabel
  for (const label of labels) {
    if (label.textContent === 'Playback speed') {
      playbackSpeedLabel = label as HTMLElement
      break
    }
  }

  if (playbackSpeedLabel !== undefined) {
    const playerPlaybackButton = playbackSpeedLabel.parentNode as HTMLElement

    playerPlaybackButton.children[2].textContent =
    currentSpeed === '1' || currentSpeed === '1.00'
      ? 'Normal'
      : `${Number(currentSpeed)}`
  }
}

const loadPlayer = async (contentID: string): Promise<Nullable<YTPlayer>> => {
  const playerVideoElement = await loadElement('video', 10000, 500) as Nullable<HTMLVideoElement>
  if (playerVideoElement !== null) {
    const loadedPlayer = new YTPlayer(playerVideoElement, { videoID: contentID })
    return loadedPlayer
  }
  return null
}

const loadSettingsBtn = async (): Promise<Nullable<HTMLElement>> => {
  const playerSettingsButton = await loadElement('.ytp-settings-button', 10000, 500)
  return playerSettingsButton
}

const onSettingsMenu = (): void => {
  void loadPlaybackSpeedBtn().then(button => {
    playerPlaybackButton = button
    if (playerPlaybackButton !== null) {
      playerPlaybackButton.children[2].textContent =
    currentSpeed === '1' || currentSpeed === '1.00'
      ? 'Normal'
      : `${Number(currentSpeed)}`
      playerPlaybackButton.addEventListener(
        'click',
        onPlaybackSpeedMenu
      )
    }
  })
}

const loadPlaybackSpeedBtn = async (): Promise<Nullable<HTMLElement>> => {
  return await new Promise<Nullable<HTMLElement>>((resolve, reject) => {
    const checkInterval = setInterval(() => {
      const labels = document.querySelectorAll('.ytp-menuitem-label')
      if (labels.length === 0) {
        return
      }

      for (const label of labels) {
        if (label.textContent === 'Playback speed') {
          const playbackSpeedLabel = label as HTMLElement
          const playerSettingsButton = playbackSpeedLabel.parentNode as HTMLElement
          clearInterval(checkInterval)
          clearTimeout(checkTimeout)
          resolve(playerSettingsButton)
        }
      }
    }, 200)

    const checkTimeout = setTimeout(() => {
      clearInterval(checkInterval)
      if (process.env.NODE_ENV === 'development') {
        const errorMessage = 'Playback speed button not found within 2000ms.'
        console.warn(errorMessage)
      }
      resolve(null)
    }, 2000)
  })
}

const onPlaybackSpeedMenu = (): void => {
  void loadPlaybackSpeedMenu().then(firstMenuItemLabel => {
    if (firstMenuItemLabel !== null) {
      const menuPanelOptions = document.getElementsByClassName('ytp-panel-options')[0] as HTMLElement
      menuPanelOptions.style.display = 'none'

      const settingsMenu = document.getElementsByClassName('ytp-settings-menu')[0] as HTMLElement
      const panelMenu = settingsMenu.getElementsByClassName('ytp-panel-menu')[0] as HTMLElement
      const toppingsSpeedItems = document.getElementsByClassName('tp-speeditem')
      if (toppingsSpeedItems[0] === undefined) {
        panelMenu.replaceChildren(...getPlaybackSpeedItems())
        if (customPrecisionSpeedList.includes(currentSpeed)) {
          const currentSpeedItem = document.querySelector(`#tp-${Number(currentSpeed) * 10000}x-speeditem`) as HTMLElement
          if (currentSpeedItem !== null) {
            currentSpeedItem.ariaChecked = 'true'
          }
        } else {
          customSpeedButton.style.display = ''
          customSpeedButton.setAttribute('aria-checked', 'true')
          const customSpeedItemLabel = customSpeedButton.querySelector('.ytp-menuitem-label') as HTMLElement
          if (customSpeedItemLabel !== null) {
            customSpeedItemLabel.textContent = `Custom(${Number(currentSpeed)})`
          }
        }
      } else {
        for (const item of document.getElementsByClassName('tp-speeditem')) {
          item.ariaChecked = 'false'
        }
        if (customPrecisionSpeedList.includes(currentSpeed)) {
          const currentSpeedItem = document.querySelector(`#tp-${Number(currentSpeed) * 10000}x-speeditem`) as HTMLElement
          if (currentSpeedItem !== null) {
            currentSpeedItem.ariaChecked = 'true'
          }
        } else {
          customSpeedButton.style.display = ''
          customSpeedButton.setAttribute('aria-checked', 'true')
          const customSpeedItemLabel = customSpeedButton.querySelector('.ytp-menuitem-label')
          if (customSpeedItemLabel !== null) {
            customSpeedItemLabel.textContent = `Custom(${Number(currentSpeed)})`
          }
        }
      }
    }
  })
}

const loadPlaybackSpeedMenu = async (): Promise<Nullable<HTMLElement>> => {
  return await new Promise<Nullable<HTMLElement>>((resolve, reject) => {
    const checkInterval = setInterval(() => {
      const firstMenuItemLabel = document.getElementsByClassName('ytp-menuitem-label')[0]
      const toppingsMenuItem = document.getElementsByClassName('tp-speeditem')[0]

      if ((firstMenuItemLabel?.textContent === '0.25' && toppingsMenuItem === undefined) || toppingsMenuItem !== undefined) {
        clearInterval(checkInterval)
        clearTimeout(checkTimeout)
        resolve(firstMenuItemLabel as HTMLElement)
      }
    }, 50)

    const checkTimeout = setTimeout(() => {
      clearInterval(checkInterval)
      if (process.env.NODE_ENV === 'development') {
        const errorMessage = 'Playback speeds not found within 2000ms.'
        console.warn(errorMessage)
      }
      resolve(null)
    }, 2000)
  })
}

const getPlaybackSpeedItems = (): HTMLElement[] => {
  customSpeedButton = createMenuItem({
    itemId: 'tp-custom-speeditem',
    itemClass: 'tp-speeditem',
    itemRole: 'menuitemradio',
    hasAriaChecked: 'false',
    itemTabIndex: '0',
    itemLabel: `Custom(${Number(customSpeed)})`,
    itemOnClick: (event) => {
      changePlaybackSpeed(Number(customSpeed))
      const panelBackButton = document.getElementsByClassName('ytp-panel-back-button')[0] as HTMLElement
      panelBackButton.click()
    },
    options: (menuItem: HTMLDivElement) => {
      menuItem.style.display = 'none'
    }
  })

  const playbackSpeedItems = [customSpeedButton, ...customPrecisionSpeedList
    .sort((a, b) => Number(a) - Number(b))
    .map((speed) => {
      if (speed !== '1.00') {
        return createMenuItem({
          itemId: `tp-${+speed * 10000}x-speeditem`,
          itemClass: 'tp-speeditem',
          itemRole: 'menuitemradio',
          hasAriaChecked: 'false',
          itemTabIndex: '0',
          itemLabel: `${Number(speed)}`,
          itemOnClick: (event) => {
            changePlaybackSpeed(Number(speed))
            const panelBackButton = document.getElementsByClassName('ytp-panel-back-button')[0] as HTMLElement
            panelBackButton.click()
          }
        })
      } else {
        return createMenuItem({
          itemId: 'tp-10000x-speeditem',
          itemClass: 'tp-speeditem',
          itemRole: 'menuitemradio',
          hasAriaChecked: 'false',
          itemTabIndex: '0',
          itemLabel: 'Normal',
          itemOnClick: (event) => {
            changePlaybackSpeed(1)
            const panelBackButton = document.getElementsByClassName('ytp-panel-back-button')[0] as HTMLElement
            panelBackButton.click()
          }
        })
      }
    })]

  return playbackSpeedItems
}

const useShortcuts = (event: KeyboardEvent): void => {
  if (event.target !== null &&
    (event.target as HTMLElement).tagName !== 'INPUT' &&
    (event.target as HTMLElement).tagName !== 'TEXTAREA' &&
      !(event.target as HTMLElement).matches('#contenteditable-root.yt-formatted-string')
  ) {
    if (event.key === `${toggleSpeedShortcut.toLowerCase()}`) {
      if (currentSpeed !== '1.00' && currentSpeed !== '1') {
        changePlaybackSpeed(1)
      } else {
        changePlaybackSpeed(Number(toggleSpeed))
      }
    } else if (event.key === `${seekBackwardShortcut.toLowerCase()}`) {
      (player as YTPlayer).seekCurrentTime('backward', +seekBackward)
      onDoubleTapSeek('back', seekBackward)
    } else if (event.key === `${seekForwardShortcut.toLowerCase()}`) {
      (player as YTPlayer).seekCurrentTime('forward', +seekForward)
      onDoubleTapSeek('forward', seekForward)
    } else if (event.key === `${increaseSpeedShortcut.toLowerCase()}`) {
      const increasedSpeed = Number((Number((+currentSpeed).toFixed(2)) + Number((+increaseSpeed).toFixed(2))).toFixed(2))
      if (increasedSpeed > YTPlayer.MAX_PLAYBACK_RATE) {
        return
      }
      changePlaybackSpeed(increasedSpeed)
    } else if (event.key === `${decreaseSpeedShortcut.toLowerCase()}`) {
      const decreasedSpeed = Number((Number((+currentSpeed).toFixed(2)) - Number((+decreaseSpeed).toFixed(2))).toFixed(2))
      if (decreasedSpeed < YTPlayer.MIN_PLAYBACK_RATE) {
        return
      }
      changePlaybackSpeed(decreasedSpeed)
    }
  }
}

const onDoubleTapSeek = (dataSide: 'back' | 'forward', time: number): void => {
  if (doubleTapSeekElement !== null) {
    (doubleTapSeekElement).setAttribute('data-side', dataSide);
    (doubleTapSeekElement).style.display = ''
    const doubleTapSeekLabel = (doubleTapSeekElement).querySelector('.ytp-doubletap-tooltip-label') as HTMLElement
    if (doubleTapSeekLabel !== null) {
      doubleTapSeekLabel.textContent = `${time} seconds`
    }
    const staticCircle = document.querySelector('.ytp-doubletap-static-circle') as HTMLElement
    if (staticCircle !== null && dataSide === 'back') {
      staticCircle.style.top = '50%'
      staticCircle.style.left = '10%'
      staticCircle.style.width = '110px'
      staticCircle.style.height = '110px'
      staticCircle.style.transform = 'translate(-14px, -40px)'
    } else if (staticCircle !== null && dataSide === 'forward') {
      staticCircle.style.top = '50%'
      staticCircle.style.left = '80%'
      staticCircle.style.width = '110px'
      staticCircle.style.height = '110px'
      staticCircle.style.transform = 'translate(-28px, -40px)'
    }
    clearTimeout(doubleTapSeekTimeout)
    doubleTapSeekTimeout = setTimeout(() => {
      (doubleTapSeekElement as HTMLElement).setAttribute('data-side', 'null');
      (doubleTapSeekElement as HTMLElement).style.display = 'none'
      const doubleTapLabel = (doubleTapSeekElement as HTMLElement).querySelector('.ytp-doubletap-tooltip-label')
      if (doubleTapLabel !== null) {
        doubleTapLabel.textContent = '5 seconds'
      }
      staticCircle.style.cssText = 'null'
    }, 500)
  }
}

const changePlaybackSpeed = (speed: number): void => {
  if (document.getElementsByClassName('tp-speeditem')[0] !== null) {
    if (customPrecisionSpeedList.includes(currentSpeed)) {
      const currentSpeedItem = document.querySelector(`#tp-${Number(currentSpeed) * 10000}x-speeditem`) as HTMLElement
      if (currentSpeedItem !== null) {
        currentSpeedItem.ariaChecked = 'false'
      }
    } else {
      customSpeedButton.setAttribute('aria-checked', 'false')
    }
  }

  (player as YTPlayer).setPlaybackSpeed(speed)
  currentSpeed = speed.toFixed(2)

  if (document.getElementsByClassName('tp-speeditem')[0] !== null) {
    if (customPrecisionSpeedList.includes(currentSpeed)) {
      const currentSpeedItem = document.querySelector(`#tp-${Number(currentSpeed) * 10000}x-speeditem`) as HTMLElement
      if (currentSpeedItem !== null) {
        currentSpeedItem.ariaChecked = 'true'
      }
    } else {
      customSpeed = speed.toFixed(2)
      customSpeedButton.style.display = ''
      const customSpeedLabelElement = customSpeedButton.querySelector('.ytp-menuitem-label')
      if (customSpeedLabelElement !== null) {
        customSpeedLabelElement.textContent = `Custom(${Number(customSpeed)})`
      }
      customSpeedButton.setAttribute('aria-checked', 'true')
    }
    if (playerPlaybackButton !== null && playerPlaybackButton !== undefined) {
      playerPlaybackButton.children[2].textContent =
      currentSpeed === '1' || currentSpeed === '1.00'
        ? 'Normal'
        : `${Number(currentSpeed)}`
    }
  }
}
export default onWatchPage
