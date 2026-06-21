import { EXTENSION_CONTEXT_SCOPE } from "./contract";

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
    /** Inject a Toppings section into YouTube's player gear (⚙) menu. */
    gearMenuEnabled: false as boolean,
    /** Inject a Toppings entry into YouTube's left sidebar + native settings page. */
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
        /** Save current loop (loop active) or clear saved loop (loop inactive). */
        key: "" as string, // unset by default — user assigns e.g. "Shift+Z"
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
        // Empty string = unset; user must configure.
        key: "" as string,
      },
      nudgeLoopSegment: {
        /** Combo that nudges the start marker backward (default: Shift+Q). */
        startBackwardKey: `Shift+${KEYBOARD_KEY.Q}` as string,
        /** Combo that nudges the start marker forward. Empty = unset. */
        startForwardKey: "" as string,
        /** Combo that nudges the end marker forward (default: Shift+E). */
        endForwardKey: `Shift+${KEYBOARD_KEY.E}` as string,
        /** Combo that nudges the end marker backward. Empty = unset. */
        endBackwardKey: "" as string,
        /** First-press nudge size in seconds. */
        baseStep: "1" as string,
        /** Step multiplier for rapid consecutive presses (1 = no acceleration). */
        multiplier: "2" as string,
        /** Maximum nudge step ceiling in seconds. */
        maxStep: "16" as string,
      },
      segments: {
        /**
         * Key combo that always starts a fresh-slate segment config
         * (1 segment, full video, infinite loop). Defaults to Shift+Z.
         */
        freshSlateKey: `Shift+${KEYBOARD_KEY.Z}` as string,
        /**
         * Default auto-load behaviour on each video page open.
         *   "off"       → manual only; segments never auto-enable
         *   "last-used" → restore the volatile last-used snapshot if present
         *   "default"   → restore the default saved config if one is set
         * Per-video pins (stored in VideoSegmentData.autoLoadPin) override this.
         */
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
