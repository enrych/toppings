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
  options = {},
}: {
  target: HTMLVideoElement;
  options?: PlaybackControlOptions;
}) {
  const playbackControlRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const mergedOptions: PlaybackControlOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
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
    document.addEventListener("click", blurHandler);

    return () => document.removeEventListener("click", blurHandler);
  }, [playbackControlRef]);

  return (
    <div
      className="toppings-playback-control h-full flex place-content-center"
      ref={playbackControlRef}
    >
      <PlaybackControlButton setIsMenuOpen={setIsMenuOpen} />
      {isMenuOpen && (
        <PlaybackControlMenu
          target={target}
          options={mergedOptions}
          setIsMenuOpen={setIsMenuOpen}
        />
      )}
    </div>
  );
}
