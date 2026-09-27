import { render, type ComponentChild } from "preact";

// Injected UI renders inside a shadow root, so YouTube's stylesheet and ours
// cannot reach each other.
export function mount(id: string, parent: Element, ui: ComponentChild, position: "append" | "prepend" = "append") {
  document.getElementById(id)?.remove();
  const host = document.createElement("div");
  host.id = id;
  const root = host.attachShadow({ mode: "open" });
  render(ui, root);
  parent[position](host);
  return {
    host,
    update(next: ComponentChild) {
      render(next, root);
    },
    unmount() {
      render(null, root);
      host.remove();
    },
  };
}
