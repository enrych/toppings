import { isAdShowing } from "@/youtube/player";
import { SegmentEngine } from "./engine";
import { createFreshConfig, generateConfigLabel, removeSegmentFromConfig, updateSegment } from "./factories";
import type { SegmentsSettings } from "./settings";
import type { VideoSegments } from "./store";
import type { Segment, SegmentConfig, SegmentId } from "./types";

export interface SessionState {
  active: boolean;
  config: SegmentConfig | null;
  saved: SegmentConfig[];
  defaultId: string | null;
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
const NOT_READY = "Segments need a loaded video, not an ad or a live stream";

// Owns one video's segment state: what is loaded, whether it plays, and every
// change to it. UI and keys call in; the session persists and notifies.
export class SegmentSession {
  state: SessionState = { active: false, config: null, saved: [], defaultId: null };

  private engine: SegmentEngine | null = null;
  private disposed = false;
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

  // A pre-roll ad plays in the same <video>, so its duration is the ad's and
  // any segment clamped or created against it would be cut to the ad's length.
  get ready(): boolean {
    return Number.isFinite(this.deps.video.duration) && this.deps.video.duration > 0 && !isAdShowing(this.deps.video);
  }

  async restore(): Promise<void> {
    const config = await this.deps.store.autoLoadConfig(this.deps.settings.autoLoad);
    if (!config || !this.use(config)) return;
    this.deps.toast("↺ Segments restored");
  }

  async toggle(): Promise<void> {
    if (this.state.active) {
      this.deactivate();
      return;
    }
    if (!this.ready) {
      this.deps.toast(NOT_READY);
      return;
    }
    let lastUsed: SegmentConfig | null = null;
    try {
      lastUsed = await this.deps.store.getLastUsed();
    } catch (error) {
      console.error("[toppings] segment storage unavailable", error);
    }
    this.activate(lastUsed ? this.clampToDuration(lastUsed) : createFreshConfig(this.duration));
  }

  fresh(): void {
    if (this.activate(createFreshConfig(this.duration))) this.deps.toast("Fresh segments slate");
    else this.deps.toast(NOT_READY);
  }

  // Also refuses after dispose, since restore and toggle resume from storage
  // reads that can finish after the user has navigated away.
  activate(config: SegmentConfig): boolean {
    if (this.disposed || !this.ready) return false;
    this.engine?.stop();
    this.engine = new SegmentEngine(this.deps.video, config, () => isAdShowing(this.deps.video));
    this.engine.start();
    this.set({ active: true, config });
    return true;
  }

  deactivate(): void {
    this.engine?.stop();
    this.engine = null;
    this.set({ active: false });
  }

  load(config: SegmentConfig): void {
    this.deps.toast(this.use(config) ? `Segments: ${config.label}` : NOT_READY);
  }

  // The saved config the working copy was loaded from or last saved as.
  get loaded(): SegmentConfig | null {
    return this.state.saved.find((c) => c.id === this.state.config?.id) ?? null;
  }

  mutate(update: (config: SegmentConfig) => SegmentConfig): void {
    if (!this.state.config) return;
    this.commit(update(this.state.config));
  }

  // Applied to the engine on every pointer move, persisted once the drag ends.
  preview(segments: Segment[]): void {
    if (!this.state.config) return;
    const config = { ...this.state.config, segments };
    this.engine?.setConfig(config);
    this.set({ config });
  }

  commitPreview(): void {
    if (this.state.config) void this.persist(() => this.deps.store.setLastUsed(this.state.config!));
  }

  merge(keepId: SegmentId, removeId: SegmentId): void {
    const config = this.state.config;
    const keep = config?.segments.find((s) => s.id === keepId);
    const remove = config?.segments.find((s) => s.id === removeId);
    if (!config || !keep || !remove) return;
    this.commit(removeSegmentFromConfig(updateSegment(config, keepId, { endTime: remove.endTime }), removeId));
    this.deps.toast("Segments merged");
  }

  setStart(): void {
    const segment = this.segmentAtPlayhead();
    if (!segment) return;
    this.moveStart(segment, this.deps.video.currentTime);
  }

