import { defineKeys } from "@/kernel/keys";

export const profilesKeys = defineKeys({
  id: "profiles",
  title: "Profiles",
  keys: {
    cycle: { label: "Cycle profiles", description: "Default, then each preset, then your own profiles.", defaultBinding: "" },
  },
});
