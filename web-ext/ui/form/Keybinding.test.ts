import { afterEach, describe, expect, test } from "bun:test";
import { h, render } from "preact";
import { act } from "preact/test-utils";
import Keybinding from "./Keybinding";

const root = document.createElement("div");
document.body.append(root);

let changes: string[] = [];
let resets = 0;

const mount = (props: { value?: string; resettable?: boolean } = {}) => {
  act(() => {
    render(
      h(Keybinding, {
        label: "Seek forward",
        value: props.value ?? "L",
        onChange: (key: string) => changes.push(key),
        onReset: props.resettable ? () => resets++ : undefined,
      }),
      root,
    );
  });
  return root.querySelector("input")!;
};

const press = (input: HTMLInputElement, key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
  act(() => {
    input.dispatchEvent(event);
  });
  return event;
};

const focus = (input: HTMLInputElement) => act(() => input.focus());

afterEach(() => {
  act(() => render(null, root));
  changes = [];
  resets = 0;
});

describe("Keybinding", () => {
  test("records a key pressed while focused", () => {
    const input = mount();
    focus(input);
    expect(input.value).toBe("Press keys…");
    press(input, "k", { shiftKey: true });
    expect(changes).toEqual(["Shift+K"]);
  });

  test("lets Tab and Shift+Tab move focus instead of trapping it", () => {
    const input = mount();
    focus(input);
    expect(press(input, "Tab").defaultPrevented).toBe(false);
    expect(press(input, "Tab", { shiftKey: true }).defaultPrevented).toBe(false);
    expect(changes).toEqual([]);
  });

  test("Escape cancels recording without touching the binding", () => {
    const input = mount();
    focus(input);
    press(input, "Escape");
    expect(changes).toEqual([]);
    expect(input.value).toBe("L");
    press(input, "j");
    expect(changes).toEqual([]);
  });

  test("Enter starts recording again after a cancel", () => {
    const input = mount();
    focus(input);
    press(input, "Escape");
    press(input, "Enter");
    expect(input.value).toBe("Press keys…");
    press(input, "j");
    expect(changes).toEqual(["J"]);
  });

  test("Backspace unsets the binding", () => {
    const input = mount();
    focus(input);
    press(input, "Backspace");
    expect(changes).toEqual([""]);
  });

  test("offers a reset only when there is an override to drop", () => {
    mount();
    expect(root.querySelector("button[title='Back to the default shortcut']")).toBeNull();
    mount({ resettable: true });
    const reset = root.querySelector<HTMLButtonElement>("button[title='Back to the default shortcut']")!;
    act(() => reset.click());
    expect(resets).toBe(1);
  });
});
