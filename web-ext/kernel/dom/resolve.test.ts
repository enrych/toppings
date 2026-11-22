import { afterEach, describe, expect, test } from "bun:test";
import { resolveTarget } from "./resolve";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("resolveTarget", () => {
  test("prefers the earliest strategy that matches", async () => {
    document.body.innerHTML = `<div class="b"></div><div class="a"></div>`;
    const found = await resolveTarget([".a", ".b"]);
    expect(found.strategyIndex).toBe(0);
  });

  test("skips elements on a page YouTube has hidden", async () => {
    document.body.innerHTML = `<ytd-browse hidden><div class="header" id="old"></div></ytd-browse><ytd-browse><div class="header" id="live"></div></ytd-browse>`;
    const found = await resolveTarget([".header"]);
    expect(found.element?.id).toBe("live");
  });

  test("skips elements under display: none", async () => {
    document.body.innerHTML = `<div style="display: none"><div class="header" id="parked"></div></div><div class="header" id="shown"></div>`;
    const found = await resolveTarget([".header"]);
    expect(found.element?.id).toBe("shown");
  });

  test("waits for a live element to appear", async () => {
    document.body.innerHTML = `<ytd-browse hidden><div class="header"></div></ytd-browse>`;
    const pending = resolveTarget([".header"], { timeout: 1000 });
    setTimeout(() => document.body.insertAdjacentHTML("beforeend", `<div class="header" id="late"></div>`), 20);
    expect((await pending).element?.id).toBe("late");
  });

  test("resolves once a hidden page is shown again", async () => {
    document.body.innerHTML = `<ytd-browse hidden id="page"><div class="header" id="back"></div></ytd-browse>`;
    const pending = resolveTarget([".header"], { timeout: 1000 });
    setTimeout(() => document.getElementById("page")!.removeAttribute("hidden"), 20);
    expect((await pending).element?.id).toBe("back");
  });

  test("gives up after the timeout", async () => {
    const found = await resolveTarget([".never"], { timeout: 30 });
    expect(found.resolved).toBe(false);
  });
});
