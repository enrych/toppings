// First colour is YouTube's red so the primary segment feels native.
const SEGMENT_COLORS = ["#ff3333", "#3ea6ff", "#4caf50", "#ff9800", "#9c27b0", "#00bcd4", "#f5c518"];

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
