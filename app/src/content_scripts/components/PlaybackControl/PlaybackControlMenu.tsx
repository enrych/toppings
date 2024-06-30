import { Dispatch, SetStateAction, useState } from "react";
import { PlaybackControlOptions } from ".";

export default function PlaybackControlMenu({
  target,
  options,
  setIsMenuOpen,
}: {
  target: HTMLVideoElement;
  options: PlaybackControlOptions;
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [currentPlaybackRate, setCurrentPlaybackRate] = useState(
    target.playbackRate.toFixed(2),
  );
  const playbackRates = options.playbackRates!;

  return (
    <div className="relative">
      <div className="absolute bottom-[72px] right-1/4 bg-[#1a1a1a]/90 rounded-[8px] min-h-[250px] z-50 animate-toppings-pop-in leading-none">
        <ul className="py-[12px] m-0 list-none overflow-y-auto" role="menu">
          {playbackRates.map((playbackRate) => {
            const isSelected =
              playbackRate === currentPlaybackRate ? "true" : "false";
            return (
              <li
                key={playbackRate}
                className={`relative pl-0 list-item list-none cursor-pointer hover:bg-[#262626]/90 ${isSelected === "true" ? "bg-[#262626]/90" : ""}`}
                role="none"
                onClick={() => {
                  target.playbackRate = +playbackRate;
                  setCurrentPlaybackRate(playbackRate);
                  setIsMenuOpen(false);
                }}
              >
                <button
                  className="relative w-full h-auto m-0 py-[12px] px-[64px] bg-transparent text-white border-none outline-0 select-none"
                  type="button"
                  role="menuitemradio"
                  tabIndex={-1}
                  aria-checked={isSelected}
                >
                  <div className="flex items-center content-between min-h-4 min-w-[1px]">
                    <span className="text-[12px] font-bold font-sans">
                      {+playbackRate}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
