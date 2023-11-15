import styles from './PlaybackControlButtonCSS'

const PlaybackControlButton = (iconColor = '#FFFFFF'): HTMLButtonElement => {
  const PlaybackControlButton = document.createElement('button')
  PlaybackControlButton.ariaHasPopup = 'true'
  PlaybackControlButton.ariaLabel = 'Playback Control'
  PlaybackControlButton.className = 'toppings__playback-control-button'
  PlaybackControlButton.title = 'Playback Control'
  PlaybackControlButton.appendChild(styles)

  const controlButtonSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  controlButtonSVG.setAttribute('fill', 'none')
  controlButtonSVG.setAttribute('height', '100%')
  controlButtonSVG.setAttribute('viewBox', '0 0 24 24')
  controlButtonSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const buttonSVGPaths = [
    {
      d: 'M4 14C4 12.9494 4.20693 11.9091 4.60896 10.9385C5.011 9.96793 5.60028 9.08601 6.34315 8.34314C7.08602 7.60028 7.96793 7.011 8.93853 6.60896C9.90914 6.20693 10.9494 6 12 6C13.0506 6 14.0909 6.20693 15.0615 6.60897C16.0321 7.011 16.914 7.60028 17.6569 8.34315C18.3997 9.08602 18.989 9.96793 19.391 10.9385C19.7931 11.9091 20 12.9494 20 14',
      stroke: iconColor,
      strokeWidth: '1',
      strokeLinejoin: 'round'
    },
    {
      d: 'M10 15C10 14.7374 10.0517 14.4773 10.1522 14.2346C10.2528 13.992 10.4001 13.7715 10.5858 13.5858C10.7715 13.4001 10.992 13.2528 11.2346 13.1522C11.4773 13.0517 11.7374 13 12 13C12.2626 13 12.5227 13.0517 12.7654 13.1522C13.008 13.2528 13.2285 13.4001 13.4142 13.5858C13.5999 13.7715 13.7473 13.992 13.8478 14.2346C13.9483 14.4773 14 14.7374 14 15',
      stroke: iconColor,
      strokeWidth: '1',
      strokeLinejoin: 'round'
    },
    { d: 'M13 13L15 10', stroke: iconColor, strokeWidth: '1', strokeLinecap: 'round', strokeLinejoin: 'round' },
    { d: 'M20 14V15C20 15.5523 19.5523 16 19 16H5C4.44772 16 4 15.5523 4 15V14', stroke: iconColor, strokeWidth: '1', strokeLinecap: 'round', strokeLinejoin: 'round' }
  ]

  buttonSVGPaths.forEach((path) => {
    const buttonSVGPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    buttonSVGPath.setAttribute('d', path.d)
    buttonSVGPath.setAttribute('stroke', path.stroke ?? 'initial')
    buttonSVGPath.setAttribute('stroke-width', path.strokeWidth ?? 'initial')
    buttonSVGPath.setAttribute('stroke-linecap', path.strokeLinecap ?? 'initial')
    buttonSVGPath.setAttribute('stroke-linejoin', path.strokeLinejoin ?? 'initial')
    controlButtonSVG.appendChild(buttonSVGPath)
  })
  PlaybackControlButton.appendChild(controlButtonSVG)

  return PlaybackControlButton
}

export default PlaybackControlButton
