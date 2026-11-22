import { afterEach, describe, expect, test } from "bun:test";
import { h, render } from "preact";
import { act } from "preact/test-utils";
import Select from "./Select";

const root = document.createElement("div");
document.body.append(root);

const options = [
  { value: "off", label: "Off" },
  { value: "last-used", label: "Last used" },
  { value: "default", label: "Default" },
];

let picked: string[] = [];

const mount = (value: string) => {
  act(() => {
    render(h(Select<string>, { label: "Auto-load", value, options, onChange: (v: string) => picked.push(v) }), root);
  });
  return root.querySelector("button")!;
};

const press = (button: HTMLButtonElement, key: string) =>
  act(() => {
    button.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });

afterEach(() => {
  act(() => render(null, root));
  picked = [];
});

describe("Select", () => {
  test("Enter twice keeps the saved value that arrived after mount", () => {
    mount("off");
    const button = mount("default");
    press(button, "Enter");
    press(button, "Enter");
    expect(picked).toEqual(["default"]);
  });

  test("arrows move from the current value when the list opens", () => {
    mount("off");
    const button = mount("last-used");
    press(button, "ArrowDown");
    press(button, "ArrowDown");
    press(button, "Enter");
    expect(picked).toEqual(["default"]);
  });
});
