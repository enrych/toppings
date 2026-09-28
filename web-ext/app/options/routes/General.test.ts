import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { h, render } from "preact";
import { act } from "preact/test-utils";
import { ToastProvider } from "@/ui/feedback/ToastProvider";
import { profilesSettings } from "@/features/profiles/settings";
import General from "./General";

const root = document.createElement("div");
document.body.append(root);

const settle = () => act(() => new Promise((r) => setTimeout(r, 20)));

beforeEach(async () => {
  await chrome.storage.sync.clear();
});
afterEach(() => {
  act(() => render(null, root));
});

describe("General page", () => {
  test("the audio button switch writes the profiles surfaces slice", async () => {
    act(() => {
      render(h(ToastProvider, null, h(General, null)), root);
    });
    await settle();
    const label = [...root.querySelectorAll<HTMLLabelElement>("label")].find((el) => el.textContent === "Audio button in the player")!;
    const toggle = root.querySelector<HTMLButtonElement>(`[id="${label.htmlFor}"]`)!;
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    act(() => toggle.click());
    await settle();
    expect((await profilesSettings.get()).audioButton).toBe(false);
  });
});
