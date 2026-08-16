import { ISO8601_DURATION } from "../constants";

export function parseDuration(duration: string): number {
  const match = ISO8601_DURATION.exec(duration);
  if (!match) return 0;

  const hours = Number.parseInt(match[1] ?? "0");
  const minutes = Number.parseInt(match[2] ?? "0");
  const seconds = Number.parseFloat(match[3] ?? "0");

  return hours * 3600 + minutes * 60 + seconds;
}
