import { afterEach, describe, expect, test } from "bun:test";
import { h, render } from "preact";
import { act } from "preact/test-utils";
import Shortcuts from "@/app/options/routes/Shortcuts";
import Profiles from "@/app/options/routes/Profiles";
import { ToastProvider } from "@/ui/feedback/ToastProvider";
import OptionsSearch from "./OptionsSearch";
import { SEARCH_INDEX } from "./searchIndex";

const root = document.createElement("div");
document.body.append(root);

const wait = (ms: number) => act(() => new Promise((r) => setTimeout(r, ms)));

afterEach(() => {
  act(() => render(null, root));
});

describe("options search", () => {
  test("a Shorts shortcut result flashes the Shorts row, not the Playback one with the same label", async () => {
    act(() => {
      render(h("div", null, h(OptionsSearch, null), h(Shortcuts, null)), root);
    });
    const search = root.querySelector<HTMLInputElement>("input[aria-label='Search settings']")!;
    act(() => {
      search.value = "Seek forward";
      search.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const result = [...root.querySelectorAll("button")].find((b) => b.textContent === "Seek forwardShortcuts › Shorts")!;
    act(() => result.click());
    await wait(200);
    const flashed = root.querySelector(".tppng-section-flash");
    expect(flashed?.closest("section")?.id).toBe("shorts");
  });

  test("Profiles section entries match the rendered headings", async () => {
    act(() => {
      render(h(ToastProvider, null, h(Profiles, null)), root);
    });
    await wait(20);
    const headings = [...root.querySelectorAll("h2")].map((el) => el.textContent);
    const sections = SEARCH_INDEX.filter((e) => e.page === "Profiles" && e.label === e.section).map((e) => e.label);
    expect(sections.length).toBeGreaterThan(0);
    for (const label of sections) expect(headings).toContain(label);
  });
});
