import { themeTokens } from "@/kernel/dom/theme";
import { formatClock } from "@/lib/duration";
import type { PlaylistRuntime } from "./messages";

// Matches the "channel · 2/10" line above it in the playlist panel.
const styles = `
  ${themeTokens}
  :host { display: block; }
  .badge { display: flex; align-items: center; gap: 4px; margin-top: 2px; font: 400 12px/1.5 Roboto, Arial, sans-serif; color: var(--tp-text-2); }
  .dot { opacity: .7; }
`;

export function Badge({ runtime }: { runtime: PlaylistRuntime }) {
  return (
    <div class="badge">
      <style>{styles}</style>
      <span title="Total playlist runtime">{formatClock(runtime.totalRuntime)} total</span>
      <span class="dot">·</span>
      <span title="Average video runtime">{formatClock(runtime.averageRuntime)} avg</span>
    </div>
  );
}
