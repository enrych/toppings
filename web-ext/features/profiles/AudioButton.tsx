import { credit } from "@/kernel/dom/credit";

// Filled while Audio is on, outlined while off, like the segments button and
// YouTube's own toggles.
export function AudioButton({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 4a8 8 0 0 0-8 8v5a2 2 0 0 0 2 2h1.5a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H6a6 6 0 0 1 12 0h-1.5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1H18a2 2 0 0 0 2-2v-5a8 8 0 0 0-8-8z"
        fill={active ? "white" : "none"}
        stroke="white"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function audioButtonHost(): HTMLButtonElement {
  const host = document.createElement("button");
  host.id = "tppng-audio-button";
  host.className = "ytp-button";
  host.setAttribute("aria-label", "Audio mode");
  return host;
}

export function setAudioButtonState(host: HTMLButtonElement, active: boolean): void {
  host.setAttribute("aria-pressed", String(active));
  host.title = credit(active ? "Audio mode on" : "Audio mode");
}
