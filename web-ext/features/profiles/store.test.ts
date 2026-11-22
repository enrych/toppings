import { beforeEach, expect, test } from "bun:test";
import { keybindings } from "@/kernel/keys";
import { schedulesStore, type Schedule } from "@/features/schedules/settings";
import { createProfile, deleteProfile } from "./store";

beforeEach(async () => {
  await chrome.storage.local.clear();
  await chrome.storage.sync.clear();
});

test("deleting a profile takes its schedules and its shortcut with it", async () => {
  const mine = await createProfile({ name: "Mine", primitives: {} });
  const schedule = (id: string, profileId: string): Schedule => ({ id, profileId, enabled: true, rule: { kind: "place", placeId: "home" } });
  await schedulesStore.set({ schedules: [schedule("a", mine.id), schedule("b", "preset:audio")] });
  await keybindings.set({ [`profiles.${mine.id}`]: "M", "profiles.preset:audio": "Shift+B" });

  await deleteProfile(mine.id);

  expect((await schedulesStore.get()).schedules.map((s) => s.id)).toEqual(["b"]);
  expect(await keybindings.get()).toEqual({ "profiles.preset:audio": "Shift+B" });
});
