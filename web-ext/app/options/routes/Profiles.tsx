import React, { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/PageHeader";
import Section from "../../../components/layout/Section";
import Card from "../../../components/layout/Card";
import Switch from "../../../components/form/Switch";
import Select from "../../../components/form/Select";
import { useToast } from "../../../components/feedback/ToastProvider";
import { useCapabilityCache } from "../../../hooks/useCapabilityCache";
import {
  getAllProfiles,
  getActiveProfile,
  setActiveProfileId,
  createProfile,
  updateProfile,
  deleteProfile,
} from "../../../utils/storage/profileStore";
import {
  exportProfile,
  importProfileFromFile,
} from "../../../utils/storage/profileImportExport";
import {
  BUILT_IN_PRESETS,
  type Profile,
  type ProfilePrimitiveConfig,
  type ThumbnailMode,
} from "../../../data/profiles.data";
import type { PlayerLayout, PlayerVisuals } from "../../../utils/primitive";

// ---------------------------------------------------------------------------
// Blank profile template
// ---------------------------------------------------------------------------

function blankPrimitives(): ProfilePrimitiveConfig {
  return {
    "watch.sidebar": { visible: true },
    "watch.comments": { visible: true },
    "watch.endCards": { visible: true },
    "watch.layout": { value: "default" },
    "watch.visuals": { value: "video" },
  };
}

// ---------------------------------------------------------------------------
// Profile editor (inline)
// ---------------------------------------------------------------------------

interface ProfileEditorProps {
  initial: Partial<Profile>;
  onSave: (name: string, primitives: ProfilePrimitiveConfig) => Promise<void>;
  onCancel: () => void;
  getStatus: (id: string) => "supported" | "unsupported" | "untested";
}

function ProfileEditor({
  initial,
  onSave,
  onCancel,
  getStatus,
}: ProfileEditorProps) {
  const [name, setName] = useState(initial.name ?? "");
  const [primitives, setPrimitives] = useState<ProfilePrimitiveConfig>(
    initial.primitives ?? blankPrimitives(),
  );
  const [isSaving, setIsSaving] = useState(false);

  const layout = primitives["watch.layout"]?.value ?? "default";
  const noVideo = layout === "no-video";

  const set = <K extends keyof ProfilePrimitiveConfig>(
    key: K,
    value: ProfilePrimitiveConfig[K],
  ) => setPrimitives((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    await onSave(name.trim(), primitives);
    setIsSaving(false);
  };

  const isUnsupported = (id: string) => getStatus(id) === "unsupported";

  return (
    <div className="tw-p-4 tw-flex tw-flex-col tw-gap-4">
      {/* Name */}
      <div className="tw-flex tw-flex-col tw-gap-1">
        <label className="tw-text-sm tw-font-medium tw-text-fg">
          Profile name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="e.g. Study session"
          maxLength={40}
          className="tw-w-full tw-rounded-lg tw-border tw-border-border-default tw-bg-surface tw-px-3 tw-py-2 tw-text-sm tw-text-fg placeholder:tw-text-fg-subtle focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-accent/50"
        />
      </div>

      {/* Watch scope */}
      <div className="tw-flex tw-flex-col tw-gap-2">
        <span className="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-fg-subtle">
          Watch page
        </span>

        <div className="tw-bg-surface tw-border tw-border-border-default tw-rounded-xl tw-divide-y tw-divide-border-subtle">
          {/* Layout */}
          <div
            className={`tw-px-4 ${isUnsupported("watch.layout") ? "tw-opacity-50" : ""}`}
          >
            <Select<PlayerLayout>
              label="Player Layout"
              description={
                isUnsupported("watch.layout")
                  ? "Not available on your YouTube"
                  : "How the video player is arranged on the page."
              }
              value={layout}
              options={[
                { value: "default", label: "Default", description: "YouTube's standard layout" },
                { value: "theatre", label: "Theatre", description: "Wider video, narrower sidebar" },
                { value: "no-video", label: "No Video", description: "Hide the player area entirely" },
              ]}
              onChange={(v) => set("watch.layout", { value: v })}
            />
          </div>

          {/* Visuals — disabled when no-video */}
          <div
            className={`tw-px-4 tw-transition-opacity ${
              noVideo || isUnsupported("watch.visuals") ? "tw-opacity-40 tw-pointer-events-none" : ""
            }`}
          >
            <Select<PlayerVisuals>
              label="Player Visuals"
              description={
                noVideo
                  ? "Not applicable when layout is No Video"
                  : isUnsupported("watch.visuals")
                    ? "Not available on your YouTube"
                    : "What fills the video slot when the player is visible."
              }
              value={primitives["watch.visuals"]?.value ?? "video"}
              options={[
                { value: "video", label: "Real Video", description: "Normal video playback" },
                { value: "black", label: "Black Screen", description: "Audio only with black overlay" },
                { value: "visualizer", label: "Visualizer", description: "Audio visualizer animation" },
                { value: "custom", label: "Custom Image", description: "Your uploaded background image" },
              ]}
              onChange={(v) => set("watch.visuals", { value: v })}
            />
          </div>

          {/* Sidebar */}
          <div
            className={`tw-px-4 ${isUnsupported("watch.sidebar") ? "tw-opacity-50 tw-pointer-events-none" : ""}`}
          >
            <Switch
              label="Recommendations Sidebar"
              description={
                isUnsupported("watch.sidebar")
                  ? "Not available on your YouTube"
                  : "Show or hide the 'Up next' panel."
              }
              isEnabled={primitives["watch.sidebar"]?.visible ?? true}
              onToggle={(v) => set("watch.sidebar", { visible: v })}
            />
          </div>

          {/* Comments */}
          <div
            className={`tw-px-4 ${isUnsupported("watch.comments") ? "tw-opacity-50 tw-pointer-events-none" : ""}`}
          >
            <Switch
              label="Comments Section"
              description={
                isUnsupported("watch.comments")
                  ? "Not available on your YouTube"
                  : "Show or hide the comments below the video."
              }
              isEnabled={primitives["watch.comments"]?.visible ?? true}
              onToggle={(v) => set("watch.comments", { visible: v })}
            />
          </div>

          {/* End cards */}
          <div
            className={`tw-px-4 ${isUnsupported("watch.endCards") ? "tw-opacity-50 tw-pointer-events-none" : ""}`}
          >
            <Switch
              label="End Screen Cards"
              description={
                isUnsupported("watch.endCards")
                  ? "Not available on your YouTube"
                  : "Show or hide overlay cards at the end of videos."
              }
              isEnabled={primitives["watch.endCards"]?.visible ?? true}
              onToggle={(v) => set("watch.endCards", { visible: v })}
            />
          </div>
        </div>
      </div>

      {/* Home scope */}
      <div className="tw-flex tw-flex-col tw-gap-2">
        <span className="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-fg-subtle">
          Home page
        </span>
        <div className="tw-bg-surface tw-border tw-border-border-default tw-rounded-xl tw-divide-y tw-divide-border-subtle">
          <div className="tw-px-4">
            <Select<ThumbnailMode>
              label="Feed Thumbnails"
              description="Show, hide, or blur thumbnail images in the home feed."
              value={primitives["home.thumbnails"]?.mode ?? "show"}
              options={[
                { value: "show", label: "Show", description: "Normal thumbnails" },
                { value: "blur", label: "Blur", description: "Blurred — layout preserved" },
                { value: "hide", label: "Hide", description: "Invisible thumbnails" },
              ]}
              onChange={(v) => set("home.thumbnails", { mode: v })}
            />
          </div>
          <div className="tw-px-4">
            <Switch
              label="Home Feed"
              description="Show or hide the entire home page feed."
              isEnabled={primitives["home.feed"]?.visible ?? true}
              onToggle={(v) => set("home.feed", { visible: v })}
            />
          </div>
          <div className="tw-px-4">
            <Switch
              label="Shorts Shelf"
              description="Show or hide the Shorts row in the home feed."
              isEnabled={primitives["home.shorts"]?.visible ?? true}
              onToggle={(v) => set("home.shorts", { visible: v })}
            />
          </div>
        </div>
      </div>

      {/* Search scope */}
      <div className="tw-flex tw-flex-col tw-gap-2">
        <span className="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-fg-subtle">
          Search
        </span>
        <div className="tw-bg-surface tw-border tw-border-border-default tw-rounded-xl tw-divide-y tw-divide-border-subtle">
          <div className="tw-px-4">
            <Select<ThumbnailMode>
              label="Result Thumbnails"
              description="Show, hide, or blur thumbnails in search results."
              value={primitives["search.thumbnails"]?.mode ?? "show"}
              options={[
                { value: "show", label: "Show", description: "Normal thumbnails" },
                { value: "blur", label: "Blur", description: "Blurred — layout preserved" },
                { value: "hide", label: "Hide", description: "Plain text list" },
              ]}
              onChange={(v) => set("search.thumbnails", { mode: v })}
            />
          </div>
          <div className="tw-px-4">
            <Switch
              label="Video Metadata"
              description="Show or hide view count and date below search results."
              isEnabled={primitives["search.metadata"]?.visible ?? true}
              onToggle={(v) => set("search.metadata", { visible: v })}
            />
          </div>
          <div className="tw-px-4">
            <Switch
              label="Shorts in Search"
              description="Show or hide the Shorts shelf in search results."
              isEnabled={primitives["search.shorts"]?.visible ?? true}
              onToggle={(v) => set("search.shorts", { visible: v })}
            />
          </div>
        </div>
      </div>

      {/* Shorts shelf (cross-page) */}
      <div className="tw-flex tw-flex-col tw-gap-2">
        <span className="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-fg-subtle">
          Shorts
        </span>
        <div className="tw-bg-surface tw-border tw-border-border-default tw-rounded-xl tw-divide-y tw-divide-border-subtle">
          <div className="tw-px-4">
            <Switch
              label="Shorts Shelf (everywhere)"
              description="Hide the Shorts shelf across home, search, and other pages."
              isEnabled={primitives["shorts.shelf"]?.visible ?? true}
              onToggle={(v) => set("shorts.shelf", { visible: v })}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="tw-text-sm tw-text-fg-subtle hover:tw-text-fg tw-px-3 tw-py-1.5 tw-rounded-lg hover:tw-bg-surface-hover tw-transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim() || isSaving}
          className="tw-text-sm tw-font-medium tw-text-[--color-accent-fg] tw-bg-accent tw-px-4 tw-py-1.5 tw-rounded-lg hover:tw-opacity-90 tw-transition-opacity disabled:tw-opacity-40 disabled:tw-cursor-not-allowed"
        >
          {isSaving ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preset card (read-only)
// ---------------------------------------------------------------------------

interface PresetCardProps {
  profile: Profile;
  isActive: boolean;
  onActivate: () => void;
}

function PresetCard({ profile, isActive, onActivate }: PresetCardProps) {
  const primitiveLabels: Record<string, string> = {
    "watch.layout": "Layout",
    "watch.visuals": "Visuals",
    "watch.sidebar": "Sidebar",
    "watch.comments": "Comments",
    "watch.endCards": "End Cards",
    "home.thumbnails": "Home Thumbnails",
    "home.feed": "Home Feed",
    "home.shorts": "Home Shorts",
    "search.thumbnails": "Search Thumbnails",
    "search.metadata": "Search Metadata",
    "search.shorts": "Search Shorts",
    "shorts.shelf": "Shorts Shelf",
  };

  const summaryParts = Object.entries(profile.primitives)
    .map(([key, val]) => {
      const label = primitiveLabels[key] ?? key;
      if ("visible" in val) return `${label}: ${val.visible ? "on" : "off"}`;
      if ("mode" in val) return `${label}: ${val.mode}`;
      if ("value" in val) return `${label}: ${val.value}`;
      return label;
    })
    .join(" · ");

  return (
    <div className="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-py-3">
      <div className="tw-flex tw-flex-col tw-gap-0.5">
        <div className="tw-flex tw-items-center tw-gap-2">
          <span className="tw-text-[15px] tw-font-medium tw-text-fg">
            {profile.name}
          </span>
          <span className="tw-text-[10px] tw-font-semibold tw-uppercase tw-tracking-wider tw-text-fg-subtle tw-border tw-border-border-default tw-rounded tw-px-1.5 tw-py-0.5">
            Built-in
          </span>
          {isActive && (
            <span className="tw-text-[10px] tw-font-semibold tw-uppercase tw-tracking-wider tw-text-accent tw-border tw-border-accent/40 tw-rounded tw-px-1.5 tw-py-0.5">
              Active
            </span>
          )}
        </div>
        <span className="tw-text-xs tw-text-fg-subtle">{summaryParts}</span>
      </div>
      <button
        type="button"
        onClick={onActivate}
        className={`tw-flex-shrink-0 tw-text-sm tw-font-medium tw-px-3 tw-py-1.5 tw-rounded-lg tw-transition-colors ${
          isActive
            ? "tw-text-fg-subtle tw-border tw-border-border-default hover:tw-bg-surface-hover"
            : "tw-text-[--color-accent-fg] tw-bg-accent hover:tw-opacity-90"
        }`}
      >
        {isActive ? "Deactivate" : "Activate"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom profile card
// ---------------------------------------------------------------------------

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
    <div className="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-py-3">
      <div className="tw-flex tw-flex-col tw-gap-0.5">
        <div className="tw-flex tw-items-center tw-gap-2">
          <span className="tw-text-[15px] tw-font-medium tw-text-fg">
            {profile.name}
          </span>
          {isActive && (
            <span className="tw-text-[10px] tw-font-semibold tw-uppercase tw-tracking-wider tw-text-accent tw-border tw-border-accent/40 tw-rounded tw-px-1.5 tw-py-0.5">
              Active
            </span>
          )}
        </div>
        <span className="tw-text-xs tw-text-fg-subtle">
          {Object.keys(profile.primitives).length} primitive
          {Object.keys(profile.primitives).length !== 1 ? "s" : ""} configured
        </span>
      </div>
      <div className="tw-flex tw-items-center tw-gap-2 tw-flex-shrink-0">
        <button
          type="button"
          onClick={() => exportProfile(profile)}
          title="Export as JSON"
          className="tw-text-sm tw-text-fg-subtle tw-border tw-border-border-default tw-rounded-lg tw-px-2.5 tw-py-1 hover:tw-bg-surface-hover hover:tw-text-fg tw-transition-colors"
        >
          Export
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="tw-text-sm tw-text-fg-subtle tw-border tw-border-border-default tw-rounded-lg tw-px-2.5 tw-py-1 hover:tw-bg-surface-hover hover:tw-text-fg tw-transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="tw-text-sm tw-text-fg-subtle tw-border tw-border-border-default tw-rounded-lg tw-px-2.5 tw-py-1 hover:tw-bg-surface-hover hover:tw-text-danger-fg tw-transition-colors"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={onActivate}
          className={`tw-text-sm tw-font-medium tw-px-3 tw-py-1.5 tw-rounded-lg tw-transition-colors ${
            isActive
              ? "tw-text-fg-subtle tw-border tw-border-border-default hover:tw-bg-surface-hover"
              : "tw-text-[--color-accent-fg] tw-bg-accent hover:tw-opacity-90"
          }`}
        >
          {isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Profiles page
// ---------------------------------------------------------------------------

type EditorMode =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; profile: Profile };

export default function Profiles() {
  const toast = useToast();
  const { getStatus } = useCapabilityCache();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorMode>({ type: "closed" });

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

      <div className="tw-flex tw-flex-col tw-gap-8">
        {/* Built-in presets */}
        <Section title="Built-in Presets" description="Curated by Toppings — activate in one tap, no configuration needed.">
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

        {/* Custom profiles */}
        <Section
          title="My Profiles"
          description="Create your own mix of YouTube experience settings."
          headerActions={
            editor.type === "closed" ? (
              <div className="tw-flex tw-items-center tw-gap-2">
                <label
                  title="Import profile from JSON"
                  className="tw-text-sm tw-text-fg-subtle tw-border tw-border-border-default tw-rounded-lg tw-px-3 tw-py-1.5 hover:tw-bg-surface-hover hover:tw-text-fg tw-transition-colors tw-cursor-pointer"
                >
                  Import
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="tw-hidden"
                    onChange={async (e) => {
                      const file = e.currentTarget.files?.[0];
                      if (!file) return;
                      const result = await importProfileFromFile(file);
                      e.currentTarget.value = "";
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
                </label>
                <button
                  type="button"
                  onClick={() => setEditor({ type: "create" })}
                  className="tw-text-sm tw-font-medium tw-text-[--color-accent-fg] tw-bg-accent tw-px-3 tw-py-1.5 tw-rounded-lg hover:tw-opacity-90 tw-transition-opacity"
                >
                  + New Profile
                </button>
              </div>
            ) : null
          }
        >
          <Card>
            {/* Inline create editor */}
            {editor.type === "create" && (
              <ProfileEditor
                initial={{ primitives: blankPrimitives() }}
                onSave={handleCreate}
                onCancel={() => setEditor({ type: "closed" })}
                getStatus={getStatus}
              />
            )}

            {custom.length === 0 && editor.type !== "create" ? (
              <div className="tw-py-8 tw-text-center tw-text-sm tw-text-fg-subtle">
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
                    getStatus={getStatus}
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
      </div>
    </>
  );
}
