import type { Route, RouteName } from "@/youtube/route";

export type Unmount = () => void;

export interface FeatureContext {
  route: Route;
  // Aborted by the next navigation, for a mount with slow steps to stop early.
  signal: AbortSignal;
}

// A feature declares where it runs and how to start and stop. The kernel
// mounts it on every navigation that lands on one of its routes and unmounts
// it on the next navigation, so features never have to be idempotent
// against a page they did not start on.
export interface Feature {
  id: string;
  routes: readonly RouteName[];
  mount(ctx: FeatureContext): Promise<Unmount | void> | Unmount | void;
}

export interface BootOptions {
  // Consulted on every navigation; false unmounts everything and mounts nothing.
  enabled?: () => boolean;
}

export interface Booted {
  // Re-runs the current route, e.g. after the enabled switch flips.
  refresh(): void;
  // Unmounts everything and ignores later navigations, for handing the page
  // to a newer copy of the content script.
  stop(): void;
}

export function bootFeatures(features: readonly Feature[], onNavigate: (listener: (route: Route) => void) => void, { enabled = () => true }: BootOptions = {}): Booted {
  const mounted = new Map<string, Unmount>();
  let navigation: AbortController | undefined;
  let current: Route | undefined;
  let stopped = false;

  const navigate = async (route: Route) => {
    if (stopped) return;
    current = route;
    navigation?.abort();
    const own = (navigation = new AbortController());
    for (const [id, unmount] of mounted) {
      mounted.delete(id);
      unmount();
    }
    if (!enabled() || stopped) return;
    // Started together, so one feature waiting on the network or on an element
    // that never renders holds up none of the others.
    await Promise.all(
      features
        .filter((feature) => feature.routes.includes(route.name))
        .map(async (feature) => {
          try {
            const unmount = await feature.mount({ route, signal: own.signal });
            // A navigation that happened while mounting owns the page now.
            if (own.signal.aborted) unmount?.();
            else if (unmount) mounted.set(feature.id, unmount);
          } catch (error) {
            console.error(`[toppings] ${feature.id} failed to mount`, error);
          }
        }),
    );
  };

  onNavigate((route) => void navigate(route));
  return {
    refresh() {
      if (current) void navigate(current);
    },
    stop() {
      stopped = true;
      navigation?.abort();
      for (const [id, unmount] of mounted) {
        mounted.delete(id);
        unmount();
      }
    },
  };
}
