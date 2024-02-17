import PlaybackMenuItem from './PlaybackMenuItem'

const PlaybackMenuItems = (videoPlayer: HTMLVideoElement, playbackRates: string[]): HTMLElement[] => {
  const CustomRateItem = PlaybackMenuItem({
    dataRate: 'NaN',
    hasAriaChecked: 'false',
    label: 'Custom(NaN)',
    onClick: (event) => {
      changePlaybackRate(videoPlayer, Number(((event.currentTarget as HTMLElement).firstElementChild as HTMLElement).getAttribute('data-rate') as string))
    },
    options: (customRateItem: HTMLElement) => {
      customRateItem.classList.add('hidden')
      customRateItem.setAttribute('data-custom', 'true')
    }
  })

  const playbackRateItems = [CustomRateItem, ...playbackRates
    .sort((a, b) => Number(a) - Number(b))
    .map((playbackRate) => {
      return PlaybackMenuItem({
        dataRate: playbackRate,
        hasAriaChecked: 'false',
        label: `${Number(playbackRate)}x`,
        onClick: () => {
          changePlaybackRate(videoPlayer, Number(playbackRate))
        }
      })
    })]

  return playbackRateItems
}

export const changePlaybackRate = (videoPlayer: HTMLVideoElement, playbackRate: number): void => {
  const prevRateButton = document.querySelector('.toppings__playback-menu-button[aria-checked=true]') as HTMLElement
  prevRateButton.ariaChecked = 'false'

  videoPlayer.playbackRate = playbackRate

  const nextRateButton = document.querySelector(`.toppings__playback-menu-button[data-rate='${playbackRate.toFixed(2)}']`) ?? (document.querySelector('.toppings__playback-menu-item[data-custom="true"]') as HTMLElement).firstElementChild as HTMLElement
  if ((nextRateButton.parentElement as HTMLElement).getAttribute('data-custom') === 'true') {
    (nextRateButton.querySelector('.toppings__playback-menu-content-value') as HTMLElement).textContent = `Custom(${playbackRate}x)`
    nextRateButton.setAttribute('data-rate', playbackRate.toFixed(2));
    (nextRateButton.parentElement as HTMLElement).classList.remove('hidden')
  }
  nextRateButton.ariaChecked = 'true'
}

export default PlaybackMenuItems
