import React from "dom-chef";

type ScreenMode = "black" | "visualizer" | "custom";
type OnModeChange = (mode: ScreenMode) => void;
type PinOptions = { isPinned: boolean; onTogglePin: () => void };

let onModeChangeCallback: OnModeChange | null = null;
let pinOptions: PinOptions | null = null;

const modeOptions: { mode: ScreenMode; label: string }[] = [
  { mode: "black", label: "Black Screen" },
  { mode: "visualizer", label: "Visualizer" },
  { mode: "custom", label: "Custom Image" },
];

const pinButton = (
  <button
    className="tw-w-full tw-text-left tw-px-3 tw-py-2 tw-text-[13px] tw-text-white/70 tw-bg-transparent tw-border-none tw-border-t tw-border-t-[#333] tw-rounded tw-cursor-pointer hover:tw-bg-[#333] tw-mt-1 tw-pt-2"
    onClick={() => {
      if (pinOptions?.onTogglePin) {
        pinOptions.onTogglePin();
      }
      hidePopover();
    }}
  >
    Pin to this video
  </button>
) as HTMLButtonElement;

export const AudioModePopover = (
  <div
    id="tppng-audio-mode-popover"
    className="tw-absolute tw-bottom-[50px] tw-right-0 tw-hidden tw-bg-[#1a1a1a] tw-border tw-border-[#333] tw-rounded-lg tw-p-2 tw-min-w-[160px] tw-shadow-lg tw-z-[9999]"
    style={{ pointerEvents: "auto" }}
  >
    <div className="tw-text-[#aaa] tw-text-[11px] tw-px-2 tw-py-1 tw-uppercase tw-tracking-wider">
      Screen Mode
    </div>
    {modeOptions.map(({ mode, label }) => (
      <button
        key={mode}
        className="tw-w-full tw-text-left tw-px-3 tw-py-2 tw-text-[13px] tw-text-white tw-bg-transparent tw-border-none tw-rounded tw-cursor-pointer hover:tw-bg-[#333] tw-flex tw-items-center tw-gap-2"
        data-tppng-audio-mode={mode}
        onClick={() => {
          if (onModeChangeCallback) {
            onModeChangeCallback(mode);
          }
          hidePopover();
        }}
      >
        <span
          className="tw-w-2 tw-h-2 tw-rounded-full tw-bg-white tw-opacity-0"
          data-tppng-audio-mode-indicator={mode}
        />
        {label}
      </button>
    ))}
    {pinButton}
  </div>
);

export function showPopover(
  currentMode: ScreenMode,
  onModeChange: OnModeChange,
  pin?: PinOptions,
) {
  onModeChangeCallback = onModeChange;
  pinOptions = pin ?? null;
  updateActiveIndicator(currentMode);

  if (pin) {
    pinButton.style.display = "";
    pinButton.textContent = pin.isPinned
      ? "Unpin from this video"
      : "Pin to this video";
  } else {
    pinButton.style.display = "none";
  }

  AudioModePopover.classList.remove("tw-hidden");

  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
  }, 0);
}

export function hidePopover() {
  AudioModePopover.classList.add("tw-hidden");
  document.removeEventListener("click", handleOutsideClick);
}

function handleOutsideClick(e: MouseEvent) {
  if (!AudioModePopover.contains(e.target as Node)) {
    hidePopover();
  }
}

function updateActiveIndicator(activeMode: ScreenMode) {
  const indicators = AudioModePopover.querySelectorAll(
    "[data-tppng-audio-mode-indicator]",
  );
  indicators.forEach((el) => {
    const mode = (el as HTMLElement).getAttribute(
      "data-tppng-audio-mode-indicator",
    );
    if (mode === activeMode) {
      (el as HTMLElement).classList.remove("tw-opacity-0");
      (el as HTMLElement).classList.add("tw-opacity-100");
    } else {
      (el as HTMLElement).classList.remove("tw-opacity-100");
      (el as HTMLElement).classList.add("tw-opacity-0");
    }
  });
}
