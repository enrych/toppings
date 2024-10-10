import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { PlaybackControlOptions } from ".";
import PlaybackControlMenuItem from "./PlaybackControlMenuItem";

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
  const [customPlaybackRate, setCustomPlaybackRate] = useState("NaN");
  const [isCustomPlaybackRate, setIsCustomPlaybackRate] = useState(false);
  const playbackRates = options.playbackRates!;

  useEffect(() => {
    const handlePlaybackRateChange = () => {
      if (!playbackRates.includes(target.playbackRate.toFixed(2))) {
        setIsCustomPlaybackRate(true);
        setCustomPlaybackRate(target.playbackRate.toFixed(2));
      }
      setCurrentPlaybackRate(target.playbackRate.toFixed(2));
    };

    handlePlaybackRateChange();
    target.addEventListener("ratechange", handlePlaybackRateChange);

    return () => {
      target.removeEventListener("ratechange", handlePlaybackRateChange);
    };
  }, [target]);

  return (
    <div className="relative">
      <div className="absolute bottom-[66px] right-1/4 py-[12px] bg-[#1a1a1a]/90 rounded-[8px] min-h-fit z-50 animate-toppings-pop-in leading-none">
        <div className="mb-[8px] pt-[6px] pb-[18px] w-full flex justify-center items-center border-b border-white/30 border-solid select-none">
          <p className="text-[14px] text-white font-bold">Playback Rate</p>
        </div>
        <ul className="m-0 list-none overflow-y-auto" role="menu">
          {isCustomPlaybackRate && (
            <PlaybackControlMenuItem
              label={`Custom(${+customPlaybackRate})`}
              isSelected={
                Number(customPlaybackRate) === Number(currentPlaybackRate)
                  ? "true"
                  : "false"
              }
              onClick={() => {
                target.playbackRate = +customPlaybackRate;
                setCurrentPlaybackRate(customPlaybackRate);
                setIsMenuOpen(false);
              }}
            />
          )}
          {playbackRates.map((playbackRate) => {
            const isSelected =
              playbackRate === currentPlaybackRate ? "true" : "false";
            return (
              <PlaybackControlMenuItem
                key={playbackRate}
                label={(+playbackRate).toString()}
                isSelected={isSelected}
                onClick={() => {
                  target.playbackRate = +playbackRate;
                  setCurrentPlaybackRate(playbackRate);
                  setIsMenuOpen(false);
                }}
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
}
