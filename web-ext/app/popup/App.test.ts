import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { h, render } from "preact";
import { act } from "preact/test-utils";
import { scheduleState } from "@/features/schedules/state";
import { skipSchedule } from "@/features/schedules/messages";
import App from "./App";

const root = document.createElement("div");
document.body.append(root);
const originalSendMessage = chrome.runtime.sendMessage;
let sent: unknown[] = [];

const settle = () => act(() => new Promise((r) => setTimeout(r, 20)));

const mount = async () => {
  act(() => {
    render(h(App, null), root);
  });
  await settle();
};

const statusLine = () => root.querySelector("[role='status']");
const skipButton = () => [...root.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Skip");

beforeEach(async () => {
  await chrome.storage.local.clear();
  sent = [];
  Object.assign(chrome, { tabs: { query: async () => [] } });
  Object.assign(chrome.runtime, {
    sendMessage: async (message: unknown) => {
      sent.push(message);
      return { response: undefined };
    },
  });
});
afterEach(() => {
  act(() => render(null, root));
  Object.assign(chrome.runtime, { sendMessage: originalSendMessage });
  Reflect.deleteProperty(chrome, "tabs");
});

describe("popup schedule line", () => {
  test("shows nothing while no schedule has anything to say", async () => {
    await mount();
    expect(statusLine()).toBeNull();
  });

  test("an upcoming change is shown without a Skip", async () => {
    await scheduleState.set({ status: "Audio turns on at 09:00", inCharge: null });
    await mount();
    expect(statusLine()?.textContent).toBe("Audio turns on at 09:00");
    expect(skipButton()).toBeUndefined();
  });

  test("Skip asks the background to skip the schedule in charge", async () => {
    await scheduleState.set({ status: "Audio on by schedule until 18:00", inCharge: "work" });
    await mount();
    expect(statusLine()?.textContent).toBe("Audio on by schedule until 18:00");
    act(() => skipButton()!.click());
    await settle();
    expect(sent).toEqual([{ kind: skipSchedule.kind, request: undefined }]);
  });
});
