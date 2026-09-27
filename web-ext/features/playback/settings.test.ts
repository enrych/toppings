import { describe, expect, test } from "bun:test";
import { parseRates } from "./settings";

describe("parseRates", () => {
  test("empty means YouTube's own menu", () => {
    expect(parseRates("  ")).toEqual([]);
  });
  test("sorts, dedupes and requires 1", () => {
    expect(parseRates("2, 1, 1.5,2")).toEqual([1, 1.5, 2]);
    expect(parseRates("1.5, 2")).toBeUndefined();
  });
  test("rejects out-of-range and junk", () => {
    expect(parseRates("1, 17")).toBeUndefined();
    expect(parseRates("1, fast")).toBeUndefined();
  });
});
