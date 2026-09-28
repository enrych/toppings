import { describe, expect, test } from "bun:test";
import { clock, currentEnd, isInWindow, nextChangeAt, nextStart, placesHere, scheduleInCharge, upcomingChanges } from "./rules";
import type { Place, Schedule, TimeRule } from "./settings";

// 2026-09-28 is a Monday; dates are local, like the rules.
const on = (day: number, hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(2026, 8, day, h, m);
};
const weekdays: TimeRule = { kind: "time", days: [1, 2, 3, 4, 5], start: "09:00", end: "18:00" };
const nights: TimeRule = { kind: "time", days: [5], start: "22:00", end: "02:00" };
const schedule = (id: string, rule: Schedule["rule"], enabled = true): Schedule => ({ id, profileId: `profile-${id}`, rule, enabled });

describe("time rules", () => {
  test("a weekday window covers its hours on its days only", () => {
    expect(isInWindow(schedule("w", weekdays), on(28, "09:00"), [])).toBe(true);
    expect(isInWindow(schedule("w", weekdays), on(28, "17:59"), [])).toBe(true);
    expect(isInWindow(schedule("w", weekdays), on(28, "18:00"), [])).toBe(false);
    expect(isInWindow(schedule("w", weekdays), on(27, "12:00"), [])).toBe(false);
  });

  test("an overnight window belongs to the day it starts", () => {
    expect(isInWindow(schedule("n", nights), on(25, "23:00"), [])).toBe(true);
    expect(isInWindow(schedule("n", nights), on(26, "01:30"), [])).toBe(true);
    expect(isInWindow(schedule("n", nights), on(26, "23:00"), [])).toBe(false);
    expect(currentEnd(nights, on(25, "23:00"))).toEqual(on(26, "02:00"));
  });

  test("the next start skips to the next listed day", () => {
    expect(nextStart(weekdays, on(26, "12:00"))).toEqual(on(28, "09:00"));
    expect(nextStart(weekdays, on(28, "08:00"))).toEqual(on(28, "09:00"));
    expect(nextStart(weekdays, on(28, "10:00"))).toEqual(on(29, "09:00"));
  });

  test("a disabled schedule is never in window", () => {
    expect(isInWindow(schedule("w", weekdays, false), on(28, "10:00"), [])).toBe(false);
  });
});

describe("which schedule is in charge", () => {
  test("list order is priority, and a skipped schedule gives way until its window ends", () => {
    const first = schedule("a", weekdays);
    const second = schedule("b", { ...weekdays, start: "08:00" });
    expect(scheduleInCharge([first, second], on(28, "10:00"), [], null)?.id).toBe("a");
    expect(scheduleInCharge([first, second], on(28, "10:00"), [], "a")?.id).toBe("b");
  });

  test("a place schedule is in charge while there", () => {
    const work = schedule("p", { kind: "place", placeId: "work" });
    expect(scheduleInCharge([work], on(28, "10:00"), ["work"], null)?.id).toBe("p");
    expect(scheduleInCharge([work], on(28, "10:00"), [], null)).toBeNull();
  });
});

describe("heads-up", () => {
  test("a start or end within the lead is announced", () => {
    const work = schedule("w", weekdays);
    expect(upcomingChanges([work], on(28, "08:56"), 5, null).map((c) => [c.change, clock(c.at)])).toEqual([["start", "09:00"]]);
    expect(upcomingChanges([work], on(28, "08:50"), 5, null)).toEqual([]);
    expect(upcomingChanges([work], on(28, "17:57"), 5, work).map((c) => [c.change, clock(c.at)])).toEqual([["end", "18:00"]]);
  });
});

describe("next change", () => {
  test("is the next heads-up, start or end, whichever comes first", () => {
    const work = schedule("w", weekdays);
    expect(nextChangeAt([work], on(28, "08:00"), 5)).toEqual(on(28, "08:55"));
    expect(nextChangeAt([work], on(28, "08:56"), 5)).toEqual(on(28, "09:00"));
    expect(nextChangeAt([work], on(28, "12:00"), 5)).toEqual(on(28, "17:55"));
    expect(nextChangeAt([], on(28, "12:00"), 5)).toBeNull();
  });
});

describe("places", () => {
  const office: Place = { id: "work", name: "Work", latitude: 52.52, longitude: 13.405, radiusMeters: 200 };
  test("inside the radius counts as there; leaving needs a margin past it", () => {
    const near = { latitude: 52.5215, longitude: 13.405 };
    const edge = { latitude: 52.5222, longitude: 13.405 };
    expect(placesHere([office], near, [])).toEqual(["work"]);
    expect(placesHere([office], edge, [])).toEqual([]);
    expect(placesHere([office], edge, ["work"])).toEqual(["work"]);
  });
});
