import { defineKeys, type KeyGroup } from "@/kernel/keys";
import { PRESET_AUDIO, type Profile } from "./profiles";

export const profilesKeys = defineKeys({
  id: "profiles",
  title: "Profiles",
  keys: {
    cycle: { label: "Cycle profiles", description: "Default, then each preset, then your own profiles.", defaultBinding: "" },
  },
});

// One toggle per profile, keyed by its id so a binding survives a rename.
// Audio keeps the B it had as audio mode in 3.x.
export function profileToggleKeys(profiles: readonly Profile[]): KeyGroup {
  return defineKeys({
    id: profilesKeys.id,
    title: profilesKeys.title,
    keys: Object.fromEntries(
      profiles.map((profile) => [
        profile.id,
        { label: profile.name, description: `Switch to ${profile.name}; press again to go back.`, defaultBinding: profile.id === PRESET_AUDIO.id ? "B" : "" },
      ]),
    ),
  });
}
