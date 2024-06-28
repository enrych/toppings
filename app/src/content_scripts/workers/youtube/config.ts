import { type WorkerConfig } from "../../../background/getWorkerConfig";

const youtubeWorkerConfig = {
  generalSettings: {
    isEnabled: true,
  },
  routes: {
    watch: {
      isEnabled: true,
      keybindings: {
        toggleSpeedShortcut: "X",
        seekBackwardShortcut: "A",
        seekForwardShortcut: "D",
        increaseSpeedShortcut: "W",
        decreaseSpeedShortcut: "S",
      },
      // TODO: The Options page should save the values with toFixed(2) as part of saving
      // validation so that content script doesn't have to bother about it.
      preferences: {
        customSpeedList: [
          "0.25",
          "0.50",
          "0.75",
          "1.00",
          "1.25",
          "1.50",
          "1.75",
          "2.00",
          "2.25",
          "2.50",
        ],
        toggleSpeed: "1.50",
        defaultSpeed: "1.00",
        seekForward: 15,
        seekBackward: 15,
        increaseSpeed: "0.25",
        decreaseSpeed: "0.25",
      },
    },
    playlist: {
      isEnabled: true,
    },
  },
} satisfies WorkerConfig;

export type YouTubeWorkerConfig = typeof youtubeWorkerConfig;
export default youtubeWorkerConfig;
