// The first segment takes YouTube's own red (its playhead dot and played fill)
// so a single loop reads as part of the player.
const SEGMENT_COLORS = ["#ff0033", "#3ea6ff", "#f5c518", "#4caf50", "#ab47bc", "#00bcd4", "#ff9800"];

export function colorForIndex(i: number): string {
  return SEGMENT_COLORS[i % SEGMENT_COLORS.length];
}

export function formatTimestamp(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const ss = String(s % 60).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}
