import { defineSettings } from "@/kernel/settings";

// 0 is Sunday, as in Date#getDay.
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// "HH:MM", 24-hour. A window whose end is not after its start runs overnight
// and belongs to the day it starts on.
export interface TimeRule {
  kind: "time";
  days: Weekday[];
  start: string;
  end: string;
}

export interface PlaceRule {
  kind: "place";
  placeId: string;
}

export interface Schedule {
  id: string;
  profileId: string;
  rule: TimeRule | PlaceRule;
  enabled: boolean;
}

export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

// Local, never synced: places are where the user lives and works.
export const schedulesStore = defineSettings<{ schedules: Schedule[]; places: Place[] }>(
  "schedules",
  { schedules: [], places: [] },
  { area: "local" },
);
