import { render, type ComponentChild } from "preact";

export interface Mounted {
  host: HTMLElement;
  update(next: ComponentChild): void;
  unmount(): void;
}

const liveHosts = new WeakSet<Element>();

// A host with this id that nothing here owns was left by the content script of
// an extension version since reloaded, and is replaced. One that is owned
// belongs to another navigation's mount, which removes its own host when the
// kernel undoes it; removing it here would take the live page's UI with it.
function removeOrphan(id: string): void {
  const existing = document.getElementById(id);
  if (existing && !liveHosts.has(existing)) existing.remove();
}

function track(host: HTMLElement, render: (ui: ComponentChild) => void, parent: Element, position: "append" | "prepend"): Mounted {
  liveHosts.add(host);
  parent[position](host);
  return {
    host,
    update: render,
    unmount() {
      render(null);
      liveHosts.delete(host);
      host.remove();
    },
  };
}

// Injected UI renders inside a shadow root, so YouTube's stylesheet and ours
// cannot reach each other.
export function mount(id: string, parent: Element, ui: ComponentChild, position: "append" | "prepend" = "append"): Mounted {
  removeOrphan(id);
  const host = document.createElement("div");
  host.id = id;
  const root = host.attachShadow({ mode: "open" });
  render(ui, root);
  return track(host, (next) => render(next, root), parent, position);
}

// For UI that should take YouTube's own styling (a .ytp-button, a menu row):
// no shadow root, and the caller shapes the host element.
export function mountInline(host: HTMLElement, parent: Element, ui: ComponentChild, position: "append" | "prepend" = "append"): Mounted {
  if (host.id) removeOrphan(host.id);
  render(ui, host);
  return track(host, (next) => render(next, host), parent, position);
}
