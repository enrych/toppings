import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { h, render } from "preact";
import { act } from "preact/test-utils";
import { ToastProvider } from "@/ui/feedback/ToastProvider";
import { getAllProfiles } from "@/features/profiles/store";
import { schedulesStore, type Place, type Schedule } from "@/features/schedules/settings";
import { scheduleState } from "@/features/schedules/state";
import Schedules from "./Schedules";

const root = document.createElement("div");
document.body.append(root);
const originalGeolocation = navigator.geolocation;

const settle = () => act(() => new Promise((r) => setTimeout(r, 20)));

const mount = async () => {
  const profiles = await getAllProfiles();
  act(() => {
    render(h(ToastProvider, null, h(Schedules, { profiles })), root);
  });
  await settle();
};

const buttonNamed = (text: string) => [...root.querySelectorAll("button")].find((b) => b.textContent === text)!;
const inputLabelled = (label: string) => {
  const el = [...root.querySelectorAll("label")].find((l) => l.textContent === label)!;
  return root.querySelector<HTMLInputElement>(`[id="${el.htmlFor}"]`)!;
};
const type = (input: HTMLInputElement, value: string) =>
  act(() => {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

const work: Place = { id: "work", name: "Work", latitude: 51.5, longitude: -0.12, radiusMeters: 200 };
const weekdays: Schedule = { id: "a", profileId: "preset:audio", enabled: true, rule: { kind: "time", days: [1, 2, 3, 4, 5], start: "09:00", end: "18:00" } };
const atWork: Schedule = { id: "b", profileId: "preset:focus", enabled: true, rule: { kind: "place", placeId: "work" } };

beforeEach(async () => {
  await chrome.storage.local.clear();
});
afterEach(() => {
  act(() => render(null, root));
  document.body.replaceChildren(root);
  Object.defineProperty(navigator, "geolocation", { value: originalGeolocation, configurable: true });
});

describe("Schedules", () => {
  test("adding a time schedule stores its profile, days and window", async () => {
    await mount();
    act(() => buttonNamed("New schedule").click());
    act(() => buttonNamed("Sat").click());
    act(() => buttonNamed("Mon").click());
    type(inputLabelled("Starts"), "22:00");
    type(inputLabelled("Ends"), "06:30");
    expect(root.textContent).toContain("Runs overnight");
    act(() => buttonNamed("Add schedule").click());
    await settle();

    const { schedules } = await schedulesStore.get();
    expect(schedules).toHaveLength(1);
    expect(schedules[0]).toEqual({
      id: expect.any(String),
      profileId: "preset:audio",
      enabled: true,
      rule: { kind: "time", days: [2, 3, 4, 5, 6], start: "22:00", end: "06:30" },
    });
    expect(root.textContent).toContain("Audio · Tue–Sat 22:00–06:30 overnight");
  });

  test("an empty week or a zero-length window is refused", async () => {
    await mount();
    act(() => buttonNamed("New schedule").click());
    type(inputLabelled("Ends"), "09:00");
    expect(root.textContent).toContain("End at a different time from the start.");
    expect(root.textContent).not.toContain("Runs overnight");
    type(inputLabelled("Ends"), "17:00");
    for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri"]) act(() => buttonNamed(day).click());
    expect(root.textContent).toContain("Pick at least one day.");
    expect(buttonNamed("Add schedule").disabled).toBe(true);
  });

  test("toggling and reordering persist, and list order is what is stored", async () => {
    await schedulesStore.set({ schedules: [weekdays, atWork], places: [work] });
    await mount();
    expect(root.textContent).toContain("Focus · while at Work");

    const toggle = root.querySelector<HTMLButtonElement>("[role='switch'][aria-label='Focus · while at Work, enabled']")!;
    act(() => toggle.click());
    await settle();
    expect((await schedulesStore.get()).schedules.map((s) => s.enabled)).toEqual([true, false]);

    const moveUp = root.querySelectorAll<HTMLButtonElement>("button[aria-label='Move up']");
    expect(moveUp[0].disabled).toBe(true);
    act(() => moveUp[1].click());
    await settle();
    expect((await schedulesStore.get()).schedules.map((s) => s.id)).toEqual(["b", "a"]);
  });

  test("adding a place stores where the browser says you are, with the radius", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (ok: PositionCallback) => ok({ coords: { latitude: 48.8566, longitude: 2.3522, accuracy: 35 } } as GeolocationPosition),
      },
    });
    await mount();
    act(() => buttonNamed("New place").click());
    act(() => buttonNamed("Save place").click());
    expect(root.textContent).toContain("Give the place a name.");

    type(inputLabelled("Name"), " Office ");
    type(inputLabelled("Radius"), "20");
    expect(root.textContent).toContain("Enter a whole number from 50 to 2000.");
    type(inputLabelled("Radius"), "300");
    act(() => buttonNamed("Use my current location").click());
    await settle();
    expect(root.textContent).toContain("accurate to about 35 m");
    act(() => buttonNamed("Save place").click());
    await settle();

    expect((await schedulesStore.get()).places).toEqual([{ id: expect.any(String), name: "Office", latitude: 48.8566, longitude: 2.3522, radiusMeters: 300 }]);
  });

  test("a fix looser than the radius warns, and a refusal says why", async () => {
    let answer: "loose" | "denied" = "loose";
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (ok: PositionCallback, fail: PositionErrorCallback) =>
          answer === "loose"
            ? ok({ coords: { latitude: 1, longitude: 2, accuracy: 900 } } as GeolocationPosition)
            : fail({ message: "User denied Geolocation" } as GeolocationPositionError),
      },
    });
    await mount();
    act(() => buttonNamed("New place").click());
    act(() => buttonNamed("Use my current location").click());
    await settle();
    expect(root.textContent).toContain("looser than the radius");
    answer = "denied";
    act(() => buttonNamed("Locate again").click());
    await settle();
    expect(root.textContent).toContain("Location unavailable: User denied Geolocation.");
  });

  test("a place a schedule uses cannot be deleted until the schedule is", async () => {
    await schedulesStore.set({ schedules: [atWork], places: [work] });
    await mount();
    expect(root.textContent).toContain("used by 1 schedule");
    const deletePlace = () => [...root.querySelectorAll("button")].filter((b) => b.textContent === "Delete").at(-1)!.click();
    act(deletePlace);
    await settle();
    expect((await schedulesStore.get()).places).toHaveLength(1);
    expect(document.body.textContent).toContain('"Work" is in use');

    act(() => buttonNamed("Delete").click());
    await settle();
    act(deletePlace);
    await settle();
    expect(await schedulesStore.get()).toEqual({ schedules: [], places: [] });
  });

  test("shows the runner's status and a location problem", async () => {
    await scheduleState.set({ inCharge: "a", status: "Audio on by schedule until 18:00", locationError: "Location too imprecise to tell places apart" });
    await schedulesStore.set({ schedules: [weekdays], places: [] });
    await mount();
    expect(root.querySelector("[role='status']")?.textContent).toBe("Audio on by schedule until 18:00");
    expect(root.textContent).toContain("Location unavailable: Location too imprecise to tell places apart.");
    expect(root.textContent).toContain("In charge");
  });
});
