import { render, type ComponentChild } from "preact";

export interface Mounted {
  host: HTMLElement;
  update(next: ComponentChild): void;
  unmount(): void;
}

// Injected UI renders inside a shadow root, so YouTube's stylesheet and ours
// cannot reach each other.
export function mount(id: string, parent: Element, ui: ComponentChild, position: "append" | "prepend" = "append"): Mounted {
  document.getElementById(id)?.remove();
  const host = document.createElement("div");
  host.id = id;
  const root = host.attachShadow({ mode: "open" });
  render(ui, root);
  parent[position](host);
  return {
    host,
    update(next) {
      render(next, root);
    },
    unmount() {
      render(null, root);
      host.remove();
    },
  };
}

// For UI that should take YouTube's own styling (a .ytp-button, a menu row):
// no shadow root, and the caller shapes the host element.
export function mountInline(host: HTMLElement, parent: Element, ui: ComponentChild, position: "append" | "prepend" = "append"): Mounted {
  if (host.id) document.getElementById(host.id)?.remove();
  render(ui, host);
  parent[position](host);
  return {
    host,
    update(next) {
      render(next, host);
    },
    unmount() {
      render(null, host);
      host.remove();
    },
  };
}
