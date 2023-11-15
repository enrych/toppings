import PlaybackMenuItem from './PlaybackMenuItem'

const PlaybackMenuItems = (videoPlayer: HTMLVideoElement, playbackRates: string[]): HTMLElement[] => {
  const CustomRateButton = PlaybackMenuItem({
    dataRate: 'custom',
    hasAriaChecked: 'false',
    label: 'Custom(NaN)',
    onClick: () => {
      changePlaybackRate(videoPlayer, 1)
    },
    options: (customRateButton: HTMLElement) => {
      customRateButton.style.display = 'none'
    }
  })

  const playbackRateItems = [CustomRateButton, ...playbackRates
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

const changePlaybackRate = (videoPlayer: HTMLVideoElement, playbackRate: number): void => {
  const prevRateItem = document.querySelector('.toppings__playback-menu-button[aria-checked=true]') as HTMLElement
  prevRateItem.ariaChecked = 'false'

  videoPlayer.playbackRate = playbackRate

  const nextRateItem = document.querySelector(`.toppings__playback-menu-button[data-rate='${playbackRate}']`) ?? (document.querySelector('.toppings__playback-menu-item [data-rate=custom]') as HTMLElement)
  nextRateItem.ariaChecked = 'true'
}

export default PlaybackMenuItems
