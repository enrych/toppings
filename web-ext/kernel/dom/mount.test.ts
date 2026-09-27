import { afterEach, describe, expect, test } from "bun:test";
import { h } from "preact";
import { mount } from "./mount";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("mount", () => {
  test("replaces a host left behind by a reloaded extension", () => {
    document.body.innerHTML = `<div id="tppng-x">stale</div>`;
    const ui = mount("tppng-x", document.body, h("span", null, "fresh"));
    expect(document.querySelectorAll("#tppng-x").length).toBe(1);
    ui.unmount();
  });

  test("leaves another live mount's host alone, and each unmount removes its own", () => {
    const live = mount("tppng-x", document.body, h("span", null, "live"));
    const stale = mount("tppng-x", document.body, h("span", null, "stale"));
    stale.unmount();
    expect(document.getElementById("tppng-x")).toBe(live.host);
    live.unmount();
    expect(document.getElementById("tppng-x")).toBeNull();
  });
});
