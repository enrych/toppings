import { appSettings } from "@/kernel/appSettings";
import { readPositionInBackground, type Position } from "@/features/schedules/location";
import { getAllProfiles, getProfileById, profileStore, setActiveProfileId } from "@/features/profiles/store";
import { clock, currentEnd, isInWindow, nextChangeAt, placesHere, scheduleInCharge, upcomingChanges } from "./rules";
import { schedulesStore, type Place, type Schedule } from "./settings";
import { scheduleState, type ScheduleState } from "./state";
import { checkPlaces, skipSchedule } from "./messages";

const TICK_ALARM = "schedules";
const CHANGE_ALARM = "schedules-change";
const LOCATION_ALARM = "schedules-location";
const LOCATION_EVERY_MINUTES = 5;
// A fix vaguer than this cannot tell one building from the next.
const MAX_ACCURACY_METERS = 1000;
const LEAD_MINUTES = 5;
const BADGE_COLOR = "#c2531e";

let ticking = Promise.resolve();
let checking = Promise.resolve();

export function runSchedules(): void {
  // One check at a time: they share the one offscreen document Chrome allows,
  // and each closes it when done.
  const queueCheck = () => (checking = checking.then(() => checkLocation(readPositionInBackground)).catch((error) => console.error("[toppings] schedules", error)));
  const onSchedules = ({ schedules }: { schedules: Schedule[] }) => {
    void syncAlarms(schedules);
    queueTick();
    void queueCheck();
  };
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === TICK_ALARM || alarm.name === CHANGE_ALARM) queueTick();
    if (alarm.name === LOCATION_ALARM) void queueCheck();
  });
  schedulesStore.subscribe(onSchedules);
  profileStore.subscribe(() => void dropSchedulesOfDeletedProfiles());
  appSettings.subscribe(queueTick);
  skipSchedule.handle(async () => {
    await skipInCharge(new Date());
    await queueTick();
  });
  checkPlaces.handle(queueCheck);
  void schedulesStore.get().then(onSchedules);
}

export async function dropSchedulesOfDeletedProfiles(): Promise<void> {
  const [profiles, { schedules }] = await Promise.all([getAllProfiles(), schedulesStore.get()]);
  const kept = schedules.filter((schedule) => profiles.some((profile) => profile.id === schedule.profileId));
  if (kept.length !== schedules.length) await schedulesStore.set({ schedules: kept });
}

const hasEnabled = (schedules: readonly Schedule[], kind: Schedule["rule"]["kind"]) => schedules.some((schedule) => schedule.enabled && schedule.rule.kind === kind);

// Each alarm exists only while a schedule needs it, so a user without
// schedules has a background that is never woken for them.
export async function syncAlarms(schedules: readonly Schedule[]): Promise<void> {
  await keepAlarm(TICK_ALARM, 1, hasEnabled(schedules, "time"));
  await keepAlarm(LOCATION_ALARM, LOCATION_EVERY_MINUTES, hasEnabled(schedules, "place"));
}

async function keepAlarm(name: string, periodInMinutes: number, wanted: boolean): Promise<void> {
  if (!wanted) return void (await chrome.alarms.clear(name));
  // Left alone if already set: re-creating on every wake of the background
  // would restart the countdown, and a background woken often would never see it fire.
  if (!(await chrome.alarms.get(name))) await chrome.alarms.create(name, { periodInMinutes });
}

// Only while a place schedule exists, so nobody else is ever asked where they are.
export async function checkLocation(readPosition: () => Promise<Position>): Promise<void> {
  const { schedules, places } = await schedulesStore.get();
  if (!hasEnabled(schedules, "place")) {
    const { atPlaces, locationError } = await scheduleState.get();
    if (atPlaces.length || locationError) await scheduleState.set({ atPlaces: [], locationError: null });
    return;
  }
  try {
    const here = await readPosition();
    if (here.accuracyMeters > MAX_ACCURACY_METERS) throw new Error("Location too imprecise to tell places apart");
    const { atPlaces } = await scheduleState.get();
    await scheduleState.set({ atPlaces: placesHere(places, here, atPlaces), locationError: null });
  } catch (error) {
    // Not knowing where the user is counts as having left, or a place's
    // profile would stay on for as long as location stays unavailable.
    await scheduleState.set({ atPlaces: [], locationError: error instanceof Error ? error.message : String(error) });
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
  const [app, { schedules: stored, places }, state, { activeProfileId }, profiles] = await Promise.all([appSettings.get(), schedulesStore.get(), scheduleState.get(), profileStore.get(), getAllProfiles()]);
  if (!app.enabled) {
    if (state.status) await scheduleState.set({ status: "" });
    return showBadge("", "");
  }

  // A deleted profile's schedules are dropped a moment after it goes, and a
  // tick in between must not switch to a profile that is gone.
  const schedules = stored.filter((schedule) => profiles.some((profile) => profile.id === schedule.profileId));
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

  // The one-minute tick is a safety net; this lands on the change itself.
  const change = nextChangeAt(schedules, now, LEAD_MINUTES);
  if (change) await chrome.alarms.create(CHANGE_ALARM, { when: change.getTime() });

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
