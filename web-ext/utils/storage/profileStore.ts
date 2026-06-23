import {
  BUILT_IN_PRESETS,
  DEFAULT_PROFILE_STORE,
  type Profile,
  type ProfileStore,
} from "../../data/profiles.data";

// ---------------------------------------------------------------------------
// Storage key
// ---------------------------------------------------------------------------

const PROFILE_STORE_KEY = "toppings:profile_store";

// ---------------------------------------------------------------------------
// Low-level read / write
// ---------------------------------------------------------------------------

async function readProfileStore(): Promise<ProfileStore> {
  return new Promise((resolve) => {
    chrome.storage.local.get(PROFILE_STORE_KEY, (result) => {
      const stored = result[PROFILE_STORE_KEY] as ProfileStore | undefined;
      if (!stored) {
        resolve({ ...DEFAULT_PROFILE_STORE });
        return;
      }
      // Ensure shape is complete — defensive merge with defaults.
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

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Return all profiles: built-in presets first, then user-created profiles
 * sorted by creation date (newest last).
 */
export async function getAllProfiles(): Promise<Profile[]> {
  const { profiles } = await readProfileStore();
  return [
    ...BUILT_IN_PRESETS,
    ...profiles.sort((a, b) => a.createdAt - b.createdAt),
  ];
}

/**
 * Return only user-created (non-preset) profiles.
 */
export async function getCustomProfiles(): Promise<Profile[]> {
  const { profiles } = await readProfileStore();
  return profiles.sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Look up a profile by ID. Checks presets first, then custom profiles.
 * Returns undefined if no match.
 */
export async function getProfileById(
  id: string,
): Promise<Profile | undefined> {
  const preset = BUILT_IN_PRESETS.find((p) => p.id === id);
  if (preset) return preset;
  const { profiles } = await readProfileStore();
  return profiles.find((p) => p.id === id);
}

/**
 * Get the currently active profile, or null if no profile is active.
 */
export async function getActiveProfile(): Promise<Profile | null> {
  const { activeProfileId } = await readProfileStore();
  if (!activeProfileId) return null;
  return (await getProfileById(activeProfileId)) ?? null;
}

/**
 * Set the active profile by ID. Pass null to deactivate all profiles
 * (extension falls back to individual preferences).
 */
export async function setActiveProfileId(id: string | null): Promise<void> {
  const store = await readProfileStore();
  await writeProfileStore({ ...store, activeProfileId: id });
}

/**
 * Create a new custom profile. Returns the created profile.
 */
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

/**
 * Update an existing custom profile. Silently ignores attempts to update
 * built-in presets.
 */
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

/**
 * Delete a custom profile. If the deleted profile was active, deactivates it.
 * Silently ignores attempts to delete built-in presets.
 */
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
