import type { RouteName } from "@/youtube/route";
import { resolveTarget } from "./dom/resolve";
import { setCapabilityStatus, type PrimitiveScope } from "./dom/capabilities";

// A primitive is one knob on YouTube's page: what to find and how to set it
// to a value. Apply must be idempotent, because it is re-run whenever the
// page re-renders; reset must undo apply on the same element.
export interface Primitive<V = unknown> {
  id: string;
  label: string;
  routes: readonly RouteName[];
  strategies: readonly string[];
  // Every match rather than the first, for feeds that render many of a thing.
  all?: boolean;
  parse(value: unknown): V | undefined;
  apply(element: HTMLElement, value: V): void;
  reset(element: HTMLElement): void;
}

export function definePrimitive<V>(primitive: Primitive<V>): Primitive<V> {
  return primitive;
}

export function scopeOf(primitive: Primitive): PrimitiveScope {
  return primitive.id.split(".")[0] as PrimitiveScope;
}

export type PrimitiveValues = Record<string, unknown>;

export interface PrimitiveRun {
  get(id: string): unknown;
  set(id: string, value: unknown): void;
  stop(): void;
}

// Pages YouTube keeps alive after navigating away sit under a hidden
// ancestor. Being on screen cannot be the test, since hiding is what many
// primitives do.
const onLivePage = (element: Element) => !element.closest("[hidden]");

// Keeps a set of values applied to the page until stopped: YouTube re-renders
// feeds as they scroll and moves the player between containers, so a single
// pass would drift out of date within seconds.
export function runPrimitives(primitives: readonly Primitive[], initial: PrimitiveValues, route: RouteName): PrimitiveRun {
  const onRoute = primitives.filter((p) => p.routes.includes(route));
  const values: PrimitiveValues = { ...initial };
  const touched = new Map<Primitive, Set<HTMLElement>>(onRoute.map((p) => [p, new Set()]));
  let stopped = false;
  let frame: number | undefined;

  const matches = (p: Primitive): HTMLElement[] => {
    if (p.all) return [...document.querySelectorAll<HTMLElement>(p.strategies.join(", "))].filter(onLivePage);
    for (const strategy of p.strategies) {
      const element = [...document.querySelectorAll<HTMLElement>(strategy)].find(onLivePage);
      if (element) return [element];
    }
    return [];
  };

  const apply = () => {
    for (const p of onRoute) {
      const value = values[p.id];
      const seen = touched.get(p)!;
      const current = value === undefined ? [] : matches(p);
      for (const el of seen) {
        if (!current.includes(el)) {
          p.reset(el);
          seen.delete(el);
        }
      }
      for (const el of current) {
        p.apply(el, value);
        seen.add(el);
      }
    }
  };

  const schedule = () => {
    if (frame !== undefined) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      if (!stopped) apply();
    });
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });

  for (const p of onRoute) {
    if (values[p.id] === undefined) continue;
    void resolveTarget(p.strategies).then((resolution) => {
      void setCapabilityStatus(p.id, scopeOf(p), resolution);
      if (!stopped) schedule();
    });
  }
  apply();

  return {
    get: (id) => values[id],
    set(id, value) {
      values[id] = value;
      apply();
    },
    stop() {
      stopped = true;
      if (frame !== undefined) cancelAnimationFrame(frame);
      observer.disconnect();
      for (const [p, seen] of touched) for (const el of seen) p.reset(el);
      touched.clear();
    },
  };
}
