import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { h, render } from "preact";
import { act } from "preact/test-utils";
import { keybindings } from "@/kernel/keys";
import { createProfile } from "@/features/profiles/store";
import Shortcuts from "./Shortcuts";

const root = document.createElement("div");
document.body.append(root);

const settle = () => act(() => new Promise((r) => setTimeout(r, 20)));

const mount = async () => {
  act(() => {
    render(h(Shortcuts, null), root);
  });
  await settle();
};

const profileRows = () => [...root.querySelectorAll<HTMLElement>("section#profiles label")].map((el) => el.textContent);

const inputOf = (label: string) => {
  const labelEl = [...root.querySelectorAll<HTMLLabelElement>("section#profiles label")].find((el) => el.textContent === label)!;
  return root.querySelector<HTMLInputElement>(`[id="${labelEl.htmlFor}"]`)!;
};

beforeEach(async () => {
  await chrome.storage.local.clear();
  await chrome.storage.sync.clear();
});
afterEach(() => {
  act(() => render(null, root));
});

describe("Shortcuts page", () => {
  test("lists cycle and a shortcut per profile in the Profiles group", async () => {
    await mount();
    expect(profileRows()).toEqual(["Cycle profiles", "Audio", "Focus"]);
    expect(inputOf("Audio").value).toBe("B");
  });

  test("a profile's shortcut is stored under its profile id", async () => {
    await mount();
    const input = inputOf("Focus");
    act(() => input.focus());
    act(() => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "f", bubbles: true, cancelable: true }));
    });
    await settle();
    expect(await keybindings.get()).toEqual({ "profiles.preset:focus": "F" });
  });

  test("a profile created elsewhere gets a row", async () => {
    await mount();
    await createProfile({ name: "Study", primitives: {} });
    await settle();
    expect(profileRows()).toContain("Study");
  });
});
