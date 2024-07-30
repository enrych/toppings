import { WebAppConfig } from "../../../lib/getWebAppConfig";

const youtubeConfig = {
  generalSettings: {
    isEnabled: true as boolean,
  },
  routes: {
    watch: {
      isEnabled: true as boolean,
      keybindings: {
        toggleSpeedShortcut: "X" as string,
        seekBackwardShortcut: "A" as string,
        seekForwardShortcut: "D" as string,
        increaseSpeedShortcut: "W" as string,
        decreaseSpeedShortcut: "S" as string,
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
        ] as Array<string>,
        toggleSpeed: "1.50" as string,
        defaultSpeed: "1.00" as string,
        seekForward: "15.00" as string,
        seekBackward: "15.00" as string,
        increaseSpeed: "0.25" as string,
        decreaseSpeed: "0.25" as string,
      },
    },
    playlist: {
      isEnabled: true as boolean,
    },
    shorts: {
      isEnabled: true as boolean,
      keybindings: {
        toggleSpeedShortcut: "X" as string,
      },
      preferences: {
        reelAutoScroll: true as boolean,
      },
    },
  },
} satisfies WebAppConfig;

export type YouTubeConfig = typeof youtubeConfig;
export default youtubeConfig;
