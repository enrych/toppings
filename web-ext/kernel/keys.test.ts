import { beforeEach, describe, expect, test } from "bun:test";
import { actionId, bindKeys, bindingOf, defineKeys, keybindings } from "./keys";

const group = defineKeys({
  id: "demo",
  title: "Demo",
  keys: {
    go: { label: "Go", defaultBinding: "G" },
    back: { label: "Back", defaultBinding: "Shift+B" },
  },
});

const press = (key: string, init: KeyboardEventInit = {}, target: EventTarget = document.body) =>
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...init }));

beforeEach(async () => {
  await chrome.storage.sync.clear();
  document.body.innerHTML = "";
});

describe("key bindings", () => {
  test("default bindings run their handler and nothing else", () => {
    const ran: string[] = [];
    const unbind = bindKeys(group, { go: () => ran.push("go"), back: () => ran.push("back") });
    press("g");
    press("b", { shiftKey: true });
    press("b");
    unbind();
    expect(ran).toEqual(["go", "back"]);
  });

  test("unbound handlers no longer run", () => {
    let count = 0;
    const unbind = bindKeys(group, { go: () => count++, back: () => {} });
    unbind();
    press("g");
    expect(count).toBe(0);
  });

  test("keys are ignored while typing", () => {
    document.body.innerHTML = `<input id="i">`;
    let count = 0;
    const unbind = bindKeys(group, { go: () => count++, back: () => {} });
    press("g", {}, document.getElementById("i")!);
    unbind();
    expect(count).toBe(0);
  });

  test("a stored binding overrides the default", async () => {
    await keybindings.set({ [actionId(group, "go")]: "K" });
    expect(bindingOf(group, "go", await keybindings.get())).toBe("K");
    expect(bindingOf(group, "back", await keybindings.get())).toBe("Shift+B");
  });
});
