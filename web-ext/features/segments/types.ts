export type SegmentId = string;

export interface Segment {
  id: SegmentId;
  startTime: number; // seconds
  endTime: number; // seconds
  rate: number | null; // null keeps the video's current rate
  loops: number | null; // passes before playback moves on; null loops forever
}

// Segments play in order of start time.
export interface SegmentConfig {
  id: string;
  label: string; // "" until the setup is saved under a name
  segments: Segment[];
}

export interface VideoSegmentData {
  v: 1;
  lastUsed: SegmentConfig | null; // the working copy, written on every edit
  configs: SegmentConfig[];
  defaultConfigId: string | null;
}
