import { KEYBOARD_KEY } from "./keyboardKey";
import { NUMBER } from "./number";

export const EXTENSION_DEFAULT_STORE = {
  isExtensionEnabled: true as boolean,
  ui: {
    theme: "system" as "system" | "dark" | "light",
  },
  preferences: {
    watch: {
      isEnabled: true as boolean,
      defaultPlaybackRate: {
        value: NUMBER.S1 as string,
      },
      togglePlaybackRate: {
        key: KEYBOARD_KEY.X as string,
        value: NUMBER.S1_5 as string,
      },
      seekBackward: {
        key: KEYBOARD_KEY.A as string,
        value: NUMBER.S15 as string,
      },
      seekForward: {
        key: KEYBOARD_KEY.D as string,
        value: NUMBER.S15 as string,
      },
      increasePlaybackRate: {
        key: KEYBOARD_KEY.W as string,
        value: NUMBER.S0_25 as string,
      },
      decreasePlaybackRate: {
        key: KEYBOARD_KEY.S as string,
        value: NUMBER.S0_25 as string,
      },
      toggleLoopSegment: {
        key: KEYBOARD_KEY.Z as string,
      },
      setLoopSegmentBegin: {
        key: KEYBOARD_KEY.Q as string,
      },
      setLoopSegmentEnd: {
        key: KEYBOARD_KEY.E as string,
      },
      audioMode: {
        isEnabled: true as boolean,
        toggleAudioMode: {
          key: KEYBOARD_KEY.B as string,
        },
        screenMode: "black" as "black" | "visualizer" | "custom",
        customBackground: {
          globalImageUrl: "" as string,
        },
        visualizerSensitivity: NUMBER.S1_5 as string,
      },
      customPlaybackRates: [] as Array<string>,
    },
    playlist: {
      isEnabled: true as boolean,
    },
    shorts: {
      isEnabled: true as boolean,
      togglePlaybackRate: {
        key: KEYBOARD_KEY.X as string,
        value: NUMBER.S1_5 as string,
      },
      seekBackward: {
        key: KEYBOARD_KEY.A as string,
        value: NUMBER.S5 as string,
      },
      seekForward: {
        key: KEYBOARD_KEY.D as string,
        value: NUMBER.S5 as string,
      },
      reelAutoScroll: {
        value: true as boolean,
      },
    },
  },
};
