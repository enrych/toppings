import { useState } from "preact/hooks";
import { addSegmentToConfig, removeSegmentFromConfig, splitSegmentAtTime } from "../factories";
import type { SegmentSession } from "../session";
import type { PlayStep, SegmentConfig } from "../types";
import { ConfigManager } from "./ConfigManager";
import { Header } from "./Header";
import { SegmentList } from "./SegmentList";
import { SequenceEditor, type StepActions } from "./SequenceEditor";
import { panelStyle } from "./styles";

export interface PanelProps {
  session: SegmentSession;
  playhead: () => { time: number; duration: number };
}

// Splits the segment under the playhead when there is one, else appends a
// short segment after the last.
function addSegment(config: SegmentConfig, time: number, duration: number): SegmentConfig {
  const sorted = [...config.segments].sort((a, b) => a.startTime - b.startTime);
  const under = sorted.find((s) => time > s.startTime + 0.1 && time < s.endTime - 0.1);
  const split = under ? splitSegmentAtTime(config, under.id, time) : null;
  if (split) return split;
  const last = sorted[sorted.length - 1];
  const start = Math.max(0, last ? Math.min(last.endTime, duration - 2) : 0);
  const end = Math.min(start + Math.min(30, (duration - start) * 0.5), duration);
  return addSegmentToConfig(config, start, Math.max(start + 1, end));
}

export function Panel({ session, playhead }: PanelProps) {
  const { state } = session;
  const [view, setView] = useState<"main" | "manage">("main");
  const [collapsed, setCollapsed] = useState(false);
  if (!state.active || !state.config) return <style>{panelStyle}</style>;
  const config = state.config;

  const updateStep = (stepId: string, change: (step: PlayStep) => PlayStep) =>
    session.mutate((c) => ({ ...c, sequence: c.sequence.map((s) => (s.id === stepId ? change(s) : s)), updatedAt: Date.now() }));

  const steps: StepActions = {
    addStep: () => {
      const first = config.segments[0]?.id;
      if (!first) return;
      session.mutate((c) => ({ ...c, sequence: [...c.sequence, { id: crypto.randomUUID(), segmentIds: [first], count: 1, playbackRate: null, perIterationRates: [] }], updatedAt: Date.now() }));
    },
    removeStep: (stepId) => session.mutate((c) => (c.sequence.length <= 1 ? c : { ...c, sequence: c.sequence.filter((s) => s.id !== stepId), updatedAt: Date.now() })),
    addToStep: (stepId, segmentId) => updateStep(stepId, (s) => ({ ...s, segmentIds: [...s.segmentIds, segmentId] })),
    removeFromStep: (stepId, index) => updateStep(stepId, (s) => (s.segmentIds.length <= 1 ? s : { ...s, segmentIds: s.segmentIds.filter((_, i) => i !== index) })),
    reorder: (stepId, from, to) =>
      updateStep(stepId, (s) => {
        const ids = [...s.segmentIds];
        const [moved] = ids.splice(from, 1);
        ids.splice(to, 0, moved);
        return { ...s, segmentIds: ids };
      }),
    setCount: (stepId, count) => updateStep(stepId, (s) => ({ ...s, count })),
    setRate: (stepId, playbackRate) => updateStep(stepId, (s) => ({ ...s, playbackRate })),
    setPerIterationRates: (stepId, perIterationRates) => updateStep(stepId, (s) => ({ ...s, perIterationRates })),
  };

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
            onRename={(id, label) => void session.updateSaved(id, { label })}
            onShortcut={(id, shortcutKey) => void session.updateSaved(id, { shortcutKey })}
            onSetDefault={(id) => void session.setDefault(id)}
            onDelete={(id) => void session.deleteSaved(id)}
          />
        ) : (
          <>
            <Header
              config={config}
              saved={state.saved}
              pin={state.pin}
              collapsed={collapsed}
              onLoad={(c) => session.load(c)}
              onPin={(pin) => void session.setPin(pin)}
              onSaveDefault={() => void session.saveDefault()}
              onSaveNamed={(label) => void session.saveNamed(label)}
              onManage={() => setView("manage")}
              onCollapse={() => setCollapsed((c) => !c)}
            />
            {!collapsed && (
              <>
                <SegmentList
                  config={config}
                  onAdd={() => {
                    const { time, duration } = playhead();
                    session.mutate((c) => addSegment(c, time, duration || 100));
                  }}
                  onRemove={(id) => session.mutate((c) => removeSegmentFromConfig(c, id))}
                  onCount={steps.setCount}
                  onRate={steps.setRate}
                />
                <SequenceEditor config={config} actions={steps} />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
