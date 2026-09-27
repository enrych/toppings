import { SegmentEngine } from "./engine";
import { createFreshConfig, removeSegmentFromConfig, updateSegmentTimes } from "./factories";
import type { SegmentsSettings } from "./settings";
import type { VideoSegments } from "./store";
import type { Segment, SegmentAutoLoadPin, SegmentConfig, SegmentId } from "./types";

export interface SessionState {
  active: boolean;
  config: SegmentConfig | null;
  saved: SegmentConfig[];
  defaultId: string | null;
  pin: SegmentAutoLoadPin;
}

export interface SessionDeps {
  video: HTMLVideoElement;
  store: VideoSegments;
  settings: SegmentsSettings;
  toast: (message: string) => void;
}

type Marker = "start" | "end";
type Direction = "forward" | "backward";

const MIN_SEGMENT = 0.1;
const NUDGE_RESET_GAP_MS = 600;

// Owns one video's segment state: what is loaded, whether it plays, and every
// change to it. UI and keys call in; the session persists and notifies.
export class SegmentSession {
  state: SessionState = { active: false, config: null, saved: [], defaultId: null, pin: null };

  private engine: SegmentEngine | null = null;
  private listeners = new Set<() => void>();
  private nudge = { marker: null as Marker | null, direction: null as Direction | null, step: 1, at: 0 };

  constructor(private deps: SessionDeps) {}

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Storage failures degrade to "nothing saved" rather than a dead feature.
  async init(): Promise<void> {
    try {
      await this.refreshSaved();
    } catch (error) {
      console.error("[toppings] segment storage unavailable", error);
    }
  }

  async restore(): Promise<void> {
    const config = await this.deps.store.autoLoadConfig(this.deps.settings.autoLoad);
    if (!config) return;
    this.activate(this.clampToDuration(config));
    this.deps.toast("↺ Segments restored");
  }

  async toggle(): Promise<void> {
    if (this.state.active) {
      this.deactivate();
      return;
    }
    this.activate((await this.deps.store.getLastUsed()) ?? createFreshConfig(this.duration));
  }

  fresh(): void {
    this.activate(createFreshConfig(this.duration));
    this.deps.toast("Fresh segments slate");
  }

  activate(config: SegmentConfig): void {
    this.engine?.stop();
    this.engine = new SegmentEngine(this.deps.video, config);
    this.engine.start();
    this.set({ active: true, config });
  }

  deactivate(): void {
    this.engine?.stop();
    this.engine = null;
    if (this.state.config) void this.deps.store.setLastUsed(this.state.config);
    this.set({ active: false });
  }

  load(config: SegmentConfig): void {
    this.activate(this.clampToDuration(config));
    this.deps.toast(`Segments: ${config.label}`);
  }

  mutate(update: (config: SegmentConfig) => SegmentConfig): void {
    if (!this.state.config) return;
    this.commit(update(this.state.config));
  }

  // Applied to the engine on every pointer move, persisted once the drag ends.
  preview(segments: Segment[]): void {
    if (!this.state.config) return;
    const config = { ...this.state.config, segments, updatedAt: Date.now() };
    this.engine?.setConfig(config);
    this.set({ config });
  }

  commitPreview(): void {
    if (this.state.config) void this.deps.store.setLastUsed(this.state.config);
  }

  merge(keepId: SegmentId, removeId: SegmentId): void {
    const config = this.state.config;
    const keep = config?.segments.find((s) => s.id === keepId);
    const remove = config?.segments.find((s) => s.id === removeId);
    if (!config || !keep || !remove) return;
    this.commit(removeSegmentFromConfig(updateSegmentTimes(config, keepId, keep.startTime, remove.endTime), removeId));
    this.deps.toast("Segments merged");
  }

  setStart(): void {
    const segment = this.segmentAtPlayhead();
    if (!segment) return;
    const start = Math.max(0, Math.min(this.deps.video.currentTime, segment.endTime - MIN_SEGMENT));
    this.mutate((c) => updateSegmentTimes(c, segment.id, start, segment.endTime));
  }

  setEnd(): void {
    const segment = this.segmentAtPlayhead();
    if (!segment) return;
    const end = Math.max(segment.startTime + MIN_SEGMENT, Math.min(this.deps.video.currentTime, this.duration));
    this.mutate((c) => updateSegmentTimes(c, segment.id, segment.startTime, end));
  }

