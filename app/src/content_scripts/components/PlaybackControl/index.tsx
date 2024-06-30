import PlaybackControlButton from "./PlaybackControlButton";
import { useEffect, useRef, useState } from "react";
import PlaybackControlMenu from "./PlaybackControlMenu";
import "../index.css";

export interface PlaybackControlOptions {
  playbackRates?: string[];
  enableKeybindings?: boolean;
  keybindings?: Record<string, { key: string; value: string }>;
}

const DEFAULT_PLAYBACK_RATES = [
  "0.25",
  "0.50",
  "0.75",
  "1.00",
  "1.25",
  "1.50",
  "1.75",
  "2.00",
];
const DEFAULT_ENABLE_KEYBINDINGS = true;
const DEFAULT_KEYBINDINGS = {
  toggleSpeed: { key: "X", value: "1.50" },
  seekBackward: { key: "A", value: "15" },
  seekForward: { key: "D", value: "15" },
  decreaseSpeed: { key: "S", value: "0.25" },
  increaseSpeed: { key: "W", value: "0.25" },
};

const DEFAULT_OPTIONS: PlaybackControlOptions = {
  playbackRates: DEFAULT_PLAYBACK_RATES,
  enableKeybindings: DEFAULT_ENABLE_KEYBINDINGS,
  keybindings: DEFAULT_KEYBINDINGS,
};

export default function PlaybackControl({
  target,
  options: inOptions = {},
}: {
  target: HTMLVideoElement;
  options?: PlaybackControlOptions;
}) {
  const playbackControlRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const options: PlaybackControlOptions = {
    ...DEFAULT_OPTIONS,
    ...inOptions,
  };

  useEffect(() => {
    if (!playbackControlRef.current) return;
    playbackControlRef.current.parentElement!.style.display = "inline-block";
    playbackControlRef.current.parentElement!.style.height = "100%";
    const blurHandler = (e: MouseEvent) => {
      if (!(playbackControlRef.current as any).contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    const keybindingHandler = (e: KeyboardEvent) => {
      const { key, target: eventTarget } = e;
      const {
        toggleSpeed,
        seekBackward,
        seekForward,
        increaseSpeed,
        decreaseSpeed,
      } = options.keybindings!;

      if (
        eventTarget &&
        ((eventTarget as HTMLElement).tagName === "INPUT" ||
          (eventTarget as HTMLElement).tagName === "TEXTAREA" ||
          (eventTarget as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (!target) return;
      switch (key) {
        case toggleSpeed.key.toLowerCase(): {
          if (target.playbackRate.toFixed(2) !== "1.00") {
            target.playbackRate = 1;
          } else {
            target.playbackRate = Number(toggleSpeed.value);
          }
          break;
        }
        case seekBackward.key.toLowerCase():
          target.currentTime -= +seekBackward.value;
          break;
        case seekForward.key.toLowerCase():
          target.currentTime += +seekForward.value;
          break;
        case increaseSpeed.key.toLowerCase(): {
          const increasedSpeed = target.playbackRate + +increaseSpeed.value;
          if (increasedSpeed > 16) return;
          target.playbackRate = increasedSpeed;
          break;
        }
        case decreaseSpeed.key.toLowerCase(): {
          const decreasedSpeed = target.playbackRate - +increaseSpeed.value;
          if (decreasedSpeed < 0.0625) return;
          target.playbackRate = decreasedSpeed;
          break;
        }
      }
    };

    document.addEventListener("click", blurHandler);
    if (options.enableKeybindings) {
      document.addEventListener("keydown", keybindingHandler);
    }

    return () => {
      document.removeEventListener("click", blurHandler);
      if (options.enableKeybindings) {
        document.removeEventListener("keydown", keybindingHandler);
      }
    };
  }, []);

  return (
    <div
      className="toppings-playback-control h-full flex place-content-center"
      ref={playbackControlRef}
    >
      <PlaybackControlButton setIsMenuOpen={setIsMenuOpen} />
      {isMenuOpen && (
        <PlaybackControlMenu
          target={target}
          options={options}
          setIsMenuOpen={setIsMenuOpen}
        />
      )}
    </div>
  );
}
