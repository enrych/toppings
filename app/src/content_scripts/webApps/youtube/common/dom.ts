import { type ToppingsPanelHeader, type ToppingsMenuItem, type ToppingsMetadataSection, type ToppingsSectionItem } from './interfaces'

export const createPanelHeader = (customHeader: ToppingsPanelHeader): HTMLDivElement => {
  const PanelHeaderExists = document.getElementById(customHeader.panelId) !== null
  if (!PanelHeaderExists) {
    const PanelHeader = document.createElement('div')
    PanelHeader.id = customHeader.panelId

    if (customHeader.panelClass !== undefined) {
      PanelHeader.className = 'ytp-panel-header ' + customHeader.panelClass
    } else {
      PanelHeader.className = 'ytp-panel-header'
    }

    if (customHeader.options !== undefined) {
      customHeader.options(PanelHeader)
    }

    const BackBtnContainer = document.createElement('div')
    BackBtnContainer.className = 'ytp-panel-back-button-container'
    BackBtnContainer.addEventListener('click', customHeader.btnOnClick)
    PanelHeader.appendChild(BackBtnContainer)

    const BackBtn = document.createElement('button')
    BackBtn.className = 'ytp-button ytp-panel-back-button'
    BackBtn.setAttribute('aria-label', customHeader.btnLabel)
    BackBtnContainer.appendChild(BackBtn)

    const PanelTitle = document.createElement('span')
    PanelTitle.className = 'ytp-panel-title'
    PanelTitle.setAttribute('tabindex', '0')
    const PanelHeaderText = document.createTextNode(customHeader.panelTitle)
    PanelTitle.appendChild(PanelHeaderText)
    PanelHeader.appendChild(PanelTitle)

    if (customHeader.panelOptions?.optionsTitle !== undefined) {
      const PanelOptions = document.createElement('button')
      PanelOptions.className = 'ytp-button ytp-panel-options'
      const PanelOptionsText = document.createTextNode(
        customHeader.panelOptions.optionsTitle
      )
      PanelOptions.addEventListener(
        'click',
        customHeader.panelOptions.optionsOnClick
      )
      PanelOptions.appendChild(PanelOptionsText)
      PanelHeader.appendChild(PanelOptions)
    }

    return PanelHeader
  } else {
    throw Error('Panel header already exists.')
  }
}