  nudgeMarker(marker: Marker, direction: Direction): void {
    const segment = this.segmentAtPlayhead();
    if (!segment || !this.duration) return;
    const step = this.nextNudgeStep(marker, direction);
    const delta = direction === "forward" ? step : -step;
    if (marker === "start") {
      const start = Math.max(0, Math.min(segment.startTime + delta, segment.endTime - MIN_SEGMENT));
      this.mutate((c) => updateSegmentTimes(c, segment.id, start, segment.endTime));
      this.deps.video.currentTime = start;
    } else {
      const end = Math.max(segment.startTime + MIN_SEGMENT, Math.min(segment.endTime + delta, this.duration));
      this.mutate((c) => updateSegmentTimes(c, segment.id, segment.startTime, end));
    }
  }

  // The save key means "keep this" while active and "forget the slate" while off.
  async save(): Promise<void> {
    if (this.state.active && this.state.config) {
      await this.saveDefault();
      return;
    }
    await this.deps.store.setLastUsed(null);
    this.deps.toast("Last-used segments cleared");
  }

  async saveDefault(): Promise<void> {
    if (!this.state.config) return;
    const config = { ...this.state.config, updatedAt: Date.now() };
    await this.deps.store.saveConfig(config);
    await this.deps.store.setDefaultConfig(config.id);
    await this.refreshSaved();
    this.set({ config });
    this.deps.toast("Saved to default slot ✓");
  }

  async saveNamed(label: string): Promise<void> {
    if (!this.state.config || !label.trim()) return;
    const config = { ...this.state.config, label: label.trim(), updatedAt: Date.now() };
    await this.deps.store.saveConfig(config);
    await this.refreshSaved();
    this.commit(config);
    this.deps.toast(`Saved as "${config.label}" ✓`);
  }

  async setPin(pin: SegmentAutoLoadPin): Promise<void> {
    await this.deps.store.setPin(pin);
    this.set({ pin });
  }

  async updateSaved(configId: string, change: Partial<Pick<SegmentConfig, "label" | "shortcutKey">>): Promise<void> {
    const saved = this.state.saved.find((c) => c.id === configId);
    if (!saved) return;
    await this.deps.store.saveConfig({ ...saved, ...change, updatedAt: Date.now() });
    await this.refreshSaved();
  }

  async deleteSaved(configId: string): Promise<void> {
    await this.deps.store.deleteConfig(configId);
    await this.refreshSaved();
  }

  async setDefault(configId: string): Promise<void> {
    await this.deps.store.setDefaultConfig(configId);
    await this.refreshSaved();
  }

  dispose(): void {
    this.engine?.stop();
    this.engine = null;
    this.listeners.clear();
  }

  private get duration(): number {
    return this.deps.video.duration || 0;
  }

  private segmentAtPlayhead(): Segment | null {
    return this.state.active ? (this.engine?.getSegmentAt(this.deps.video.currentTime) ?? null) : null;
  }

  private commit(config: SegmentConfig): void {
    this.engine?.setConfig(config);
    this.set({ config });
    void this.deps.store.setLastUsed(config);
  }

  private async refreshSaved(): Promise<void> {
    const { configs, defaultConfigId, autoLoadPin } = await this.deps.store.data();
    this.set({ saved: configs, defaultId: defaultConfigId, pin: autoLoadPin ?? null });
  }

  private set(patch: Partial<SessionState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }

  private nextNudgeStep(marker: Marker, direction: Direction): number {
    const { nudgeBaseStep, nudgeMultiplier, nudgeMaxStep } = this.deps.settings;
    const now = Date.now();
    const repeated = this.nudge.marker === marker && this.nudge.direction === direction && now - this.nudge.at < NUDGE_RESET_GAP_MS;
    const step = repeated ? Math.min(this.nudge.step * nudgeMultiplier, nudgeMaxStep) : nudgeBaseStep;
    this.nudge = { marker, direction, step, at: now };
    return step;
  }

  private clampToDuration(config: SegmentConfig): SegmentConfig {
    const duration = this.duration;
    if (!duration) return config;
    return {
      ...config,
      segments: config.segments.map((s) => {
        const startTime = Math.max(0, Math.min(s.startTime, duration - MIN_SEGMENT));
        return { ...s, startTime, endTime: Math.max(startTime + MIN_SEGMENT, Math.min(s.endTime, duration)) };
      }),
    };
  }
}
