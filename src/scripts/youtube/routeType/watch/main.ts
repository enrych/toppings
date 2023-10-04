import { YTPlayer, createMenuItem } from 'blendora'
import loadElement from '../../../lib/loadElement'

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
let doubleTapSeekElement: HTMLElement
let player: YTPlayer
let playerSettingsButton: HTMLElement
let playerPlaybackButton: HTMLElement
let customSpeed: string
let customSpeedButton: HTMLElement
let doubleTapSeekTimeout: number

const onWatchPage = async (contentID: string): Promise<void> => {
  try {
    player = player ?? await loadPlayer(contentID)
    setWatchDefaults()

    doubleTapSeekElement = doubleTapSeekElement ?? document.querySelector('.ytp-doubletap-ui-legacy') as HTMLElement

    playerSettingsButton = playerSettingsButton ?? await loadSettingsBtn()
    document.addEventListener('keydown', useShortcuts)
    playerSettingsButton.removeEventListener('click', onSettingsMenu)
    playerSettingsButton.addEventListener('click', onSettingsMenu, { once: true })
  } catch (error) {
    console.error('Failed to successfully load WatchPage:', error)
  }
}

const setWatchDefaults = (): void => {
  currentSpeed = Number(defaultSpeed).toFixed(2)
  player.setPlaybackSpeed(parseFloat(defaultSpeed))

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

const loadPlayer = async (contentID: string): Promise<YTPlayer> => {
  try {
    const playerVideoElement = await loadElement('video', 10000, 500) as HTMLVideoElement
    const loadedPlayer = new YTPlayer(playerVideoElement, { videoID: contentID })
    return loadedPlayer
  } catch (error) {
    console.error('Failed to load player:', error)
    throw error
  }
}

const loadSettingsBtn = async (): Promise<HTMLElement> => {
  try {
    const playerSettingsButton = await loadElement('.ytp-settings-button', 10000, 500)
    return playerSettingsButton
  } catch (error) {
    console.error('Failed to load settings button:', error)
    throw error
  }
}

const onSettingsMenu = (): void => {
  loadPlaybackSpeedBtn().then(button => {
    playerPlaybackButton = button
    playerPlaybackButton.children[2].textContent =
    currentSpeed === '1' || currentSpeed === '1.00'
      ? 'Normal'
      : `${Number(currentSpeed)}`
    playerPlaybackButton.addEventListener(
      'click',
      onPlaybackSpeedMenu
    )
  }).catch((error) => {
    console.error('Failed to load playback speed button:', error)
  })
}

const loadPlaybackSpeedBtn = async (): Promise<HTMLElement> => {
  return await new Promise<HTMLElement>((resolve, reject) => {
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
          return
        }
      }
    }, 200)

    const checkTimeout = setTimeout(() => {
      clearInterval(checkInterval)
      reject(new Error('Playback speed button not found within 2000ms.'))
    }, 2000)
  })
}

const onPlaybackSpeedMenu = (): void => {
  loadPlaybackSpeedMenu().then(firstMenuItemLabel => {
    const menuPanelOptions = document.getElementsByClassName('ytp-panel-options')[0] as HTMLElement
    menuPanelOptions.style.display = 'none'

    const panelMenu = document.getElementsByClassName('ytp-panel-menu')[0] as HTMLElement
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
  }).catch((error) => {
    console.error('Failed to load playback speed items:', error)
  })
}

const loadPlaybackSpeedMenu = async (): Promise<HTMLElement> => {
  return await new Promise<HTMLElement>((resolve, reject) => {
    const checkInterval = setInterval(() => {
      const firstMenuItemLabel = document.getElementsByClassName('ytp-menuitem-label')[0]
      const toppingsMenuItem = document.getElementsByClassName('tp-speeditem')[0]
      if (firstMenuItemLabel?.textContent === '0.25' && toppingsMenuItem === undefined) {
        clearInterval(checkInterval)
        clearTimeout(checkTimeout)
        resolve(firstMenuItemLabel as HTMLElement)
      } else if (toppingsMenuItem !== undefined) {
        clearInterval(checkInterval)
        clearTimeout(checkTimeout)
        resolve(firstMenuItemLabel as HTMLElement)
      }
    }, 50)

    const checkTimeout = setTimeout(() => {
      clearInterval(checkInterval)
      reject(new Error('Playback speeds not found within 2000ms.'))
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
      player.seekCurrentTime('backward', +seekBackward)
      onDoubleTapSeek('back', seekBackward)
    } else if (event.key === `${seekForwardShortcut.toLowerCase()}`) {
      player.seekCurrentTime('forward', +seekForward)
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
  doubleTapSeekElement.setAttribute('data-side', dataSide)
  doubleTapSeekElement.style.display = ''
  const doubleTapSeekLabel = doubleTapSeekElement.querySelector('.ytp-doubletap-tooltip-label') as HTMLElement
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
    doubleTapSeekElement.setAttribute('data-side', 'null')
    doubleTapSeekElement.style.display = 'none'
    const doubleTapLabel = doubleTapSeekElement.querySelector('.ytp-doubletap-tooltip-label')
    if (doubleTapLabel !== null) {
      doubleTapLabel.textContent = '5 seconds'
    }
    staticCircle.style.cssText = 'null'
  }, 500)
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

  player.setPlaybackSpeed(speed)
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
