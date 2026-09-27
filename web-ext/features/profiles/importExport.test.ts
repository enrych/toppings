import { describe, expect, spyOn, test } from "bun:test";
import { exportProfile, parseProfileJson } from "./importExport";

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

describe("exportProfile", () => {
  test("keeps the download URL alive past the click", () => {
    const create = spyOn(URL, "createObjectURL").mockReturnValue("blob:profile");
    const revoke = spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const click = spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    exportProfile({ id: "p", name: "Study", isPreset: false, createdAt: 0, primitives: {} });
    expect(click).toHaveBeenCalledTimes(1);
    expect(revoke).not.toHaveBeenCalled();
    create.mockRestore();
    revoke.mockRestore();
    click.mockRestore();
  });
});
