import { useEffect, useId, useRef, useState } from "preact/hooks";
import Button from "@/ui/primitives/Button";
import PageHeader from "@/ui/layout/PageHeader";
import Section from "@/ui/layout/Section";
import Card from "@/ui/layout/Card";
import Switch from "@/ui/form/Switch";
import Select, { type SelectOption } from "@/ui/form/Select";
import Field from "@/ui/form/Field";
import { useToast } from "@/ui/feedback/ToastProvider";
import Schedules from "@/app/options/components/Schedules";
import { useChromeStorageLocal } from "@/lib/useChromeStorageLocal";
import { CHROME_STORAGE_LOCAL_KEY } from "@/lib/storageKeys";
import {
  getAllProfiles,
  getActiveProfile,
  setActiveProfileId,
  createProfile,
  updateProfile,
  deleteProfile,
  subscribeProfiles,
} from "@/features/profiles/store";
import {
  exportProfile,
  importProfileFromFile,
} from "@/features/profiles/importExport";
import {
  type Profile,
  type ProfilePrimitiveConfig,
  type ThumbnailMode,
} from "@/features/profiles/profiles";
import type { VisualsMode } from "@/features/profiles/profiles";
import { primitiveById } from "@/youtube/primitives";

const VISUALS_OPTIONS: SelectOption<VisualsMode>[] = [
  { value: "video", label: "Real video", description: "The video as YouTube shows it" },
  { value: "black", label: "Black screen", description: "A plain black screen" },
  { value: "visualizer", label: "Visualizer", description: "A waveform that reacts to the audio" },
  { value: "custom", label: "Custom image", description: "An image of your choice" },
];

// A knob left at YouTube's own value is not listed: those are the ones the
// profile leaves alone.
function describeChanges(primitives: ProfilePrimitiveConfig): string {
  const parts = Object.entries(primitives).flatMap(([id, setting]) => {
    const label = primitiveById(id)?.label ?? id;
    if ("visible" in setting) return setting.visible ? [] : [`${label}: hidden`];
    if ("mode" in setting) return setting.mode === "show" ? [] : [`${label}: ${setting.mode}`];
    if (setting.value === "video") return [];
    return [`${label}: ${VISUALS_OPTIONS.find((o) => o.value === setting.value)?.label ?? setting.value}`];
  });
  return parts.join(" · ") || "Changes nothing yet";
}

function VisualsImagePicker() {
  const toast = useToast();
  const [image] = useChromeStorageLocal<string | null>(CHROME_STORAGE_LOCAL_KEY.VISUALS_IMAGE, null);
  const fileInput = useRef<HTMLInputElement>(null);

  const store = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string") return;
      // Local storage is capped without unlimitedStorage, and a photo's data
      // URL can pass the cap, so a failed write is expected, not exceptional.
      try {
        await chrome.storage.local.set({ [CHROME_STORAGE_LOCAL_KEY.VISUALS_IMAGE]: reader.result });
      } catch {
        toast.error("Image not saved", "It is too large; try a smaller one.");
      }
    };
    reader.onerror = () => toast.error("Could not read that image");
    reader.readAsDataURL(file);
  };

  return (
    <Field label="Custom image" hint="Kept on this device only, and shared by every profile set to a custom image.">
      <div class="tw-flex tw-items-center tw-gap-2">
        {image && <img src={image} alt="" class="tw-h-8 tw-w-14 tw-rounded tw-object-cover tw-border tw-border-border-subtle" />}
        {image && <Button size="sm" variant="ghost" onClick={() => void chrome.storage.local.remove(CHROME_STORAGE_LOCAL_KEY.VISUALS_IMAGE)}>Clear</Button>}
        <Button size="sm" onClick={() => fileInput.current?.click()}>{image ? "Change image" : "Choose image"}</Button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const input = e.currentTarget;
            const file = input.files?.[0];
            input.value = "";
            if (file) store(file);
          }}
        />
      </div>
    </Field>
  );
}

interface ProfileEditorProps {
  initial: Partial<Profile>;
  onSave: (name: string, primitives: ProfilePrimitiveConfig) => Promise<void>;
  onCancel: () => void;
}

