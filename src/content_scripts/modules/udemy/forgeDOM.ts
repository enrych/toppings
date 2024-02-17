export interface CustomMenuButton {
  dataName: string
  dataValue: string
  buttonClass?: string
  hasAriaChecked?: string
  buttonRole?: string
  buttonTabIndex?: string
  buttonLabel: string
  buttonOnClick: (event: Event) => void
  options?: (target: HTMLLIElement) => void
}

const createMenuButton = (customMenuButton: CustomMenuButton): HTMLLIElement => {
  const MenuButton = document.querySelector(`${customMenuButton.buttonClass !== undefined ? `.${customMenuButton.buttonClass} ` : ''}button[data-${customMenuButton.dataName}='${customMenuButton.dataValue}']`) as HTMLButtonElement
  if (MenuButton === null) {
    const MenuListItem = document.createElement('li')
    MenuListItem.setAttribute('role', 'none')
    if (customMenuButton.buttonClass !== undefined) {
      MenuListItem.className += `${customMenuButton.buttonClass}`
    }
    MenuListItem.addEventListener('click', customMenuButton.buttonOnClick)
    if (customMenuButton.options !== undefined) {
      customMenuButton.options(MenuListItem)
    }

    const MenuButton = document.createElement('button')
    MenuButton.setAttribute('type', 'button')
    MenuButton.className = 'ud-btn ud-btn-large ud-btn-ghost ud-text-sm ud-block-list-item ud-block-list-item-small ud-block-list-item-neutral'
    MenuButton.setAttribute(`data-${customMenuButton.dataName}`, customMenuButton.dataValue)
    MenuListItem.appendChild(MenuButton)

    if (customMenuButton.hasAriaChecked !== undefined) {
      MenuButton.setAttribute('aria-checked', customMenuButton.hasAriaChecked)
    }
    if (customMenuButton.buttonRole !== undefined) {
      MenuButton.setAttribute('role', customMenuButton.buttonRole)
    }
    if (customMenuButton.buttonTabIndex !== undefined) {
      MenuButton.setAttribute('tabindex', customMenuButton.buttonTabIndex)
    }

    const ButtonLabelContainer = document.createElement('div')
    ButtonLabelContainer.className = 'ud-block-list-item-content'
    MenuButton.appendChild(ButtonLabelContainer)

    const ButtonLabel = document.createElement('span')
    ButtonLabel.className = 'ud-text-bold'
    ButtonLabel.textContent = customMenuButton.buttonLabel
    ButtonLabelContainer.appendChild(ButtonLabel)

    return MenuListItem
  } else {
    return MenuButton.parentElement as HTMLLIElement
  }
}

export default { createMenuButton }
