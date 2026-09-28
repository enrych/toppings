import { useId, useState } from "preact/hooks";
import Button from "@/ui/primitives/Button";
import IconButton from "@/ui/primitives/IconButton";
import Icon from "@/ui/primitives/Icon";
import Section from "@/ui/layout/Section";
import Card from "@/ui/layout/Card";
import { Toggle } from "@/ui/form/Switch";
import Select from "@/ui/form/Select";
import Field from "@/ui/form/Field";
import { useToast } from "@/ui/feedback/ToastProvider";
import { useSettings } from "@/kernel/useSettings";
import { readPosition, type Position } from "@/lib/location";
import { schedulesStore, type Place, type Schedule, type Weekday } from "@/features/schedules/settings";
import { scheduleState } from "@/features/schedules/state";
import type { Profile } from "@/features/profiles/profiles";

type RuleKind = Schedule["rule"]["kind"];

interface ScheduleEditorProps {
  profiles: Profile[];
  places: Place[];
  onAdd: (schedule: Schedule) => void;
  onCancel: () => void;
}

interface ScheduleRowProps {
  summary: string;
  enabled: boolean;
  inCharge: boolean;
  onToggle: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete: () => void;
}

const WEEK: { day: Weekday; label: string }[] = [
  { day: 1, label: "Mon" },
  { day: 2, label: "Tue" },
  { day: 3, label: "Wed" },
  { day: 4, label: "Thu" },
  { day: 5, label: "Fri" },
  { day: 6, label: "Sat" },
  { day: 0, label: "Sun" },
];
const CLOCK_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const RADIUS_MIN = 50;
const RADIUS_MAX = 2000;
const INPUT_CLASS =
  "tw-h-9 tw-px-3 tw-rounded-lg tw-bg-surface-hover tw-text-fg tw-text-sm tw-border tw-border-transparent focus:tw-outline-none focus:tw-border-accent tw-transition-colors";
const BADGE_CLASS = "tw-text-[10px] tw-font-medium tw-uppercase tw-tracking-wider tw-text-accent tw-bg-info-bg tw-rounded tw-px-1.5 tw-py-0.5";

function describeDays(days: readonly Weekday[]): string {
  if (days.length === 7) return "Every day";
  const runs: string[][] = [[]];
  for (const { day, label } of WEEK) {
    if (days.includes(day)) runs[runs.length - 1].push(label);
    else if (runs[runs.length - 1].length) runs.push([]);
  }
  return runs
    .filter((run) => run.length)
    .map((run) => (run.length > 2 ? `${run[0]}–${run[run.length - 1]}` : run.join(", ")))
    .join(", ");
}

function describeSchedule(schedule: Schedule, profiles: readonly Profile[], places: readonly Place[]): string {
  const profile = profiles.find((p) => p.id === schedule.profileId)?.name ?? "Deleted profile";
  const { rule } = schedule;
  if (rule.kind === "place") return `${profile} · while at ${places.find((place) => place.id === rule.placeId)?.name ?? "a deleted place"}`;
  return `${profile} · ${describeDays(rule.days)} ${rule.start}–${rule.end}${rule.end <= rule.start ? " overnight" : ""}`;
}

const usedBy = (schedules: readonly Schedule[], place: Place) =>
  schedules.filter((schedule) => schedule.rule.kind === "place" && schedule.rule.placeId === place.id).length;

