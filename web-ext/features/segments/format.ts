// No red: segments sit on YouTube's red progress fill and would vanish into it.
const SEGMENT_COLORS = ["#3ea6ff", "#f5c518", "#4caf50", "#ff9800", "#ab47bc", "#00bcd4", "#ec407a"];

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
