import {
  BUILT_IN_PRESETS,
  DEFAULT_PROFILE_STORE,
  type Profile,
  type ProfileStore,
} from "../data/profiles";
import { CHROME_STORAGE_LOCAL_KEY } from "../data/core";

const PROFILE_STORE_KEY = CHROME_STORAGE_LOCAL_KEY.PROFILE_STORE;

async function readProfileStore(): Promise<ProfileStore> {
  return new Promise((resolve) => {
    chrome.storage.local.get(PROFILE_STORE_KEY, (result) => {
      const stored = result[PROFILE_STORE_KEY] as ProfileStore | undefined;
      if (!stored) {
        resolve({ ...DEFAULT_PROFILE_STORE });
        return;
      }
      // Rebuilt field by field rather than spread: a record written by an older
      // version may be missing keys the callers below index into unconditionally.
      resolve({
        activeProfileId: stored.activeProfileId ?? null,
        profiles: Array.isArray(stored.profiles) ? stored.profiles : [],
      });
    });
  });
}

async function writeProfileStore(store: ProfileStore): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [PROFILE_STORE_KEY]: store }, resolve);
  });
}

// Includes the built-in presets. Callers that want only the user's own profiles
// want getCustomProfiles instead.
export async function getAllProfiles(): Promise<Profile[]> {
  const { profiles } = await readProfileStore();
  return [
    ...BUILT_IN_PRESETS,
    ...profiles.sort((a, b) => a.createdAt - b.createdAt),
  ];
}

export async function getCustomProfiles(): Promise<Profile[]> {
  const { profiles } = await readProfileStore();
  return profiles.sort((a, b) => a.createdAt - b.createdAt);
}

export async function getProfileById(
  id: string,
): Promise<Profile | undefined> {
  const preset = BUILT_IN_PRESETS.find((p) => p.id === id);
  if (preset) return preset;
  const { profiles } = await readProfileStore();
  return profiles.find((p) => p.id === id);
}

export async function getActiveProfile(): Promise<Profile | null> {
  const { activeProfileId } = await readProfileStore();
  if (!activeProfileId) return null;
  return (await getProfileById(activeProfileId)) ?? null;
}

// null means no profile is active, which falls back to individual preferences
// rather than to a default profile.
export async function setActiveProfileId(id: string | null): Promise<void> {
  const store = await readProfileStore();
  await writeProfileStore({ ...store, activeProfileId: id });
}

export async function createProfile(
  data: Omit<Profile, "id" | "isPreset" | "createdAt">,
): Promise<Profile> {
  const store = await readProfileStore();
  const profile: Profile = {
    ...data,
    id: crypto.randomUUID(),
    isPreset: false,
    createdAt: Date.now(),
  };
  await writeProfileStore({
    ...store,
    profiles: [...store.profiles, profile],
  });
  return profile;
}

// Presets are read-only, and a write targeting one is ignored rather than
// throwing — the options UI relies on that to keep its edit path uniform.
export async function updateProfile(
  id: string,
  patch: Partial<Omit<Profile, "id" | "isPreset" | "createdAt">>,
): Promise<void> {
  if (BUILT_IN_PRESETS.some((p) => p.id === id)) return;
  const store = await readProfileStore();
  await writeProfileStore({
    ...store,
    profiles: store.profiles.map((p) =>
      p.id === id ? { ...p, ...patch } : p,
    ),
  });
}

// Deleting the active profile also clears the active id, so nothing is left
// pointing at a profile that no longer exists.
export async function deleteProfile(id: string): Promise<void> {
  if (BUILT_IN_PRESETS.some((p) => p.id === id)) return;
  const store = await readProfileStore();
  const activeProfileId =
    store.activeProfileId === id ? null : store.activeProfileId;
  await writeProfileStore({
    activeProfileId,
    profiles: store.profiles.filter((p) => p.id !== id),
  });
}
