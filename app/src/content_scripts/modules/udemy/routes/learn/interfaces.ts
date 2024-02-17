import { type UdemyContext } from '../../../../../common/interfaces'

export interface LectureData {
  lectureID: string
  courseName: string
}

export interface LearnPageContext extends UdemyContext {
  body: UdemyContext['body'] & LectureData
}

export type UdemyPlayer = { videoElement: HTMLVideoElement, playbackRate: string | number, currentTime: number, paused: boolean } & LectureData
