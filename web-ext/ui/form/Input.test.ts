import { afterEach, describe, expect, test } from "bun:test";
import { h, render } from "preact";
import { act } from "preact/test-utils";
import Input from "./Input";

const root = document.createElement("div");
document.body.append(root);

let committed: string[] = [];

const mount = () => {
  act(() => {
    render(
      h(Input, {
        label: "Seek forward",
        initialValue: "5",
        validator: (v: string) => Number(v) > 0,
        onChange: (v: string) => committed.push(v),
      }),
      root,
    );
  });
  return root.querySelector("input")!;
};

const type = (input: HTMLInputElement, value: string) =>
  act(() => {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

const unmount = () => act(() => render(null, root));

afterEach(() => {
  unmount();
  committed = [];
});

describe("Input", () => {
  test("commits a valid value after the pause in typing", async () => {
    type(mount(), "10");
    expect(committed).toEqual([]);
    await new Promise((r) => setTimeout(r, 550));
    expect(committed).toEqual(["10"]);
  });

  test("an edit still pending when the page goes away is committed, not lost", () => {
    type(mount(), "10");
    unmount();
    expect(committed).toEqual(["10"]);
  });

  test("an invalid pending edit is dropped on unmount", () => {
    type(mount(), "-1");
    unmount();
    expect(committed).toEqual([]);
  });

  test("a committed edit is not committed again on unmount", async () => {
    type(mount(), "10");
    await new Promise((r) => setTimeout(r, 550));
    unmount();
    expect(committed).toEqual(["10"]);
  });
});
