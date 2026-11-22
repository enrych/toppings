import { describe, expect, test } from "bun:test";
import { isNudgeMax, isNudgeStep, isSeconds } from "./validators";

describe("options validators", () => {
  test("seconds must be a positive number, not a blank field", () => {
    expect(isSeconds("5")).toBe(true);
    expect(isSeconds("0.5")).toBe(true);
    expect(isSeconds("")).toBe(false);
    expect(isSeconds("  ")).toBe(false);
    expect(isSeconds("0")).toBe(false);
    expect(isSeconds("-1")).toBe(false);
    expect(isSeconds("abc")).toBe(false);
    expect(isSeconds("Infinity")).toBe(false);
  });

  test("the nudge step stays at or under the maximum, and the maximum at or over the step", () => {
    expect(isNudgeStep("2", 16)).toBe(true);
    expect(isNudgeStep("16", 16)).toBe(true);
    expect(isNudgeStep("20", 16)).toBe(false);
    expect(isNudgeStep("", 16)).toBe(false);
    expect(isNudgeMax("16", 1)).toBe(true);
    expect(isNudgeMax("1", 1)).toBe(true);
    expect(isNudgeMax("0.5", 1)).toBe(false);
    expect(isNudgeMax(" ", 1)).toBe(false);
  });
});