function ProfileEditor({
  initial,
  onSave,
  onCancel,
}: ProfileEditorProps) {
  const nameId = useId();
  const [name, setName] = useState(initial.name ?? "");
  const [primitives, setPrimitives] = useState<ProfilePrimitiveConfig>(
    initial.primitives ?? {},
  );
  const [isSaving, setIsSaving] = useState(false);

  const visuals = primitives["watch.visuals"]?.value ?? "video";

  // Setting a knob back to YouTube's own value removes it, so the profile
  // stops touching that part of the page instead of forcing it visible.
  const set = <K extends keyof ProfilePrimitiveConfig>(key: K, value: ProfilePrimitiveConfig[K] | undefined) =>
    setPrimitives((prev) => {
      const { [key]: _, ...rest } = prev;
      return value === undefined ? rest : { ...rest, [key]: value };
    });
  const setVisible = (key: "watch.sidebar" | "watch.comments" | "watch.endCards" | "home.feed" | "search.metadata" | "shorts.shelf") => (visible: boolean) =>
    set(key, visible ? undefined : { visible });

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    await onSave(name.trim(), primitives);
    setIsSaving(false);
  };

  return (
    <div class="tw-p-4 tw-flex tw-flex-col tw-gap-4">
            <div class="tw-flex tw-flex-col tw-gap-1">
        <label for={nameId} class="tw-text-sm tw-font-medium tw-text-fg">
          Profile name
        </label>
        <input
          id={nameId}
          type="text"
          value={name}
          onInput={(e) => setName(e.currentTarget.value)}
          placeholder="e.g. Study session"
          maxLength={40}
          class="tw-w-full tw-h-9 tw-rounded-lg tw-bg-surface-hover tw-px-3 tw-text-sm tw-text-fg placeholder:tw-text-fg-subtle tw-border tw-border-transparent focus:tw-outline-none focus:tw-border-accent"
        />
      </div>

            <div class="tw-flex tw-flex-col tw-gap-2">
        <span class="tw-text-xs tw-font-medium tw-uppercase tw-tracking-wider tw-text-fg-subtle">
          Watch page
        </span>

        <div class="tw-bg-surface tw-border tw-border-border-subtle tw-rounded-xl tw-divide-y tw-divide-border-subtle">
          <div
            class="tw-px-4"
          >
            <Select<VisualsMode>
              label="Video screen"
              description="Covers the video but keeps the player's controls, so you can listen without the picture showing."
              value={visuals}
              options={VISUALS_OPTIONS}
              onChange={(v) => set("watch.visuals", v === "video" ? undefined : { value: v })}
            />
            {visuals === "custom" && <VisualsImagePicker />}
          </div>

                    <div
            class="tw-px-4"
          >
            <Switch
              label="Recommendations Sidebar"
              description="Show or hide the 'Up next' panel."
              isEnabled={primitives["watch.sidebar"]?.visible ?? true}
              onToggle={setVisible("watch.sidebar")}
            />
          </div>

                    <div
            class="tw-px-4"
          >
            <Switch
              label="Comments Section"
              description="Show or hide the comments below the video."
              isEnabled={primitives["watch.comments"]?.visible ?? true}
              onToggle={setVisible("watch.comments")}
            />
          </div>

                    <div
            class="tw-px-4"
          >
            <Switch
              label="End Screen Cards"
              description="Show or hide overlay cards at the end of videos."
              isEnabled={primitives["watch.endCards"]?.visible ?? true}
              onToggle={setVisible("watch.endCards")}
            />
          </div>
        </div>
      </div>

            <div class="tw-flex tw-flex-col tw-gap-2">
        <span class="tw-text-xs tw-font-medium tw-uppercase tw-tracking-wider tw-text-fg-subtle">
          Home page
        </span>
        <div class="tw-bg-surface tw-border tw-border-border-subtle tw-rounded-xl tw-divide-y tw-divide-border-subtle">
          <div class="tw-px-4">
            <Select<ThumbnailMode>
              label="Feed Thumbnails"
              description="Show, hide, or blur thumbnail images in the home feed."
              value={primitives["home.thumbnails"]?.mode ?? "show"}
              options={[
                { value: "show", label: "Show", description: "Normal thumbnails" },
                { value: "blur", label: "Blur", description: "Blurred — layout preserved" },
                { value: "hide", label: "Hide", description: "Invisible thumbnails" },
              ]}
              onChange={(v) => set("home.thumbnails", v === "show" ? undefined : { mode: v })}
            />
          </div>
          <div class="tw-px-4">
            <Switch
              label="Home Feed"
              description="Show or hide the entire home page feed."
              isEnabled={primitives["home.feed"]?.visible ?? true}
              onToggle={setVisible("home.feed")}
            />
          </div>
        </div>
      </div>

            <div class="tw-flex tw-flex-col tw-gap-2">
        <span class="tw-text-xs tw-font-medium tw-uppercase tw-tracking-wider tw-text-fg-subtle">
          Search
        </span>
        <div class="tw-bg-surface tw-border tw-border-border-subtle tw-rounded-xl tw-divide-y tw-divide-border-subtle">
          <div class="tw-px-4">
            <Select<ThumbnailMode>
              label="Result Thumbnails"
              description="Show, hide, or blur thumbnails in search results."
              value={primitives["search.thumbnails"]?.mode ?? "show"}
              options={[
                { value: "show", label: "Show", description: "Normal thumbnails" },
                { value: "blur", label: "Blur", description: "Blurred — layout preserved" },
                { value: "hide", label: "Hide", description: "Plain text list" },
              ]}
              onChange={(v) => set("search.thumbnails", v === "show" ? undefined : { mode: v })}
            />
          </div>
          <div class="tw-px-4">
            <Switch
              label="Video Metadata"
              description="Show or hide view count and date below search results."
              isEnabled={primitives["search.metadata"]?.visible ?? true}
              onToggle={setVisible("search.metadata")}
            />
          </div>
        </div>
      </div>

            <div class="tw-flex tw-flex-col tw-gap-2">
        <span class="tw-text-xs tw-font-medium tw-uppercase tw-tracking-wider tw-text-fg-subtle">
          Shorts
        </span>
        <div class="tw-bg-surface tw-border tw-border-border-subtle tw-rounded-xl tw-divide-y tw-divide-border-subtle">
          <div class="tw-px-4">
            <Switch
              label="Shorts shelves"
              description="Show or hide the rows of Shorts on home, search and other pages."
              isEnabled={primitives["shorts.shelf"]?.visible ?? true}
              onToggle={setVisible("shorts.shelf")}
            />
          </div>
        </div>
      </div>

            <div class="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-pt-1">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={!name.trim() || isSaving}>
          {isSaving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </div>
  );
}