// To create a Menu Item for YouTube Player Menu
export const createMenuItem = (customMenuItem: ToppingsMenuItem): HTMLDivElement => {
  const MenuItemExists = document.getElementById(customMenuItem.itemId) !== null
  if (!MenuItemExists) {
    const MenuItem = document.createElement('div')
    MenuItem.id = customMenuItem.itemId

    if (customMenuItem.itemClass !== undefined) {
      MenuItem.className = 'ytp-menuitem ' + customMenuItem.itemClass
    } else {
      MenuItem.className = 'ytp-menuitem'
    }

    if (customMenuItem.hasAriaPopUp !== undefined) {
      MenuItem.setAttribute('aria-haspopup', customMenuItem.hasAriaPopUp)
    }
    if (customMenuItem.hasAriaChecked !== undefined) {
      MenuItem.setAttribute('aria-checked', customMenuItem.hasAriaChecked)
    }
    if (customMenuItem.itemRole !== undefined) {
      MenuItem.setAttribute('role', customMenuItem.itemRole)
    }
    if (customMenuItem.itemTabIndex !== undefined) {
      MenuItem.setAttribute('tabindex', customMenuItem.itemTabIndex)
    }
    MenuItem.addEventListener('click', customMenuItem.itemOnClick)
    if (customMenuItem.options !== undefined) {
      customMenuItem.options(MenuItem)
    }

    if (customMenuItem.itemIconPath !== undefined) {
      const MenuItemIcon = document.createElement('div')
      if (customMenuItem.itemClass !== undefined) {
        MenuItemIcon.className = 'ytp-menuitem-icon ' + customMenuItem.itemClass
      } else {
        MenuItemIcon.className = 'ytp-menuitem-icon'
      }

      const MenuItemIconSVG = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      )
      const MenuItemSVGPath = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      )
      MenuItemIconSVG.setAttribute('height', '24')
      MenuItemIconSVG.setAttribute('width', '24')
      MenuItemIconSVG.setAttribute('viewBox', '0 0 24 24')
      MenuItemSVGPath.setAttribute('d', customMenuItem.itemIconPath)
      MenuItemSVGPath.setAttribute('fill', 'white')
      MenuItemIconSVG.appendChild(MenuItemSVGPath)
      MenuItemIcon.appendChild(MenuItemIconSVG)
      MenuItem.appendChild(MenuItemIcon)
    }

    if (customMenuItem.itemLabel !== undefined) {
      // Menu Item Label
      const MenuItemLabel = document.createElement('div')
      if (customMenuItem.itemClass !== undefined) {
        MenuItemLabel.className = 'ytp-menuitem-label ' + customMenuItem.itemClass
      } else {
        MenuItemLabel.className = 'ytp-menuitem-label'
      }

      const MenuItemLabelText = document.createTextNode(customMenuItem.itemLabel)
      MenuItemLabel.appendChild(MenuItemLabelText)
      MenuItem.appendChild(MenuItemLabel)
    }

    if (customMenuItem.itemContent !== undefined) {
      // Menu Item Content
      const MenuItemContent = document.createElement('div')
      if (customMenuItem.itemClass !== undefined) {
        MenuItemContent.className = 'ytp-menuitem-content ' + customMenuItem.itemClass
      } else {
        MenuItemContent.className = 'ytp-menuitem-content'
      }
      MenuItemContent.appendChild(customMenuItem.itemContent)
      MenuItem.appendChild(MenuItemContent)
    }

    return MenuItem
  } else {
    throw Error('Menu item already exists.')
  }
}

// To create a custom metadata section in the metadata action bar assuming its loaded
export const createMetadataSection = (customMetadataSection: ToppingsMetadataSection): HTMLDivElement => {
  const MetadataSectionExists = document.getElementById(customMetadataSection.sectionId) !== null
  if (!MetadataSectionExists) {
    const MetadataSection = document.createElement('div')
    MetadataSection.id = customMetadataSection.sectionId

    if (customMetadataSection.sectionClass !== undefined) {
      MetadataSection.className = 'metadata-section ' + customMetadataSection.sectionClass
    } else {
      MetadataSection.className = 'metadata-section'
    }

    if (customMetadataSection.options !== undefined) {
      customMetadataSection.options(MetadataSection)
    }

    if (customMetadataSection.headerIcon !== undefined) {
      const headerIcon = document.createElement('img')
      headerIcon.className = 'metadata-section-icon'
      headerIcon.src = customMetadataSection.headerIcon
      MetadataSection.appendChild(headerIcon)
    }

    if (customMetadataSection.headerTitle !== undefined) {
      const headerTitle = document.createElement('h3')
      headerTitle.className = 'metadata-section-title'
      headerTitle.textContent = customMetadataSection.headerTitle
      MetadataSection.appendChild(headerTitle)
    }

    if (customMetadataSection.items !== undefined) {
      MetadataSection.append(...customMetadataSection.items)
    }

    return MetadataSection
  } else {
    throw Error('Metadata section already exists.')
  }
}

export const createSectionItem = (customSectionItem: ToppingsSectionItem): HTMLDivElement => {
  const SectionItem = document.createElement('div')
  SectionItem.id = customSectionItem.id

  if (customSectionItem.className !== undefined) {
    SectionItem.className = 'section-item ' + customSectionItem.className
  } else {
    SectionItem.className = 'section-item'
  }

  if (customSectionItem.options !== undefined) {
    customSectionItem.options(SectionItem)
  }

  SectionItem.append(...customSectionItem.children)

  return SectionItem
}
