import styles from './PlaybackMenuItemCSS'

interface PlaybackMenuItemConfig {
  dataRate: string
  hasAriaChecked: string
  label: string
  onClick: (event: Event) => void
  options?: (target: HTMLLIElement) => void
}

const PlaybackMenuItem = (config: PlaybackMenuItemConfig): HTMLLIElement => {
  const MenuListItem = document.createElement('li')
  MenuListItem.className = 'toppings__playback-menu-item'
  MenuListItem.setAttribute('role', 'none')
  MenuListItem.addEventListener('click', config.onClick)
  if (config.options !== undefined) {
    config.options(MenuListItem)
  }

  const MenuItemButton = document.createElement('button')
  MenuItemButton.className = 'toppings__playback-menu-button'
  MenuItemButton.setAttribute('type', 'button')
  MenuItemButton.setAttribute('role', 'menuitemradio')
  MenuItemButton.setAttribute('tabindex', '-1')
  MenuItemButton.setAttribute('aria-checked', config.hasAriaChecked)
  MenuItemButton.setAttribute('data-rate', config.dataRate)
  MenuListItem.appendChild(MenuItemButton)

  const MenuButtonContent = document.createElement('div')
  MenuButtonContent.className = 'toppings__playback-menu-button-content'
  MenuItemButton.appendChild(MenuButtonContent)

  const MenuContentValue = document.createElement('span')
  MenuContentValue.className = 'toppings__playback-menu-content-value'
  MenuContentValue.textContent = config.label
  MenuButtonContent.appendChild(MenuContentValue)

  MenuListItem.appendChild(styles)

  return MenuListItem
}

export default PlaybackMenuItem