  setEnd(): void {
    const segment = this.segmentAtPlayhead();
    if (!segment) return;
    this.moveEnd(segment, this.deps.video.currentTime);
  }

  nudgeMarker(marker: Marker, direction: Direction): void {
    const segment = this.segmentAtPlayhead();
    if (!segment || !this.duration) return;
    const step = this.nextNudgeStep(marker, direction);
    const delta = direction === "forward" ? step : -step;
    if (marker === "start") this.deps.video.currentTime = this.moveStart(segment, segment.startTime + delta);
    else this.moveEnd(segment, segment.endTime + delta);
  }

  // Overwrites the saved config the working copy came from; a slate that was
  // never saved is kept under a generated name instead.
  async save(): Promise<void> {
    const { active, config, saved } = this.state;
    if (!active || !config) return;
    const loaded = this.loaded;
    if (!loaded) return this.saveNamed(generateConfigLabel(saved.length));
    const next = { ...config, label: loaded.label };
    if (!(await this.persist(() => this.deps.store.saveConfig(next)))) return;
    await this.refreshSaved();
    this.deps.toast(`Saved "${next.label}" ✓`);
  }

  async saveNamed(label: string): Promise<void> {
    if (!this.state.config || !label.trim()) return;
    const config = { ...this.state.config, id: crypto.randomUUID(), label: label.trim() };
    if (!(await this.persist(() => this.deps.store.saveConfig(config)))) return;
    await this.refreshSaved();
    this.commit(config);
    this.deps.toast(`Saved as "${config.label}" ✓`);
  }

  async renameSaved(configId: string, label: string): Promise<void> {
    const saved = this.state.saved.find((c) => c.id === configId);
    if (!saved) return;
    if (await this.persist(() => this.deps.store.saveConfig({ ...saved, label }))) await this.refreshSaved();
  }

  async deleteSaved(configId: string): Promise<void> {
    if (await this.persist(() => this.deps.store.deleteConfig(configId))) await this.refreshSaved();
  }

  async setDefault(configId: string): Promise<void> {
    if (await this.persist(() => this.deps.store.setDefaultConfig(configId))) await this.refreshSaved();
  }

  dispose(): void {
    this.disposed = true;
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

  // Loading a config makes it the one the toggle key brings back.
  private use(config: SegmentConfig): boolean {
    const clamped = this.clampToDuration(config);
    if (!this.activate(clamped)) return false;
    void this.persist(() => this.deps.store.setLastUsed(clamped));
    return true;
  }

  // Keeps a segment clear of its neighbours, as dragging its markers does.
  private moveStart(segment: Segment, time: number): number {
    const floor = Math.max(0, ...this.neighbours(segment).filter((s) => s.endTime <= segment.startTime).map((s) => s.endTime));
    const startTime = Math.max(floor, Math.min(time, segment.endTime - MIN_SEGMENT));
    this.mutate((c) => updateSegment(c, segment.id, { startTime }));
    return startTime;
  }

  private moveEnd(segment: Segment, time: number): void {
    const ceiling = Math.min(this.duration, ...this.neighbours(segment).filter((s) => s.startTime >= segment.endTime).map((s) => s.startTime));
    const endTime = Math.min(ceiling, Math.max(time, segment.startTime + MIN_SEGMENT));
    this.mutate((c) => updateSegment(c, segment.id, { endTime }));
  }

  private neighbours(segment: Segment): Segment[] {
    return this.state.config?.segments.filter((s) => s.id !== segment.id) ?? [];
  }

  private commit(config: SegmentConfig): void {
    this.engine?.setConfig(config);
    this.set({ config });
    void this.persist(() => this.deps.store.setLastUsed(config));
  }

  private async persist(write: () => Promise<void>): Promise<boolean> {
    try {
      await write();
      return true;
    } catch (error) {
      console.error("[toppings] segment storage unavailable", error);
      this.deps.toast("Couldn't save segments");
      return false;
    }
  }

  private async refreshSaved(): Promise<void> {
    const { configs, defaultConfigId } = await this.deps.store.data();
    this.set({ saved: configs, defaultId: defaultConfigId });
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
