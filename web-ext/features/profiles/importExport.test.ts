import { describe, expect, test } from "bun:test";
import { parseProfileJson } from "./importExport";

describe("parseProfileJson", () => {
  test("accepts a bare name and primitives object", () => {
    const result = parseProfileJson({ name: " Study ", primitives: { "watch.sidebar": { visible: false }, "home.thumbnails": { mode: "blur" } } });
    expect(result).toEqual({ ok: true, name: "Study", primitives: { "watch.sidebar": { visible: false }, "home.thumbnails": { mode: "blur" } } });
  });

  test("skips unknown primitives and rejects bad values", () => {
    expect(parseProfileJson({ name: "x", primitives: { "future.thing": { on: true } } })).toEqual({ ok: true, name: "x", primitives: {} });
    expect(parseProfileJson({ name: "x", primitives: { "watch.layout": { value: "sideways" } } })).toMatchObject({ ok: false });
  });

  test("rejects missing name or malformed shapes", () => {
    expect(parseProfileJson([])).toMatchObject({ ok: false });
    expect(parseProfileJson({ primitives: {} })).toMatchObject({ ok: false });
    expect(parseProfileJson({ name: "x", primitives: [] })).toMatchObject({ ok: false });
  });
});
