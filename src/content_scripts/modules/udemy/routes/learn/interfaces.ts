import { type UdemyAppInfo } from '../../../../../common/interfaces'
import { type VideoPlayer } from '../../../../common/interfaces'

export interface LearnPageInfo extends UdemyAppInfo {
  details: {
    routeType: string
    courseName: string
    lectureId: string
  }
}

export interface LectureInfo {
  lectureId: string
  courseName: string
}

export interface UdemyPlayer extends VideoPlayer {
  lectureId: string
  courseName: string
}
