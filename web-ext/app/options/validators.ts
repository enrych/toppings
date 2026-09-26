const CUSTOM_PLAYBACK_RATES_PATTERN =
  /^(\d+(\.\d+)?)(\s*,\s*\d+(\.\d+)?)*$/;

const PLAYBACK_RATE_MIN = 0.0625;
const PLAYBACK_RATE_MAX = 16;

export function isCustomPlaybackRatesList(value: string): boolean {
  if (value.trim() === "") return true;
  const playbackRates = value.split(",").map((r) => r.trim());
  if (!CUSTOM_PLAYBACK_RATES_PATTERN.test(value) || playbackRates.length <= 1) {
    return false;
  }
  const rates = playbackRates.map(parseFloat);
  return (
    !rates.includes(NaN) &&
    rates.includes(1) &&
    !rates.some((r) => r < PLAYBACK_RATE_MIN || r > PLAYBACK_RATE_MAX)
  );
}
