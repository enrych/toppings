import type { Place, Schedule, TimeRule } from "./settings";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

function at(day: Date, hhmm: string): Date {
  const date = new Date(day);
  date.setHours(0, minutesOf(hhmm), 0, 0);
  return date;
}

const overnight = (rule: TimeRule) => minutesOf(rule.end) <= minutesOf(rule.start);

// The window that contains now, if any, as [start, end).
function windowAround(rule: TimeRule, now: Date): { start: Date; end: Date } | null {
  for (const back of [0, 1]) {
    const day = new Date(now.getTime() - back * DAY);
    if (!rule.days.includes(day.getDay() as TimeRule["days"][number])) continue;
    const start = at(day, rule.start);
    const end = at(new Date(day.getTime() + (overnight(rule) ? DAY : 0)), rule.end);
    if (now >= start && now < end) return { start, end };
  }
  return null;
}

export function nextStart(rule: TimeRule, now: Date): Date | null {
  for (let ahead = 0; ahead <= 7; ahead++) {
    const day = new Date(now.getTime() + ahead * DAY);
    if (!rule.days.includes(day.getDay() as TimeRule["days"][number])) continue;
    const start = at(day, rule.start);
    if (start > now) return start;
  }
  return null;
}

export function currentEnd(rule: TimeRule, now: Date): Date | null {
  return windowAround(rule, now)?.end ?? null;
}

export function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

// Leaving takes a margin past the radius, so a position that wobbles at the
// edge does not flip the profile back and forth.
const LEAVE_MARGIN = 1.25;

export function placesHere(places: readonly Place[], here: { latitude: number; longitude: number }, wereHere: readonly string[]): string[] {
  return places
    .filter((place) => {
      const distance = distanceMeters(place, here);
      return distance <= place.radiusMeters * (wereHere.includes(place.id) ? LEAVE_MARGIN : 1);
    })
    .map((place) => place.id);
}

export function isInWindow(schedule: Schedule, now: Date, atPlaces: readonly string[]): boolean {
  if (!schedule.enabled) return false;
  return schedule.rule.kind === "time" ? windowAround(schedule.rule, now) !== null : atPlaces.includes(schedule.rule.placeId);
}

// The first enabled schedule in window wins, so list order is priority.
export function scheduleInCharge(schedules: readonly Schedule[], now: Date, atPlaces: readonly string[], skipped: string | null): Schedule | null {
  return schedules.find((schedule) => schedule.id !== skipped && isInWindow(schedule, now, atPlaces)) ?? null;
}

export interface Upcoming {
  schedule: Schedule;
  change: "start" | "end";
  at: Date;
}

// Time schedules that start or end within the lead, for the heads-up; places
// cannot be foreseen.
export function upcomingChanges(schedules: readonly Schedule[], now: Date, leadMinutes: number, inCharge: Schedule | null): Upcoming[] {
  const horizon = new Date(now.getTime() + leadMinutes * MINUTE);
  const changes: Upcoming[] = [];
  for (const schedule of schedules) {
    if (!schedule.enabled || schedule.rule.kind !== "time") continue;
    if (schedule.id === inCharge?.id) {
      const end = currentEnd(schedule.rule, now);
      if (end && end <= horizon) changes.push({ schedule, change: "end", at: end });
    } else if (!inCharge) {
      const start = nextStart(schedule.rule, now);
      if (start && start <= horizon) changes.push({ schedule, change: "start", at: start });
    }
  }
  return changes;
}

// The next moment anything happens: a heads-up, a start or an end.
export function nextChangeAt(schedules: readonly Schedule[], now: Date, leadMinutes: number): Date | null {
  const lead = leadMinutes * MINUTE;
  const moments: number[] = [];
  for (const schedule of schedules) {
    if (!schedule.enabled || schedule.rule.kind !== "time") continue;
    const start = nextStart(schedule.rule, now);
    const end = currentEnd(schedule.rule, now);
    for (const moment of [start, end]) if (moment) moments.push(moment.getTime() - lead, moment.getTime());
  }
  const future = moments.filter((moment) => moment > now.getTime());
  return future.length ? new Date(Math.min(...future)) : null;
}

export const clock = (date: Date) => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
