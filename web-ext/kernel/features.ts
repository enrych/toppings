import type { Route, RouteName } from "@/youtube/route";

export type Unmount = () => void;

export interface FeatureContext {
  route: Route;
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
}

export function bootFeatures(features: readonly Feature[], onNavigate: (listener: (route: Route) => void) => void, { enabled = () => true }: BootOptions = {}): Booted {
  const mounted = new Map<string, Unmount>();
  let generation = 0;
  let current: Route | undefined;

  const navigate = async (route: Route) => {
    current = route;
    const own = ++generation;
    for (const [id, unmount] of mounted) {
      mounted.delete(id);
      unmount();
    }
    if (!enabled()) return;
    for (const feature of features) {
      if (own !== generation) return;
      if (!feature.routes.includes(route.name)) continue;
      try {
        const unmount = await feature.mount({ route });
        // A navigation that happened while mounting owns the page now.
        if (own !== generation) unmount?.();
        else if (unmount) mounted.set(feature.id, unmount);
      } catch (error) {
        console.error(`[toppings] ${feature.id} failed to mount`, error);
      }
    }
  };

  onNavigate((route) => void navigate(route));
  return {
    refresh() {
      if (current) void navigate(current);
    },
  };
}
