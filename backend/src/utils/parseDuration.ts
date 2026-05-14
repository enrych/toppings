import {
  ISO8601_DURATION_PATTERN,
  NUMERIC_STRING,
  RADIX_DECIMAL,
} from "toppings-constants";

const parseDuration = (duration: string): number => {
  const match = ISO8601_DURATION_PATTERN.exec(duration);
  if (!match) return 0;

  const hours = Number.parseInt(match[1] ?? NUMERIC_STRING.ZERO, RADIX_DECIMAL);
  const minutes = Number.parseInt(match[2] ?? NUMERIC_STRING.ZERO, RADIX_DECIMAL);
  const seconds = Number.parseFloat(match[3] ?? NUMERIC_STRING.ZERO);

  return hours * 3600 + minutes * 60 + seconds;
};

export default parseDuration;