function DayChips({ days, onChange }: { days: Weekday[]; onChange: (days: Weekday[]) => void }) {
  return (
    <div role="group" aria-label="Days" class="tw-flex tw-flex-wrap tw-gap-1.5">
      {WEEK.map(({ day, label }) => {
        const on = days.includes(day);
        return (
          <button
            key={day}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? days.filter((d) => d !== day) : [...days, day].sort((a, b) => a - b))}
            class={`tw-h-8 tw-w-11 tw-rounded-lg tw-text-[13px] tw-font-medium tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-accent ${on ? "tw-bg-fg tw-text-bg" : "tw-bg-surface-hover tw-text-fg hover:tw-bg-border-default"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function ScheduleEditor({ profiles, places, onAdd, onCancel }: ScheduleEditorProps) {
  const startId = useId();
  const endId = useId();
  const [profileId, setProfileId] = useState("");
  const [kind, setKind] = useState<RuleKind>("time");
  const [days, setDays] = useState<Weekday[]>([1, 2, 3, 4, 5]);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [placeId, setPlaceId] = useState("");

  const chosenProfile = profileId || profiles[0]?.id || "";
  const chosenPlace = placeId || places[0]?.id || "";
  const daysError = days.length === 0 ? "Pick at least one day." : undefined;
  const startError = CLOCK_TIME.test(start) ? undefined : "Enter a start time.";
  const endError = !CLOCK_TIME.test(end) ? "Enter an end time." : end === start ? "End at a different time from the start." : undefined;
  const invalid = !chosenProfile || (kind === "time" ? Boolean(daysError || startError || endError) : !chosenPlace);

  const add = () => {
    if (invalid) return;
    onAdd({
      id: crypto.randomUUID(),
      profileId: chosenProfile,
      rule: kind === "time" ? { kind, days, start, end } : { kind, placeId: chosenPlace },
      enabled: true,
    });
  };

  return (
    <div class="tw-divide-y tw-divide-border-subtle">
      <Select<string>
        label="Profile"
        value={chosenProfile}
        options={profiles.map((p) => ({ value: p.id, label: p.name }))}
        onChange={setProfileId}
      />
      <Select<RuleKind>
        label="Switch by"
        value={kind}
        options={[
          { value: "time", label: "Time", description: "On chosen days, between two times" },
          { value: "place", label: "Place", description: "While you are at a saved place" },
        ]}
        onChange={setKind}
      />
      {kind === "time" ? (
        <>
          <Field label="Days" error={daysError}>
            <DayChips days={days} onChange={setDays} />
          </Field>
          <Field label="Starts" htmlFor={startId} error={startError}>
            <input id={startId} type="time" value={start} onInput={(e) => setStart(e.currentTarget.value)} class={`tw-w-32 ${INPUT_CLASS}`} />
          </Field>
          <Field
            label="Ends"
            htmlFor={endId}
            error={endError}
            hint={end < start ? "Runs overnight, into the next day." : undefined}
          >
            <input id={endId} type="time" value={end} onInput={(e) => setEnd(e.currentTarget.value)} class={`tw-w-32 ${INPUT_CLASS}`} />
          </Field>
        </>
      ) : places.length ? (
        <Select<string>
          label="Place"
          value={chosenPlace}
          options={places.map((place) => ({ value: place.id, label: place.name }))}
          onChange={setPlaceId}
        />
      ) : (
        <div class="tw-py-3 tw-text-sm tw-text-fg-muted">No places yet. Add one under Places below first.</div>
      )}
      <div class="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-py-3">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={add} disabled={invalid}>Add schedule</Button>
      </div>
    </div>
  );
}

function ScheduleRow({ summary, enabled, inCharge, onToggle, onMoveUp, onMoveDown, onDelete }: ScheduleRowProps) {
  return (
    <div class="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-py-3">
      <div class="tw-flex tw-items-center tw-gap-2 tw-min-w-0">
        <span class={`tw-text-[15px] tw-font-medium tw-truncate ${enabled ? "tw-text-fg" : "tw-text-fg-subtle"}`}>{summary}</span>
        {inCharge && <span class={BADGE_CLASS}>In charge</span>}
      </div>
      <div class="tw-flex tw-items-center tw-gap-1 tw-flex-shrink-0">
        <IconButton size="sm" aria-label="Move up" title="Move up" disabled={!onMoveUp} onClick={onMoveUp}>
          <Icon name="chevron-down" size={16} class="tw-rotate-180" />
        </IconButton>
        <IconButton size="sm" aria-label="Move down" title="Move down" disabled={!onMoveDown} onClick={onMoveDown}>
          <Icon name="chevron-down" size={16} />
        </IconButton>
        <Button size="sm" variant="ghost" onClick={onDelete}>Delete</Button>
        <span class="tw-pl-2 tw-inline-flex">
          <Toggle on={enabled} onClick={onToggle} label={`${summary}, enabled`} />
        </span>
      </div>
    </div>
  );
}

function PlaceEditor({ onAdd, onCancel }: { onAdd: (place: Place) => void; onCancel: () => void }) {
  const nameId = useId();
  const radiusId = useId();
  const [name, setName] = useState("");
  const [radius, setRadius] = useState("200");
  const [position, setPosition] = useState<Position | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  const radiusMeters = Number(radius);
  const radiusError =
    radius.trim() !== "" && Number.isInteger(radiusMeters) && radiusMeters >= RADIUS_MIN && radiusMeters <= RADIUS_MAX
      ? undefined
      : `Enter a whole number from ${RADIUS_MIN} to ${RADIUS_MAX}.`;
  const nameError = attempted && !name.trim() ? "Give the place a name." : undefined;
  const positionError = locationError
    ? `Location unavailable: ${locationError}. Allow location for Toppings when your browser asks.`
    : attempted && !position
      ? "Use your current location while you are there."
      : undefined;

  const locate = async () => {
    setLocating(true);
    setLocationError(null);
    try {
      setPosition(await readPosition());
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : String(error));
    }
    setLocating(false);
  };

  const save = () => {
    setAttempted(true);
    if (!name.trim() || radiusError || !position) return;
    onAdd({ id: crypto.randomUUID(), name: name.trim(), latitude: position.latitude, longitude: position.longitude, radiusMeters });
  };

  return (
    <div class="tw-divide-y tw-divide-border-subtle">
      <Field label="Name" htmlFor={nameId} error={nameError}>
        <input
          id={nameId}
          type="text"
          value={name}
          maxLength={40}
          placeholder="e.g. Work"
          onInput={(e) => setName(e.currentTarget.value)}
          class={`tw-w-44 placeholder:tw-text-fg-subtle ${INPUT_CLASS}`}
        />
      </Field>
      <Field label="Radius" htmlFor={radiusId} hint="How far from this spot still counts as there, in metres." error={radiusError}>
        <span class="tw-inline-flex tw-items-center tw-gap-2 tw-text-sm tw-text-fg-muted">
          <input
            id={radiusId}
            type="number"
            min={RADIUS_MIN}
            max={RADIUS_MAX}
            step={10}
            value={radius}
            onInput={(e) => setRadius(e.currentTarget.value)}
            class={`tw-w-24 ${INPUT_CLASS}`}
          />
          m
        </span>
      </Field>
      <Field
        label="Location"
        error={positionError}
        hint={position ? `Found, accurate to about ${Math.round(position.accuracyMeters)} m.` : "Stand at the place, then use your current location."}
      >
        <Button size="sm" onClick={() => void locate()} disabled={locating}>
          {locating ? "Locating…" : position ? "Locate again" : "Use my current location"}
        </Button>
      </Field>
      {position && !radiusError && position.accuracyMeters > radiusMeters && (
        <div class="tw-py-3 tw-text-xs tw-text-warning-fg">
          That fix is looser than the radius, so the place may match from farther away or not at all. Locate again, or widen the radius.
        </div>
      )}
      <div class="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-py-3">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={save}>Save place</Button>
      </div>
    </div>
  );
}

export default function Schedules({ profiles }: { profiles: Profile[] }) {
  const toast = useToast();
  const store = useSettings(schedulesStore);
  const { value: state } = useSettings(scheduleState);
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [addingPlace, setAddingPlace] = useState(false);
  const { schedules, places } = store.value;

  const setSchedules = (next: Schedule[]) => store.update({ schedules: next });
  const move = (index: number, by: number) => {
    const next = [...schedules];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    setSchedules(next);
  };

  const deletePlace = (place: Place) => {
    const users = usedBy(schedules, place);
    if (users) {
      toast.error(`"${place.name}" is in use`, `Delete the ${users === 1 ? "schedule that uses" : `${users} schedules that use`} it first.`);
      return;
    }
    store.update({ places: places.filter((p) => p.id !== place.id) });
    toast.success(`"${place.name}" deleted`);
  };

  return (
    <>
      <Section
        title="Schedules"
        description="A schedule turns its profile on when it starts and puts back what you had when it ends. Pick a profile yourself in between and yours stays. The first matching schedule wins."
        actions={!addingSchedule && <Button size="sm" variant="primary" onClick={() => setAddingSchedule(true)}>New schedule</Button>}
      >
        {(state.status || state.locationError) && (
          <div class="tw-flex tw-flex-col tw-gap-1 tw-mb-3 tw-text-sm">
            {state.status && (
              <p role="status" class="tw-flex tw-items-center tw-gap-2 tw-text-fg">
                <span aria-hidden class="tw-inline-block tw-w-2 tw-h-2 tw-rounded-full tw-bg-accent" />
                {state.status}
              </p>
            )}
            {state.locationError && (
              <p class="tw-text-danger-fg">
                Location unavailable: {state.locationError}. Allow location for Toppings when your browser asks, from "Use my current location" under Places.
              </p>
            )}
          </div>
        )}
        <Card>
          {addingSchedule && (
            <ScheduleEditor
              profiles={profiles}
              places={places}
              onAdd={(schedule) => {
                setSchedules([...schedules, schedule]);
                setAddingSchedule(false);
                toast.success("Schedule added");
              }}
              onCancel={() => setAddingSchedule(false)}
            />
          )}
          {schedules.length === 0 && !addingSchedule ? (
            <div class="tw-py-8 tw-text-center tw-text-sm tw-text-fg-subtle">No schedules yet. Add one with the button above.</div>
          ) : (
            schedules.map((schedule, index) => (
              <ScheduleRow
                key={schedule.id}
                summary={describeSchedule(schedule, profiles, places)}
                enabled={schedule.enabled}
                inCharge={state.inCharge === schedule.id}
                onToggle={() => setSchedules(schedules.map((s) => (s.id === schedule.id ? { ...s, enabled: !s.enabled } : s)))}
                onMoveUp={index > 0 ? () => move(index, -1) : undefined}
                onMoveDown={index < schedules.length - 1 ? () => move(index, 1) : undefined}
                onDelete={() => setSchedules(schedules.filter((s) => s.id !== schedule.id))}
              />
            ))
          )}
        </Card>
        <p class="tw-text-xs tw-text-fg-subtle tw-mt-2">
          While a schedule is in charge, the toolbar badge shows its profile's initial, and it counts down the minutes before a change.
        </p>
      </Section>

      <Section
        title="Places"
        description="For schedules that switch by place. Places stay on this device, and Toppings only checks where you are while a place schedule is on."
        actions={!addingPlace && <Button size="sm" variant="primary" onClick={() => setAddingPlace(true)}>New place</Button>}
      >
        <Card>
          {addingPlace && (
            <PlaceEditor
              onAdd={(place) => {
                store.update({ places: [...places, place] });
                setAddingPlace(false);
                toast.success(`"${place.name}" added`);
              }}
              onCancel={() => setAddingPlace(false)}
            />
          )}
          {places.length === 0 && !addingPlace ? (
            <div class="tw-py-8 tw-text-center tw-text-sm tw-text-fg-subtle">No places yet. Add one with the button above.</div>
          ) : (
            places.map((place) => {
              const users = usedBy(schedules, place);
              const details = [
                `Within ${place.radiusMeters} m`,
                users ? `used by ${users} ${users === 1 ? "schedule" : "schedules"}` : "",
              ].filter(Boolean);
              return (
                <div key={place.id} class="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-py-3">
                  <div class="tw-flex tw-flex-col tw-gap-0.5 tw-min-w-0">
                    <div class="tw-flex tw-items-center tw-gap-2">
                      <span class="tw-text-[15px] tw-font-medium tw-text-fg tw-truncate">{place.name}</span>
                      {state.atPlaces.includes(place.id) && <span class={BADGE_CLASS}>Here</span>}
                    </div>
                    <span class="tw-text-xs tw-text-fg-subtle">{details.join(" · ")}</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deletePlace(place)}>Delete</Button>
                </div>
              );
            })
          )}
        </Card>
      </Section>
    </>
  );
}
