import { UdemyLecture } from "../../../../../background/parsers//parseUdemyContext";
export type UdemyPlayer = {
  videoElement: HTMLVideoElement;
  playbackRate: string | number;
  currentTime: number;
  paused: boolean;
} & UdemyLecture;
