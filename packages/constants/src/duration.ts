/** ISO-8601 duration (YouTube `contentDetails.duration`). Seconds may be fractional (e.g. PT7.031S). */
export const ISO8601_DURATION_PATTERN =
  /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/;

export const RADIX_DECIMAL = 10;

export const NUMERIC_STRING = {
  ZERO: "0",
} as const;
