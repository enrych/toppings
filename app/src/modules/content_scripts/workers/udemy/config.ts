import { type WorkerConfig } from "../../../../store/";

const udemyWorkerConfig = {
  generalSettings: {
    isEnabled: true as boolean,
  },
  routes: {
    learn: {
      isEnabled: true as boolean,
      keybindings: {
        toggleSpeedShortcut: "X" as string,
        seekBackwardShortcut: "A" as string,
        seekForwardShortcut: "D" as string,
        increaseSpeedShortcut: "W" as string,
        decreaseSpeedShortcut: "S" as string,
        toggleTheatreShortcut: "T" as string,
      },
      preferences: {
        customSpeedList: [
          "0.50",
          "0.75",
          "1.00",
          "1.25",
          "1.50",
          "1.75",
          "2.00",
        ] as Array<string>,
        toggleSpeed: "1.50" as string,
        defaultSpeed: "1.00" as string,
        seekForward: 15 as number,
        seekBackward: 15 as number,
        increaseSpeed: "0.25" as string,
        decreaseSpeed: "0.25" as string,
      },
    },
  },
} satisfies WorkerConfig;

export type UdemyWorkerConfig = typeof udemyWorkerConfig;
export default udemyWorkerConfig;
