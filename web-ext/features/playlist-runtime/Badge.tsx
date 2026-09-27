/** @jsxImportSource preact */
import { formatDuration } from "@/lib/duration";
import type { PlaylistRuntime } from "./messages";

const styles = `
  .badge { display: inline-flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 11px;
    color: var(--yt-spec-text-secondary, rgba(255,255,255,0.7)); font-family: "YouTube Sans", "Roboto", sans-serif; }
  .dot { opacity: 0.4; }
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
