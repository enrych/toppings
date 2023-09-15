import { togglePictureInPictureMode } from 'easyfront'

document.addEventListener('keyup', (event) => {
  const targetElement = event.target as Element

  if (
    targetElement.tagName !== 'INPUT' &&
    targetElement.tagName !== 'TEXTAREA' &&
    !targetElement.matches('#contenteditable-root.yt-formatted-string')
  ) {
    // Perform actions for specific key presses
    if (event.key === 'p') {
      try {
        void togglePictureInPictureMode()
      } catch (error) {
        console.error('Failed to enter picture-in-picture mode:', error)
      }
    }
  }
})
