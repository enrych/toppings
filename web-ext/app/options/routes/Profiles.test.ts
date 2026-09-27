import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { h, render } from "preact";
import { act } from "preact/test-utils";
import { ToastProvider } from "@/ui/feedback/ToastProvider";
import { getCustomProfiles, setActiveProfileId } from "@/features/profiles/store";
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
});
