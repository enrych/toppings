import { NUMBER } from "@toppings/constants";

export type RoundOptions = {
  /** When `value` is NaN or ±Infinity. Defaults to `0`. */
  whenNonFinite?: number;
};

export function round(value: number, options: RoundOptions = {}): number {
  const { whenNonFinite = NUMBER.N0 } = options;
  if (!Number.isFinite(value)) return whenNonFinite;
  return Math.round(value);
}
