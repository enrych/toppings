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

export function bootFeatures(features: readonly Feature[], onNavigate: (listener: (route: Route) => void) => void): void {
  const mounted = new Map<string, Unmount>();
  let generation = 0;

  onNavigate(async (route) => {
    const current = ++generation;
    for (const [id, unmount] of mounted) {
      mounted.delete(id);
      unmount();
    }
    for (const feature of features) {
      if (!feature.routes.includes(route.name)) continue;
      try {
        const unmount = await feature.mount({ route });
        // A navigation that happened while mounting owns the page now.
        if (current !== generation) unmount?.();
        else if (unmount) mounted.set(feature.id, unmount);
      } catch (error) {
        console.error(`[toppings] ${feature.id} failed to mount`, error);
      }
    }
  });
}
