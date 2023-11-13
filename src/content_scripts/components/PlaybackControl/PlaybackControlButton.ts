const PlaybackControlButton = (color = '#FFFFFF'): HTMLButtonElement => {
  const button = document.createElement('button')
  button.className = 'toppings__playback-control-button'
  button.ariaHasPopup = 'true'
  button.ariaLabel = 'Playback Control'
  button.title = 'Playback Control'
  button.style.backgroundColor = 'transparent'
  button.style.border = 'none'
  button.style.textAlign = 'inherit'
  button.style.fontSize = '100%'
  button.style.fontFamily = 'inherit'
  button.style.color = 'white'
  button.style.cursor = 'pointer'
  button.style.padding = '0 2px'
  button.style.height = '100%'
  button.addEventListener('click', () => {
    console.log('this should work')
  })

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('height', '100%')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const paths = [
    {
      d: 'M4 14C4 12.9494 4.20693 11.9091 4.60896 10.9385C5.011 9.96793 5.60028 9.08601 6.34315 8.34314C7.08602 7.60028 7.96793 7.011 8.93853 6.60896C9.90914 6.20693 10.9494 6 12 6C13.0506 6 14.0909 6.20693 15.0615 6.60897C16.0321 7.011 16.914 7.60028 17.6569 8.34315C18.3997 9.08602 18.989 9.96793 19.391 10.9385C19.7931 11.9091 20 12.9494 20 14',
      stroke: color,
      strokeWidth: '1',
      strokeLinejoin: 'round'
    },
    {
      d: 'M10 15C10 14.7374 10.0517 14.4773 10.1522 14.2346C10.2528 13.992 10.4001 13.7715 10.5858 13.5858C10.7715 13.4001 10.992 13.2528 11.2346 13.1522C11.4773 13.0517 11.7374 13 12 13C12.2626 13 12.5227 13.0517 12.7654 13.1522C13.008 13.2528 13.2285 13.4001 13.4142 13.5858C13.5999 13.7715 13.7473 13.992 13.8478 14.2346C13.9483 14.4773 14 14.7374 14 15',
      stroke: color,
      strokeWidth: '1',
      strokeLinejoin: 'round'
    },
    { d: 'M13 13L15 10', stroke: color, strokeWidth: '1', strokeLinecap: 'round', strokeLinejoin: 'round' },
    { d: 'M20 14V15C20 15.5523 19.5523 16 19 16H5C4.44772 16 4 15.5523 4 15V14', stroke: color, strokeWidth: '1', strokeLinecap: 'round', strokeLinejoin: 'round' }
  ]

  paths.forEach((pathData) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', pathData.d)
    path.setAttribute('stroke', pathData.stroke ?? '')
    path.setAttribute('stroke-width', pathData.strokeWidth ?? '')
    path.setAttribute('stroke-linecap', pathData.strokeLinecap ?? '')
    path.setAttribute('stroke-linejoin', pathData.strokeLinejoin ?? '')
    svg.appendChild(path)
  })
  button.appendChild(svg)

  return button
}

export default PlaybackControlButton
