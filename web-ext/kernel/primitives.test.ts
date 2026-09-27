import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { definePrimitive, runPrimitives } from "./primitives";

const hide = definePrimitive<{ visible: boolean }>({
  id: "watch.box",
  label: "Box",
  routes: ["watch"],
  strategies: ["#missing", ".box"],
  parse: () => undefined,
  apply: (el, { visible }) => (el.style.display = visible ? "" : "none"),
  reset: (el) => (el.style.display = ""),
});

const blur = definePrimitive<{ mode: string }>({
  id: "home.thumbs",
  label: "Thumbs",
  routes: ["home"],
  strategies: ["img"],
  all: true,
  parse: () => undefined,
  apply: (el, { mode }) => (el.style.filter = mode === "blur" ? "blur(12px)" : ""),
  reset: (el) => (el.style.filter = ""),
});

const frame = () => new Promise((r) => requestAnimationFrame(() => r(undefined)));
const box = () => document.querySelector<HTMLElement>(".box")!;

beforeEach(() => {
  document.body.innerHTML = `<div class="box"></div><div class="other"></div>`;
});
afterEach(() => {
  document.body.innerHTML = "";
});

describe("runPrimitives", () => {
  test("applies on start and restores on stop", () => {
    const run = runPrimitives([hide], { "watch.box": { visible: false } }, "watch");
    expect(box().style.display).toBe("none");
    run.stop();
    expect(box().style.display).toBe("");
  });

  test("acts on the live page, not one YouTube keeps hidden after navigating away", () => {
    document.body.innerHTML = `<ytd-browse hidden><div class="box" id="parked"></div></ytd-browse><div class="box" id="live"></div>`;
    const run = runPrimitives([hide], { "watch.box": { visible: false } }, "watch");
    expect(document.getElementById("parked")!.style.display).toBe("");
    expect(document.getElementById("live")!.style.display).toBe("none");
    run.stop();
  });

  test("ignores primitives for other routes and absent values", () => {
    const run = runPrimitives([hide, blur], {}, "watch");
    expect(box().style.display).toBe("");
    run.stop();
  });

  test("keeps applying as the page re-renders", async () => {
    document.body.innerHTML = `<img id="a">`;
    const run = runPrimitives([blur], { "home.thumbs": { mode: "blur" } }, "home");
    expect(document.getElementById("a")!.style.filter).toBe("blur(12px)");
    const late = document.createElement("img");
    late.id = "b";
    document.body.append(late);
    await frame();
    await frame();
    expect(late.style.filter).toBe("blur(12px)");
    run.stop();
    expect(late.style.filter).toBe("");
  });

  test("resets an element the selector no longer matches", async () => {
    const run = runPrimitives([hide], { "watch.box": { visible: false } }, "watch");
    const first = box();
    first.className = "other";
    const next = document.createElement("div");
    next.className = "box";
    document.body.append(next);
    await frame();
    await frame();
    expect(first.style.display).toBe("");
    expect(next.style.display).toBe("none");
    run.stop();
  });

  test("set changes a value at runtime", () => {
    const run = runPrimitives([hide], {}, "watch");
    run.set("watch.box", { visible: false });
    expect(box().style.display).toBe("none");
    expect(run.get("watch.box")).toEqual({ visible: false });
    run.set("watch.box", { visible: true });
    expect(box().style.display).toBe("");
    run.stop();
  });
});
