class VideoPlayer {
  // The minimum playback rate allowed for videos
  static MIN_PLAYBACK_RATE = 0.0625

  // The maximum playback rate allowed for videos
  static MAX_PLAYBACK_RATE = 16.0

  videoElement: HTMLVideoElement

  constructor (videoElement: HTMLVideoElement) {
    this.videoElement = videoElement
  }

  getPlaybackSpeed (): number {
    return this.videoElement.playbackRate
  }

  setPlaybackSpeed (speed: number): { status: 'SUCCESS' | 'ERROR', response: string } {
    if (speed >= VideoPlayer.MIN_PLAYBACK_RATE && speed <= VideoPlayer.MAX_PLAYBACK_RATE) {
      this.videoElement.playbackRate = speed
      return { status: 'SUCCESS', response: `Current Speed: ${speed}` }
    } else {
      return { status: 'ERROR', response: 'Invalid Speed' }
    }
  }

  getCurrentTime (): number {
    return this.videoElement.currentTime
  }

  setCurrentTime (seconds: number): { status: 'SUCCESS' | 'ERROR', response: string } {
    this.videoElement.currentTime = seconds
    return { status: 'SUCCESS', response: `Current Time: ${seconds} seconds` }
  }

  getDuration (): number {
    return this.videoElement.duration
  }

  seekCurrentTime (direction: 'forward' | 'backward', seconds: number): { status: 'SUCCESS' | 'ERROR', response: string } {
    if (direction === 'forward') {
      this.videoElement.currentTime += seconds
      return {
        status: 'SUCCESS',
        response: `Current Time: ${this.videoElement.currentTime} seconds`
      }
    } else if (direction === 'backward') {
      this.videoElement.currentTime -= seconds
      return {
        status: 'SUCCESS',
        response: `Current Time: ${this.videoElement.currentTime} seconds`
      }
    } else {
      return {
        status: 'ERROR',
        response: 'Invalid Direction'
      }
    }
  }
}

interface YTPlayerData {
  videoID: string
}

class YTPlayer extends VideoPlayer {
  private readonly _videoID: string

  constructor (videoElement: HTMLVideoElement, data: YTPlayerData) {
    super(videoElement)
    this._videoID = data.videoID
  }

  get videoID (): string {
    return this._videoID
  }
}

export default YTPlayer
