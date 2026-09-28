import { defineSettings } from "@/kernel/settings";
import { CHROME_STORAGE_LOCAL_KEY } from "@/lib/storageKeys";
import { BUILT_IN_PRESETS, type Profile } from "./profiles";

interface ProfileStore {
  // null runs on individual preferences rather than on a default profile.
  activeProfileId: string | null;
  // Custom profiles only; presets are constants.
  profiles: Profile[];
  // What a profile's shortcut returns to when pressed again.
  previousProfileId: string | null;
}

export const profileStore = defineSettings<ProfileStore>(
  "profiles",
  { activeProfileId: null, profiles: [], previousProfileId: null },
  {
    area: "local",
    legacy: (store) => store[CHROME_STORAGE_LOCAL_KEY.PROFILE_STORE] as Partial<ProfileStore> | undefined,
  },
);

const byCreation = (profiles: Profile[]) => [...profiles].sort((a, b) => a.createdAt - b.createdAt);

export async function getCustomProfiles(): Promise<Profile[]> {
  return byCreation((await profileStore.get()).profiles);
}

export async function getAllProfiles(): Promise<Profile[]> {
  return [...BUILT_IN_PRESETS, ...(await getCustomProfiles())];
}

export async function getProfileById(id: string): Promise<Profile | undefined> {
  return BUILT_IN_PRESETS.find((p) => p.id === id) ?? (await getCustomProfiles()).find((p) => p.id === id);
}

export async function getActiveProfile(): Promise<Profile | null> {
  const { activeProfileId } = await profileStore.get();
  return activeProfileId ? ((await getProfileById(activeProfileId)) ?? null) : null;
}

export function setActiveProfileId(activeProfileId: string | null): Promise<void> {
  return profileStore.set({ activeProfileId });
}

// A profile's shortcut switches to it, and pressing it again goes back to
// whatever was active before, so Audio can be flipped on and off over Focus.
export async function toggleProfile(id: string): Promise<Profile | null> {
  const { activeProfileId, previousProfileId } = await profileStore.get();
  const next = activeProfileId === id ? previousProfileId : id;
  await profileStore.set({ activeProfileId: next, previousProfileId: activeProfileId === id ? null : activeProfileId });
  return next ? ((await getProfileById(next)) ?? null) : null;
}

export async function createProfile(data: Pick<Profile, "name" | "primitives">): Promise<Profile> {
  const profile: Profile = { ...data, id: crypto.randomUUID(), isPreset: false, createdAt: Date.now() };
  const { profiles } = await profileStore.get();
  await profileStore.set({ profiles: [...profiles, profile] });
  return profile;
}

// A write targeting a preset is ignored rather than thrown, so the options
// page can keep one edit path for every profile.
export async function updateProfile(id: string, patch: Partial<Pick<Profile, "name" | "primitives">>): Promise<void> {
  const { profiles } = await profileStore.get();
  await profileStore.set({ profiles: profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
}

export async function deleteProfile(id: string): Promise<void> {
  const { profiles, activeProfileId } = await profileStore.get();
  await profileStore.set({
    profiles: profiles.filter((p) => p.id !== id),
    activeProfileId: activeProfileId === id ? null : activeProfileId,
  });
}

export const subscribeProfiles = (listener: () => void) => profileStore.subscribe(listener);
