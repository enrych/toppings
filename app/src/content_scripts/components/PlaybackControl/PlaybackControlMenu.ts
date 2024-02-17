import PlaybackMenuItems from './PlaybackMenuItems'
import styles from './PlaybackControlMenuCSS'

const PlaybackControlMenu = (videoPlayer: HTMLVideoElement, playbackRates: string[]): HTMLDivElement => {
  const PlaybackControlMenu = document.createElement('div')
  PlaybackControlMenu.className = 'toppings__playback-control-menu'
  PlaybackControlMenu.classList.add('hidden')
  PlaybackControlMenu.appendChild(styles)

  const PlaybackPanel = document.createElement('div')
  PlaybackPanel.className = 'toppings__playback-panel'
  PlaybackControlMenu.appendChild(PlaybackPanel)

  const PlaybackPanelMenu = document.createElement('ul')
  PlaybackPanelMenu.className = 'toppings__playback-panel-menu'
  PlaybackPanelMenu.role = 'menu'
  PlaybackPanel.appendChild(PlaybackPanelMenu)

  PlaybackPanelMenu.append(...PlaybackMenuItems(videoPlayer, playbackRates))

  return PlaybackControlMenu
}

export default PlaybackControlMenu
