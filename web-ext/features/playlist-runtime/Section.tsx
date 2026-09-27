import { themeTokens } from "@/kernel/dom/theme";
import { formatDuration } from "@/lib/duration";
import type { PlaylistRuntime } from "./messages";

export interface SectionProps {
  runtime: PlaylistRuntime;
  iconUrl: string;
  refreshing: boolean;
  onRefresh: () => void;
}

const styles = `
  ${themeTokens}
  .card {
    display: flex; align-items: center; gap: 12px; margin-top: 8px; padding: 10px 14px; border-radius: 12px;
    background: var(--tp-additive); color: var(--tp-text); font: 12px/1.5 var(--tp-font);
  }
  .card img { width: 20px; height: 20px; }
  .title { font-weight: 500; font-size: 13px; }
  .stats { display: flex; gap: 14px; color: var(--tp-text-2); }
  .stats b { color: var(--tp-text); font-weight: 500; }
  .refresh {
    margin-left: auto; width: 28px; height: 28px; border: 0; border-radius: 50%; cursor: pointer;
    background: transparent; color: var(--tp-text-2); font-size: 15px;
  }
  .refresh:hover { background: var(--tp-additive); color: var(--tp-text); }
  .refresh:disabled { opacity: .5; cursor: default; }
`;

export function Section({ runtime, iconUrl, refreshing, onRefresh }: SectionProps) {
  return (
    <div class="card">
      <style>{styles}</style>
      <img src={iconUrl} alt="" />
      <span class="title">Toppings</span>
      <span class="stats">
        <span>Total <b>{formatDuration(runtime.totalRuntime)}</b></span>
        <span>Average <b>{formatDuration(runtime.averageRuntime)}</b></span>
      </span>
      <button class="refresh" title="Refresh playlist data" disabled={refreshing} onClick={onRefresh}>
        ↻
      </button>
    </div>
  );
}
