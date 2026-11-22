import { beforeEach, describe, expect, test } from "bun:test";
import { appSettings } from "@/kernel/appSettings";
import { profileStore, setActiveProfileId } from "@/features/profiles/store";
import { checkLocation, dropSchedulesOfDeletedProfiles, skipInCharge, syncAlarms, tick } from "./background";
import { schedulesStore, type Place, type Schedule } from "./settings";
import { scheduleState } from "./state";

const badge = { text: "", title: "" };
const alarms = new Map<string, { when?: number; periodInMinutes?: number }>();
Object.assign(chrome, {
  alarms: {
    create: async (name: string, info: { when?: number; periodInMinutes?: number }) => void alarms.set(name, info),
    get: async (name: string) => (alarms.has(name) ? { name, ...alarms.get(name) } : undefined),
    clear: async (name: string) => alarms.delete(name),
  },
  action: {
    setBadgeText: async ({ text }: { text: string }) => void (badge.text = text),
    setBadgeBackgroundColor: async () => {},
    setTitle: async ({ title }: { title: string }) => void (badge.title = title),
  },
});

// 2026-09-28 is a Monday.
const at = (hhmm: string, day = 28) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(2026, 8, day, h, m);
};
const work: Schedule = { id: "work", profileId: "preset:audio", enabled: true, rule: { kind: "time", days: [1, 2, 3, 4, 5], start: "09:00", end: "18:00" } };
const office: Place = { id: "office", name: "Office", latitude: 52.52, longitude: 13.405, radiusMeters: 250 };
const atOffice: Schedule = { id: "at-office", profileId: "preset:audio", enabled: true, rule: { kind: "place", placeId: "office" } };
const inside = { latitude: 52.5205, longitude: 13.405, accuracyMeters: 30 };
const farAway = { latitude: 52.6, longitude: 13.405, accuracyMeters: 30 };
const active = async () => (await profileStore.get()).activeProfileId;

beforeEach(async () => {
  await chrome.storage.local.clear();
  await chrome.storage.sync.clear();
  await schedulesStore.set({ schedules: [work] });
  await setActiveProfileId("preset:focus");
});

describe("schedule runner", () => {
  test("switches on at the start and back to the earlier profile at the end", async () => {
    await tick(at("09:00"));
    expect(await active()).toBe("preset:audio");
    expect((await scheduleState.get()).notice?.text).toBe("Schedule · Audio until 18:00");
    expect(badge.text).toBe("A");
    expect(badge.title).toBe("Toppings · Audio on by schedule until 18:00");
    await tick(at("18:00"));
    expect(await active()).toBe("preset:focus");
    expect((await scheduleState.get()).notice?.text).toBe("Schedule ended · Focus");
    expect(badge.text).toBe("");
  });

  test("a profile picked mid-window is left alone when the window ends", async () => {
    await tick(at("09:00"));
    await setActiveProfileId(null);
    await tick(at("11:00"));
    expect(await active()).toBeNull();
    await tick(at("18:00"));
    expect(await active()).toBeNull();
  });

  test("sets an alarm for the next change, so it lands on time rather than at the next minute's tick", async () => {
    await tick(at("08:00"));
    expect(alarms.get("schedules-change")?.when).toBe(at("08:55").getTime());
    await tick(at("08:56"));
    expect(alarms.get("schedules-change")?.when).toBe(at("09:00").getTime());
  });

  test("warns once ahead of a start, counting down on the badge", async () => {
    await tick(at("08:57"));
    const first = (await scheduleState.get()).notice;
    expect(first?.text).toBe("Audio turns on at 09:00");
    expect(badge.text).toBe("3m");
    await tick(at("08:58"));
    expect((await scheduleState.get()).notice).toEqual(first);
    expect(badge.text).toBe("2m");
    expect(await active()).toBe("preset:focus");
  });

  test("a skipped schedule hands back the profile and stays out until its window ends", async () => {
    await tick(at("09:00"));
    await skipInCharge(at("10:00"));
    await tick(at("10:00"));
    expect(await active()).toBe("preset:focus");
    await tick(at("11:00"));
    expect(await active()).toBe("preset:focus");
    await tick(at("09:00", 29));
    expect(await active()).toBe("preset:audio");
  });

  test("a schedule whose profile is gone never switches, and is dropped", async () => {
    await schedulesStore.set({ schedules: [{ ...work, profileId: "deleted" }, work] });
    await dropSchedulesOfDeletedProfiles();
    expect((await schedulesStore.get()).schedules).toEqual([work]);
    await schedulesStore.set({ schedules: [{ ...work, profileId: "deleted" }] });
    await tick(at("09:00"));
    expect(await active()).toBe("preset:focus");
  });

  test("does nothing while Toppings is switched off", async () => {
    await appSettings.set({ enabled: false });
    await tick(at("09:00"));
    expect(await active()).toBe("preset:focus");
    expect(badge.text).toBe("");
  });
});

describe("place schedules", () => {
  beforeEach(() => schedulesStore.set({ schedules: [atOffice], places: [office] }));

  test("arriving turns the profile on and leaving puts the earlier one back", async () => {
    await checkLocation(async () => inside);
    expect(await active()).toBe("preset:audio");
    expect((await scheduleState.get()).notice?.text).toBe("Schedule · Audio while at Office");
    await checkLocation(async () => farAway);
    expect(await active()).toBe("preset:focus");
    expect((await scheduleState.get()).atPlaces).toEqual([]);
  });

  test("a refused or too-coarse location says why and counts as having left", async () => {
    await checkLocation(async () => inside);
    await checkLocation(() => Promise.reject(new Error("Location permission needed")));
    expect(await scheduleState.get()).toMatchObject({ atPlaces: [], locationError: "Location permission needed" });
    expect(await active()).toBe("preset:focus");

    await checkLocation(async () => ({ ...inside, accuracyMeters: 5000 }));
    expect(await scheduleState.get()).toMatchObject({ atPlaces: [], locationError: "Location too imprecise to tell places apart" });
    await checkLocation(async () => inside);
    expect(await scheduleState.get()).toMatchObject({ atPlaces: ["office"], locationError: null });
  });

  test("with no place schedule on, nobody is asked and what was known is cleared", async () => {
    await scheduleState.set({ atPlaces: ["office"], locationError: "Location permission needed" });
    await schedulesStore.set({ schedules: [{ ...atOffice, enabled: false }] });
    let asked = false;
    await checkLocation(async () => {
      asked = true;
      return inside;
    });
    expect(asked).toBe(false);
    expect(await scheduleState.get()).toMatchObject({ atPlaces: [], locationError: null });
  });
});

describe("alarms", () => {
  test("each exists only while an enabled schedule of its kind does", async () => {
    await syncAlarms([work, { ...atOffice, enabled: false }]);
    expect([...alarms.keys()]).toContain("schedules");
    expect(alarms.has("schedules-location")).toBe(false);
    await syncAlarms([atOffice]);
    expect(alarms.has("schedules")).toBe(false);
    expect(alarms.get("schedules-location")?.periodInMinutes).toBe(5);
  });
});
