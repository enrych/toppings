import { beforeEach, expect, test } from "bun:test";
import { keybindings } from "@/kernel/keys";
import { createProfile, deleteProfile } from "./store";

beforeEach(async () => {
  await chrome.storage.local.clear();
  await chrome.storage.sync.clear();
});

test("deleting a profile takes its shortcut with it", async () => {
  const mine = await createProfile({ name: "Mine", primitives: {} });
  await keybindings.set({ [`profiles.${mine.id}`]: "M", "profiles.preset:audio": "Shift+B" });

  await deleteProfile(mine.id);

  expect(await keybindings.get()).toEqual({ "profiles.preset:audio": "Shift+B" });
});
