const PlaybackControlButton = (color = '#FFFFFF'): HTMLButtonElement => {
  // Create a button element
  const button = document.createElement('button')

  // Create an SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '24')
  svg.setAttribute('height', '24')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  // Create path elements for the SVG
  const createPath = (d: string): SVGPathElement => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', d)
    path.setAttribute('stroke', color)
    path.setAttribute('stroke-width', '2')
    path.setAttribute('stroke-linejoin', 'round')
    return path
  }

  const path1 = createPath('M4 14C4 12.9494 4.20693 11.9091 4.60896 10.9385C5.011 9.96793 5.60028 9.08601 6.34315 8.34314C7.08602 7.60028 7.96793 7.011 8.93853 6.60896C9.90914 6.20693 10.9494 6 12 6C13.0506 6 14.0909 6.20693 15.0615 6.60897C16.0321 7.011 16.914 7.60028 17.6569 8.34315C18.3997 9.08602 18.989 9.96793 19.391 10.9385C19.7931 11.9091 20 12.9494 20 14')

  const path2 = createPath('M10 15C10 14.7374 10.0517 14.4773 10.1522 14.2346C10.2528 13.992 10.4001 13.7715 10.5858 13.5858C10.7715 13.4001 10.992 13.2528 11.2346 13.1522C11.4773 13.0517 11.7374 13 12 13C12.2626 13 12.5227 13.0517 12.7654 13.1522C13.008 13.2528 13.2285 13.4001 13.4142 13.5858C13.5999 13.7715 13.7473 13.992 13.8478 14.2346C13.9483 14.4773 14 14.7374 14 15')

  const path3 = createPath('M13 13L15 10')

  const path4 = createPath('M20 14V15C20 15.5523 19.5523 16 19 16H5C4.44772 16 4 15.5523 4 15V14')

  // Append path elements to the SVG
  svg.appendChild(path1)
  svg.appendChild(path2)
  svg.appendChild(path3)
  svg.appendChild(path4)

  // Append the SVG to the button
  button.appendChild(svg)

  // Return the created button
  return button
}

// const PlaybackControlButton = document.createElement('button')
// PlaybackControlButton.className = 'styled-element'
// PlaybackControlButton.ariaHasPopup = 'true'
// // PlaybackControlButton.ariaControls = 'true'
// PlaybackControlButton.ariaLabel = 'Playback Control'
// PlaybackControlButton.title = 'Playback Control'

// export default PlaybackControlButton

// const styles = document.createElement('style')
// styles.textContent = `
//   .styled-element {
//     background-color: transparent;
//     border: none;
//     text-align: inherit;
//     font-size: 100%;
//     font-family: inherit;
//     color: white;
//     cursor: pointer;
//     padding: 0 2px;
//     height: 100%;
//   }
// `
// window.onload = () => {
//   document.head.appendChild(styles)
// }
export default PlaybackControlButton
