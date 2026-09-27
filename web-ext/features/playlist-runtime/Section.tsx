/** @jsxImportSource preact */
import { formatDuration } from "@/lib/duration";
import type { PlaylistRuntime } from "./messages";

export interface SectionProps {
  runtime: PlaylistRuntime;
  iconUrl: string;
  refreshing: boolean;
  onRefresh: () => void;
}

const styles = `
  .card { margin-top: 2px; padding: 12px 15px; border-radius: 8px; background: rgba(101,101,101,0.4);
    backdrop-filter: blur(10px) saturate(180%); box-shadow: 0 4px 30px rgba(0,0,0,0.1);
    font-family: "Roboto", "Arial", sans-serif; color: #b9b8b8; }
  .head { display: flex; align-items: center; margin-bottom: 6px; }
  .head img { width: 24px; margin: 0 6px; }
  .head h2 { margin: 0 6px 0 10px; font-size: 1.6rem; font-weight: 800; color: #fff; }
  .refresh { margin-left: auto; background: none; border: none; color: inherit; cursor: pointer; font-size: 16px; }
  .refresh:disabled { opacity: 0.5; cursor: default; }
  .rows { padding-left: 10px; font-size: 12px; line-height: 1.7; }
`;

export function Section({ runtime, iconUrl, refreshing, onRefresh }: SectionProps) {
  return (
    <div class="card">
      <style>{styles}</style>
      <div class="head">
        <img src={iconUrl} alt="" />
        <h2>Toppings</h2>
        <button class="refresh" title="Refresh playlist data" disabled={refreshing} onClick={onRefresh}>
          ↻
        </button>
      </div>
      <div class="rows">
        <div>Average Runtime: {formatDuration(runtime.averageRuntime)}</div>
        <div>Total Runtime: {formatDuration(runtime.totalRuntime)}</div>
      </div>
    </div>
  );
}
