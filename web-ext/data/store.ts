import { EXTENSION_CONTEXT_SCOPE } from "./core";

const KEYBOARD_KEY = {
  A: "A",
  B: "B",
  D: "D",
  E: "E",
  Q: "Q",
  S: "S",
  W: "W",
  X: "X",
  Z: "Z",
} as const;

const NUMBER = {
  S0_25: "0.25",
  S1: "1",
  S1_5: "1.5",
  S5: "5",
  S15: "15",
} as const;

export const DEFAULT_STORE = {
  isExtensionEnabled: true as boolean,
  ui: {
    theme: "system" as "system" | "dark" | "light",
    gearMenuEnabled: false as boolean,
    nativeSettingsEnabled: false as boolean,
  },
  preferences: {
    [EXTENSION_CONTEXT_SCOPE.WATCH]: {
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
      saveLoopSegment: {
        key: "" as string, // "" = unbound
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
      cycleProfiles: {
        key: "" as string, // "" = unbound
      },
      nudgeLoopSegment: {
        startBackwardKey: `Shift+${KEYBOARD_KEY.Q}` as string,
        startForwardKey: "" as string, // "" = unbound
        endForwardKey: `Shift+${KEYBOARD_KEY.E}` as string,
        endBackwardKey: "" as string, // "" = unbound
        baseStep: "1" as string, // seconds, first press
        multiplier: "2" as string, // per rapid repeat; 1 disables acceleration
        maxStep: "16" as string, // seconds
      },
      segments: {
        freshSlateKey: `Shift+${KEYBOARD_KEY.Z}` as string,
        // Overridden per video by VideoSegmentData.autoLoadPin.
        autoLoad: "off" as "off" | "last-used" | "default",
      },
    },
    [EXTENSION_CONTEXT_SCOPE.PLAYLIST]: {
      isEnabled: true as boolean,
    },
    [EXTENSION_CONTEXT_SCOPE.SHORTS]: {
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
