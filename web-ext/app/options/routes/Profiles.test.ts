import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { h, render } from "preact";
import { act } from "preact/test-utils";
import { ToastProvider } from "@/ui/feedback/ToastProvider";
import { createProfile, getCustomProfiles, setActiveProfileId } from "@/features/profiles/store";
import { CHROME_STORAGE_LOCAL_KEY } from "@/lib/storageKeys";
import Profiles from "./Profiles";

const root = document.createElement("div");
document.body.append(root);

const settle = () => act(() => new Promise((r) => setTimeout(r, 20)));

const mount = async () => {
  act(() => {
    render(h(ToastProvider, null, h(Profiles, null)), root);
  });
  await settle();
};

const buttonNamed = (text: string) => [...root.querySelectorAll("button")].find((b) => b.textContent === text)!;

const cardOf = (name: string) =>
  [...root.querySelectorAll<HTMLElement>(".tw-py-3")].find((el) => el.textContent?.startsWith(name))!;

beforeEach(async () => {
  await chrome.storage.local.clear();
});
afterEach(() => {
  act(() => render(null, root));
  document.body.replaceChildren(root);
});

describe("Profiles page", () => {
  test("importing a file creates the profile and says so", async () => {
    await mount();
    const input = root.querySelector<HTMLInputElement>("input[type='file']")!;
    const file = new File([JSON.stringify({ name: "Study", primitives: { "watch.sidebar": { visible: false } } })], "study.json", { type: "application/json" });
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    act(() => {
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await settle();
    expect((await getCustomProfiles()).map((p) => p.name)).toEqual(["Study"]);
    expect(document.body.textContent).toContain('"Study" imported');
  });

  test("the Import button opens the file picker", async () => {
    await mount();
    const input = root.querySelector<HTMLInputElement>("input[type='file']")!;
    let opened = 0;
    input.addEventListener("click", () => opened++);
    const button = [...root.querySelectorAll("button")].find((b) => b.textContent === "Import")!;
    act(() => button.click());
    expect(opened).toBe(1);
  });

  test("follows a profile switched from elsewhere", async () => {
    await mount();
    expect(cardOf("Focus").textContent).toContain("Activate");
    await setActiveProfileId("preset:focus");
    await settle();
    expect(cardOf("Focus").textContent).toContain("Deactivate");
  });

  test("the Audio preset shows its screen by the option's name", async () => {
    await mount();
    expect(cardOf("Audio").textContent).toContain("Video screen: Visualizer");
  });

  test("a custom screen picks, previews and clears the device's image", async () => {
    await createProfile({ name: "Night", primitives: { "watch.visuals": { value: "custom" } } });
    await mount();
    act(() => buttonNamed("Edit").click());
    const input = root.querySelector<HTMLInputElement>("input[type='file'][accept='image/*']")!;
    let opened = 0;
    input.addEventListener("click", () => opened++);
    act(() => buttonNamed("Choose image").click());
    expect(opened).toBe(1);

    const file = new File([new Uint8Array([137, 80, 78, 71])], "cover.png", { type: "image/png" });
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    act(() => {
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await act(() => new Promise((r) => setTimeout(r, 100)));
    const key = CHROME_STORAGE_LOCAL_KEY.VISUALS_IMAGE;
    const stored = (await chrome.storage.local.get(key))[key];
    expect(stored).toStartWith("data:image/png;base64,");
    expect(root.querySelector("img")?.getAttribute("src")).toBe(stored);

    act(() => buttonNamed("Clear").click());
    await settle();
    expect(await chrome.storage.local.get(key)).toEqual({});
    expect(root.querySelector("img")).toBeNull();
  });
});
