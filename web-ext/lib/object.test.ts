import { expect, test } from "bun:test";

import { mergeDefaults } from "./object";

const defaults = { a: 1, nested: { x: "d", deep: { y: true } }, list: [1] };

test("stored values win, missing ones fall back to defaults", () => {
  expect(mergeDefaults(defaults, { a: 2, nested: { deep: {} } })).toEqual({
    a: 2,
    nested: { x: "d", deep: { y: true } },
    list: [1],
  });
});

test("arrays replace, they don't merge", () => {
  expect(mergeDefaults(defaults, { list: [] }).list).toEqual([]);
});

test("unknown keys are dropped", () => {
  expect(mergeDefaults(defaults, { gone: 1 })).toEqual(defaults);
});

test("type-mismatched stored values don't crash", () => {
  expect(mergeDefaults(defaults, { nested: null }).nested).toEqual(defaults.nested);
  expect(mergeDefaults(defaults, { nested: "oops" }).nested).toBe("oops" as never);
});
