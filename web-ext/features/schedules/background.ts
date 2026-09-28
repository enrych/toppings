import { appSettings } from "@/app/settings";
import { readPositionInBackground } from "@/lib/location";
import { getProfileById, profileStore, setActiveProfileId } from "@/features/profiles/store";
import { clock, currentEnd, isInWindow, placesHere, scheduleInCharge, upcomingChanges } from "./rules";
import { schedulesStore, type Place, type Schedule } from "./settings";
import { scheduleState, type ScheduleState } from "./state";
import { skipSchedule } from "./messages";

const TICK_ALARM = "schedules";
const LOCATION_ALARM = "schedules-location";
const LOCATION_EVERY_MINUTES = 5;
// A fix vaguer than this cannot tell one building from the next.
const MAX_ACCURACY_METERS = 1000;
const LEAD_MINUTES = 5;
const BADGE_COLOR = "#c2531e";

let ticking = Promise.resolve();

export function runSchedules(): void {
  chrome.alarms.create(TICK_ALARM, { periodInMinutes: 1 });
  chrome.alarms.create(LOCATION_ALARM, { periodInMinutes: LOCATION_EVERY_MINUTES });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === TICK_ALARM) queueTick();
    if (alarm.name === LOCATION_ALARM) void checkLocation();
  });
  schedulesStore.subscribe(() => {
    queueTick();
    void checkLocation();
  });
  appSettings.subscribe(queueTick);
  skipSchedule.handle(async () => {
    await skipInCharge(new Date());
    await queueTick();
  });
  queueTick();
  void checkLocation();
}

// Only while a place schedule exists, so nobody else is ever asked where they are.
async function checkLocation(): Promise<void> {
  const { schedules, places } = await schedulesStore.get();
  if (!schedules.some((schedule) => schedule.enabled && schedule.rule.kind === "place")) return;
  try {
    const here = await readPositionInBackground();
    if (here.accuracyMeters > MAX_ACCURACY_METERS) throw new Error("Location too imprecise to tell places apart");
    const { atPlaces } = await scheduleState.get();
    await scheduleState.set({ atPlaces: placesHere(places, here, atPlaces), locationError: null });
  } catch (error) {
    await scheduleState.set({ locationError: error instanceof Error ? error.message : String(error) });
  }
  await queueTick();
}

// One tick at a time: each reads state, decides, then writes it back.
function queueTick(): Promise<void> {
  ticking = ticking.then(() => tick(new Date())).catch((error) => console.error("[toppings] schedules", error));
  return ticking;
}

export async function skipInCharge(now: Date): Promise<void> {
  const [{ schedules }, { inCharge }] = await Promise.all([schedulesStore.get(), scheduleState.get()]);
  const schedule = schedules.find((s) => s.id === inCharge);
  if (!schedule) return;
  const until = schedule.rule.kind === "time" ? (currentEnd(schedule.rule, now)?.getTime() ?? null) : null;
  await scheduleState.set({ skipped: { id: schedule.id, until } });
}

export async function tick(now: Date): Promise<void> {
  const [app, { schedules, places }, state, { activeProfileId }] = await Promise.all([appSettings.get(), schedulesStore.get(), scheduleState.get(), profileStore.get()]);
  if (!app.enabled) return showBadge("", "");

  const byId = (id: string | null) => schedules.find((schedule) => schedule.id === id) ?? null;
  const skippedSchedule = byId(state.skipped?.id ?? null);
  const skipHolds = skippedSchedule && (state.skipped?.until != null ? now.getTime() < state.skipped.until : isInWindow(skippedSchedule, now, state.atPlaces));
  const skipped = skipHolds ? skippedSchedule.id : null;
  const current = byId(state.inCharge);
  const next = scheduleInCharge(schedules, now, state.atPlaces, skipped);
  const patch: Partial<ScheduleState> = { skipped: skipped ? state.skipped : null };
  let active = activeProfileId;
  let profileBefore = state.profileBefore;
  const say = (text: string) => void (patch.notice = { id: now.getTime(), text });

  if (state.inCharge && state.inCharge !== next?.id) {
    // A profile the user picked mid-window stays; only the schedule's own is undone.
    if (current && active === current.profileId) {
      active = profileBefore;
      say(`Schedule ended · ${await nameOf(active)}`);
    }
    profileBefore = null;
  }
  if (next && next.id !== state.inCharge) {
    profileBefore = active;
    active = next.profileId;
    say(`Schedule · ${await nameOf(active)} ${until(next, now, places)}`);
  }
  patch.inCharge = next?.id ?? null;
  patch.profileBefore = profileBefore;
  if (active !== activeProfileId) await setActiveProfileId(active);

  const upcoming = upcomingChanges(schedules, now, LEAD_MINUTES, next);
  const announced = state.announced.filter((key) => Number(key.split("@")[1]) > now.getTime());
  for (const change of upcoming) {
    const key = `${change.schedule.id}:${change.change}@${change.at.getTime()}`;
    if (announced.includes(key)) continue;
    announced.push(key);
    say(`${await nameOf(change.schedule.profileId)} turns ${change.change === "start" ? "on" : "off"} at ${clock(change.at)}`);
  }
  patch.announced = announced;

  const soon = upcoming[0];
  const status = soon
    ? `${await nameOf(soon.schedule.profileId)} turns ${soon.change === "start" ? "on" : "off"} at ${clock(soon.at)}`
    : next
      ? `${await nameOf(next.profileId)} on by schedule ${until(next, now, places)}`
      : "";
  patch.status = status;
  await scheduleState.set(patch);

  const badge = soon ? `${Math.max(1, Math.ceil((soon.at.getTime() - now.getTime()) / 60_000))}m` : next ? (await nameOf(next.profileId)).charAt(0).toUpperCase() : "";
  await showBadge(badge, status);
}

function until(schedule: Schedule, now: Date, places: readonly Place[]): string {
  if (schedule.rule.kind === "time") {
    const end = currentEnd(schedule.rule, now);
    return end ? `until ${clock(end)}` : "";
  }
  const placeId = schedule.rule.placeId;
  return `while at ${places.find((place) => place.id === placeId)?.name ?? "this place"}`;
}

async function nameOf(profileId: string | null): Promise<string> {
  return profileId ? ((await getProfileById(profileId))?.name ?? "Default") : "Default";
}

async function showBadge(text: string, status: string): Promise<void> {
  // Firefox still ships MV2, where the toolbar button is browserAction.
  // @ts-expect-error chrome-types only declares MV3
  const action: typeof chrome.action = chrome.action ?? chrome.browserAction;
  await action.setBadgeText({ text });
  await action.setBadgeBackgroundColor({ color: BADGE_COLOR });
  await action.setTitle({ title: status ? `Toppings · ${status}` : "Toppings" });
}
