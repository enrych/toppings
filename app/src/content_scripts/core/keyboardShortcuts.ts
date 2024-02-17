import togglePictureInPictureMode from './pictureInPicture'

const onShortcutKeyUp = (event: KeyboardEvent): void => {
  if (isElement(event.target)) {
    const targetElement = event.target

    if (
      targetElement.tagName !== 'INPUT' &&
      targetElement.tagName !== 'TEXTAREA' &&
      !targetElement.matches('#contenteditable-root.yt-formatted-string')
    ) {
      if (event.key === 'p') {
        try {
          void togglePictureInPictureMode()
        } catch (error) {
          console.error('Failed to enter picture-in-picture mode:', error)
        }
      }
    }
  }
}

export default onShortcutKeyUp

function isElement (target: EventTarget | null): target is Element {
  return target !== null && target instanceof Element
}
