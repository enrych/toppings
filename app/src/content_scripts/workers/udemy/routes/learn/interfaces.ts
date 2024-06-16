import { type UdemyContext } from '../../../../../background/webAppContextParsers'

export interface LectureData {
  lectureID: string
  courseName: string
}

export interface LearnPageContext extends UdemyContext {
  contextData: UdemyContext['contextData'] & LectureData
}

export type UdemyPlayer = { videoElement: HTMLVideoElement, playbackRate: string | number, currentTime: number, paused: boolean } & LectureData
