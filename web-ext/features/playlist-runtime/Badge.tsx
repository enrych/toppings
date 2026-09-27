import { themeTokens } from "@/kernel/dom/theme";
import { formatDuration } from "@/lib/duration";
import type { PlaylistRuntime } from "./messages";

const styles = `
  ${themeTokens}
  .badge { display: inline-flex; align-items: center; gap: 8px; margin-top: 4px; font: 11px var(--tp-font); color: var(--tp-text-2); }
  .dot { opacity: .4; }
`;

export function Badge({ runtime }: { runtime: PlaylistRuntime }) {
  return (
    <div class="badge">
      <style>{styles}</style>
      <span title="Total playlist runtime">⏱ {formatDuration(runtime.totalRuntime)}</span>
      <span class="dot">·</span>
      <span title="Average video runtime">avg {formatDuration(runtime.averageRuntime)}</span>
    </div>
  );
}
