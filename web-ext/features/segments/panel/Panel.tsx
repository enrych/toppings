import { useState } from "preact/hooks";
import { addSegmentToConfig, removeSegmentFromConfig, splitSegmentAtTime, updateSegment } from "../factories";
import type { SegmentSession } from "../session";
import type { Segment, SegmentConfig } from "../types";
import { ConfigManager } from "./ConfigManager";
import { Header } from "./Header";
import { SegmentList } from "./SegmentList";
import { panelStyle } from "./styles";

export interface PanelProps {
  session: SegmentSession;
  playhead: () => { time: number; duration: number };
}

// Splits the segment under the playhead when there is one, else appends a
// short segment after the last, else halves the last: the markers clamp each
// segment against its neighbours and assume none overlap.
function addSegment(config: SegmentConfig, time: number, duration: number): SegmentConfig {
  const sorted = [...config.segments].sort((a, b) => a.startTime - b.startTime);
  const under = sorted.find((s) => time > s.startTime + 0.1 && time < s.endTime - 0.1);
  const split = under ? splitSegmentAtTime(config, under.id, time) : null;
  if (split) return split;
  const last = sorted.reduce<Segment | undefined>((latest, s) => (latest && latest.endTime >= s.endTime ? latest : s), undefined);
  const start = last ? last.endTime : 0;
  if (last && duration - start < 1) return splitSegmentAtTime(config, last.id, (last.startTime + last.endTime) / 2) ?? config;
  const end = Math.min(start + Math.min(30, (duration - start) * 0.5), duration);
  return addSegmentToConfig(config, start, Math.min(duration, Math.max(start + 1, end)));
}

export function Panel({ session, playhead }: PanelProps) {
  const { state } = session;
  const [view, setView] = useState<"main" | "manage">("main");
  const [collapsed, setCollapsed] = useState(false);
  if (!state.active || !state.config) return <style>{panelStyle}</style>;
  const config = state.config;

  return (
    <>
      <style>{panelStyle}</style>
      <div class="panel">
        {view === "manage" ? (
          <ConfigManager
            current={config}
            saved={state.saved}
            defaultId={state.defaultId}
            onBack={() => setView("main")}
            onLoad={(c) => (setView("main"), session.load(c))}
            onRename={(id, label) => void session.renameSaved(id, label)}
            onSetDefault={(id) => void session.setDefault(id)}
            onDelete={(id) => void session.deleteSaved(id)}
          />
        ) : (
          <>
            <Header
              saved={state.saved}
              loaded={session.loaded}
              collapsed={collapsed}
              onLoad={(c) => session.load(c)}
              onSave={() => void session.save()}
              onSaveNamed={(label) => void session.saveNamed(label)}
              onManage={() => setView("manage")}
              onCollapse={() => setCollapsed((c) => !c)}
            />
            {!collapsed && (
              <SegmentList
                config={config}
                onAdd={() => {
                  const { time, duration } = playhead();
                  session.mutate((c) => addSegment(c, time, duration));
                }}
                onRemove={(id) => session.mutate((c) => removeSegmentFromConfig(c, id))}
                onChange={(id, change) => session.mutate((c) => updateSegment(c, id, change))}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
