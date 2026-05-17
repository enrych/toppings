import { ISO8601_DURATION_PATTERN, NUMBER } from "@toppings/constants";
import { defaultTo } from "./access";

export function parseDuration(duration: string): number {
  const match = ISO8601_DURATION_PATTERN.exec(duration);
  if (!match) return 0;

  const hours = Number.parseInt(defaultTo(match[1], NUMBER.S0));
  const minutes = Number.parseInt(defaultTo(match[2], NUMBER.S0));
  const seconds = Number.parseFloat(defaultTo(match[3], NUMBER.S0));

  return hours * 3600 + minutes * 60 + seconds;
}
