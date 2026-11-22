import { describe, expect, test } from "bun:test";
import { matchesBinding } from "./keybinding";

const key = (k: string, init: KeyboardEventInit = {}) => new KeyboardEvent("keydown", { key: k, ...init });

describe("matchesBinding", () => {
  test("modifiers must match exactly", () => {
    expect(matchesBinding(key("q", { shiftKey: true }), "Shift+Q")).toBe(true);
    expect(matchesBinding(key("q", { shiftKey: true }), "Q")).toBe(false);
  });

  test("modifier names match regardless of case", () => {
    expect(matchesBinding(key("1", { ctrlKey: true }), "ctrl+1")).toBe(true);
    expect(matchesBinding(key("1"), "ctrl+1")).toBe(false);
  });

  test("an unknown modifier never matches", () => {
    expect(matchesBinding(key("1"), "Hyper+1")).toBe(false);
  });
});
