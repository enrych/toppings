import { defineSettings } from "@/kernel/settings";

export interface ScheduleNotice {
  id: number;
  text: string;
}

// Written only by the background runner; the popup and YouTube tabs read it.
export interface ScheduleState {
  inCharge: string | null;
  // What the profile goes back to when the schedule in charge ends.
  profileBefore: string | null;
  // Skipped from the popup for the window it was in: until that window's end
  // for a time schedule, or until leaving for a place (until is then null).
  skipped: { id: string; until: number | null } | null;
  atPlaces: string[];
  // Why places could not be checked, for the options page and popup to say.
  locationError: string | null;
  announced: string[];
  // A sentence for the user, shown once by the YouTube tab they are on.
  notice: ScheduleNotice | null;
  status: string;
}

export const scheduleState = defineSettings<ScheduleState>(
  "schedule-state",
  { inCharge: null, profileBefore: null, skipped: null, atPlaces: [], locationError: null, announced: [], notice: null, status: "" },
  { area: "local" },
);