interface PresetCardProps {
  profile: Profile;
  isActive: boolean;
  onActivate: () => void;
}

function PresetCard({ profile, isActive, onActivate }: PresetCardProps) {
  return (
    <div class="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-py-3">
      <div class="tw-flex tw-flex-col tw-gap-0.5">
        <div class="tw-flex tw-items-center tw-gap-2">
          <span class="tw-text-[15px] tw-font-medium tw-text-fg">
            {profile.name}
          </span>
          <span class="tw-text-[10px] tw-font-medium tw-uppercase tw-tracking-wider tw-text-fg-muted tw-bg-surface-hover tw-rounded tw-px-1.5 tw-py-0.5">
            Built-in
          </span>
          {isActive && (
            <span class="tw-text-[10px] tw-font-medium tw-uppercase tw-tracking-wider tw-text-accent tw-bg-info-bg tw-rounded tw-px-1.5 tw-py-0.5">
              Active
            </span>
          )}
        </div>
        <span class="tw-text-xs tw-text-fg-subtle">{describeChanges(profile.primitives)}</span>
      </div>
      <Button size="sm" variant={isActive ? "secondary" : "primary"} onClick={onActivate}>
        {isActive ? "Deactivate" : "Activate"}
      </Button>
    </div>
  );
}

interface CustomProfileCardProps {
  profile: Profile;
  isActive: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function CustomProfileCard({
  profile,
  isActive,
  onActivate,
  onEdit,
  onDelete,
}: CustomProfileCardProps) {
  return (
    <div class="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-py-3">
      <div class="tw-flex tw-flex-col tw-gap-0.5">
        <div class="tw-flex tw-items-center tw-gap-2">
          <span class="tw-text-[15px] tw-font-medium tw-text-fg">
            {profile.name}
          </span>
          {isActive && (
            <span class="tw-text-[10px] tw-font-medium tw-uppercase tw-tracking-wider tw-text-accent tw-bg-info-bg tw-rounded tw-px-1.5 tw-py-0.5">
              Active
            </span>
          )}
        </div>
        <span class="tw-text-xs tw-text-fg-subtle">{describeChanges(profile.primitives)}</span>
      </div>
      <div class="tw-flex tw-items-center tw-gap-2 tw-flex-shrink-0">
        <Button size="sm" variant="ghost" title="Export as JSON" onClick={() => exportProfile(profile)}>Export</Button>
        <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>Delete</Button>
        <Button size="sm" variant={isActive ? "secondary" : "primary"} onClick={onActivate}>
          {isActive ? "Deactivate" : "Activate"}
        </Button>
      </div>
    </div>
  );
}

type EditorMode =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; profile: Profile };

