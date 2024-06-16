/**
 * Toggles the Picture-in-Picture mode for the primary video element.
 * If the primary video is already in Picture-in-Picture mode, it will exit the mode.
 * If the primary video is not in Picture-in-Picture mode, it will request to enter the mode.
 *
 * @returns {Promise<void>} A promise that resolves when the Picture-in-Picture mode is toggled.
 */
const togglePictureInPictureMode = async (): Promise<void> => {
  const video = getPrimaryVideo()
  if (video === null || video === undefined) {
    return
  }

  // If the video is already in Picture-in-Picture mode, exit the mode
  if (video.hasAttribute('data-pip')) {
    void document.exitPictureInPicture()
    return
  }

  // Request to enter Picture-in-Picture mode for the video
  await requestPictureInPictureMode(video)
}

/**
   * Retrieves the primary video element from the document.
   *
   * @returns {HTMLVideoElement} The primary video element, or undefined if no valid video element is found.
   */
const getPrimaryVideo = (): HTMLVideoElement | undefined => {
  const videos = Array.from(document.querySelectorAll('video'))
    .filter((video) => video.readyState !== 0)
    .filter((video) => !video.disablePictureInPicture)
    .sort((a, b) => {
      const aRect = a.getClientRects()[0] || { width: 0, height: 0 }
      const bRect = b.getClientRects()[0] || { width: 0, height: 0 }
      return bRect.width * bRect.height - aRect.width * aRect.height
    })

  if (videos.length === 0) {
    return undefined
  }

  // Return the first (primary) video element
  return videos[0]
}

/**
   * Requests the browser to enter picture-in-picture mode for the specified video element.
   *
   * @param {HTMLVideoElement} video - The video element for which to enable picture-in-picture mode.
   * @returns {Promise} A promise that resolves when the picture-in-picture mode is successfully activated.
   *
   * @example
   * const videoElement = document.getElementById('myVideo');
   * await requestPictureInPictureMode(videoElement);
   * // Picture-in-picture mode activated for the video element.
   */
const requestPictureInPictureMode = async (video: HTMLVideoElement): Promise<void> => {
  await video.requestPictureInPicture()
  video.setAttribute('data-pip', 'true')

  video.addEventListener(
    'leavepictureinpicture',
    (event) => {
      video.removeAttribute('data-pip')
    },
    { once: true }
  )

  new ResizeObserver(handlePictureInPictureVideoChanges).observe(video)
}

/**
   * Callback function for observing changes to the picture-in-picture video element.
   * It checks if the observed video should be updated for picture-in-picture mode.
   *
   * @param {Array<ResizeObserverEntry>} entries - An array of ResizeObserverEntry objects containing information about the observed video.
   * @param {ResizeObserver} observer - The ResizeObserver instance used for observing the video element.
   *
   * @example
   * const observer = new ResizeObserver(handlePictureInPictureVideoChanges);
   * observer.observe(videoElement);
   * // Observing changes to the video element for picture-in-picture mode.
   */
const handlePictureInPictureVideoChanges = (entries: ResizeObserverEntry[], observer: ResizeObserver): void => {
  const observedVideoElement = entries[0].target

  if (document.querySelector('[data-pip]') !== null) {
    observer.unobserve(observedVideoElement)
    return
  }

  const video = getPrimaryVideo()

  if (video !== undefined && !video.hasAttribute('data-pip')) {
    observer.unobserve(observedVideoElement)
    void requestPictureInPictureMode(video)
  }
}

export default togglePictureInPictureMode
