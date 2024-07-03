import { UdemyLecture } from "../../../../../background/webAppContextParsers/parseUdemyContext";
export type UdemyPlayer = {
  videoElement: HTMLVideoElement;
  playbackRate: string | number;
  currentTime: number;
  paused: boolean;
} & UdemyLecture;