export default function Profiles() {
  const toast = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorMode>({ type: "closed" });
  const importInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    const [all, active] = await Promise.all([
      getAllProfiles(),
      getActiveProfile(),
    ]);
    setProfiles(all);
    setActiveId(active?.id ?? null);
  };

  useEffect(() => {
    void load();
    return subscribeProfiles(() => void load());
  }, []);

  const handleActivate = async (id: string) => {
    const next = activeId === id ? null : id;
    await setActiveProfileId(next);
    setActiveId(next);
    const name = profiles.find((p) => p.id === id)?.name ?? "Profile";
    toast.success(next ? `${name} activated` : "Profile deactivated");
  };

  const handleCreate = async (
    name: string,
    primitives: ProfilePrimitiveConfig,
  ) => {
    await createProfile({ name, primitives });
    await load();
    setEditor({ type: "closed" });
    toast.success(`"${name}" created`);
  };

  const handleUpdate = async (
    id: string,
    name: string,
    primitives: ProfilePrimitiveConfig,
  ) => {
    await updateProfile(id, { name, primitives });
    await load();
    setEditor({ type: "closed" });
    toast.success(`"${name}" saved`);
  };

  const handleDelete = async (profile: Profile) => {
    await deleteProfile(profile.id);
    await load();
    toast.success(`"${profile.name}" deleted`);
  };

  const presets = profiles.filter((p) => p.isPreset);
  const custom = profiles.filter((p) => !p.isPreset);

  return (
    <>
      <PageHeader
        title="Profiles"
        description="Switch your entire YouTube experience in one tap. Built-in presets are ready to use; create custom profiles to mix and match any combination."
      />

      <div class="tw-flex tw-flex-col tw-gap-8">
                <Section title="Built-in presets" description="Curated by Toppings — activate in one tap, no configuration needed.">
          <Card>
            {presets.map((p) => (
              <PresetCard
                key={p.id}
                profile={p}
                isActive={activeId === p.id}
                onActivate={() => handleActivate(p.id)}
              />
            ))}
          </Card>
        </Section>

                <Section
          title="My profiles"
          description="Create your own mix of YouTube experience settings."
          actions={
            editor.type === "closed" ? (
              <div class="tw-flex tw-items-center tw-gap-2">
                <Button size="sm" title="Import profile from JSON" onClick={() => importInput.current?.click()}>Import</Button>
                <input
                  ref={importInput}
                  type="file"
                  accept=".json,application/json"
                  hidden
                  onChange={async (e) => {
                    // currentTarget is null once the handler first awaits.
                    const input = e.currentTarget;
                    const file = input.files?.[0];
                    input.value = "";
                    if (!file) return;
                    const result = await importProfileFromFile(file);
                    if (!result.ok) {
                      toast.error("Import failed", result.message);
                      return;
                    }
                    await createProfile({
                      name: result.name,
                      primitives: result.primitives,
                    });
                    await load();
                    toast.success(`"${result.name}" imported`);
                  }}
                />
                <Button size="sm" variant="primary" onClick={() => setEditor({ type: "create" })}>New profile</Button>
              </div>
            ) : null
          }
        >
          <Card>
                        {editor.type === "create" && (
              <ProfileEditor
                initial={{}}
                onSave={handleCreate}
                onCancel={() => setEditor({ type: "closed" })}
              />
            )}

            {custom.length === 0 && editor.type !== "create" ? (
              <div class="tw-py-8 tw-text-center tw-text-sm tw-text-fg-subtle">
                No custom profiles yet. Create one with the button above.
              </div>
            ) : (
              custom.map((p) =>
                editor.type === "edit" && editor.profile.id === p.id ? (
                  <ProfileEditor
                    key={p.id}
                    initial={p}
                    onSave={(name, primitives) =>
                      handleUpdate(p.id, name, primitives)
                    }
                    onCancel={() => setEditor({ type: "closed" })}
                  />
                ) : (
                  <CustomProfileCard
                    key={p.id}
                    profile={p}
                    isActive={activeId === p.id}
                    onActivate={() => handleActivate(p.id)}
                    onEdit={() => setEditor({ type: "edit", profile: p })}
                    onDelete={() => handleDelete(p)}
                  />
                ),
              )
            )}
          </Card>
        </Section>

        <Schedules profiles={profiles} />
      </div>
    </>
  );
}
