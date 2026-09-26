import { EXTENSION_CONTEXT_SCOPE } from "./core";

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
        value: "1" as string,
      },
      togglePlaybackRate: {
        key: "X" as string,
        value: "1.5" as string,
      },
      seekBackward: {
        key: "A" as string,
        value: "15" as string,
      },
      seekForward: {
        key: "D" as string,
        value: "15" as string,
      },
      increasePlaybackRate: {
        key: "W" as string,
        value: "0.25" as string,
      },
      decreasePlaybackRate: {
        key: "S" as string,
        value: "0.25" as string,
      },
      toggleLoopSegment: {
        key: "Z" as string,
      },
      setLoopSegmentBegin: {
        key: "Q" as string,
      },
      setLoopSegmentEnd: {
        key: "E" as string,
      },
      saveLoopSegment: {
        key: "" as string, // "" = unbound
      },
      customPlaybackRates: [] as Array<string>,
      cycleProfiles: {
        key: "" as string, // "" = unbound
      },
      nudgeLoopSegment: {
        startBackwardKey: `Shift+${"Q"}` as string,
        startForwardKey: "" as string, // "" = unbound
        endForwardKey: `Shift+${"E"}` as string,
        endBackwardKey: "" as string, // "" = unbound
        baseStep: "1" as string, // seconds, first press
        multiplier: "2" as string, // per rapid repeat; 1 disables acceleration
        maxStep: "16" as string, // seconds
      },
      segments: {
        freshSlateKey: `Shift+${"Z"}` as string,
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
        key: "X" as string,
        value: "1.5" as string,
      },
      seekBackward: {
        key: "A" as string,
        value: "5" as string,
      },
      seekForward: {
        key: "D" as string,
        value: "5" as string,
      },
      reelAutoScroll: {
        value: true as boolean,
      },
    },
  },
};
