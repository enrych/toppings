export const EXTENSION_DEFAULT_STORE = {
  isExtensionEnabled: true as boolean,
  ui: {
    theme: "system" as "system" | "dark" | "light",
  },
  preferences: {
    watch: {
      isEnabled: true as boolean,
      defaultPlaybackRate: {
        value: "1.00" as string,
      },
      togglePlaybackRate: {
        key: "X" as string,
        value: "1.50" as string,
      },
      seekBackward: {
        key: "A" as string,
        value: "15.00" as string,
      },
      seekForward: {
        key: "D" as string,
        value: "15.00" as string,
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
      audioMode: {
        isEnabled: true as boolean,
        toggleAudioMode: {
          key: "B" as string,
        },
        screenMode: "black" as "black" | "visualizer" | "custom",
        customBackground: {
          globalImageUrl: "" as string,
        },
        visualizerSensitivity: "1.5" as string,
      },
      customPlaybackRates: [
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
    },
    playlist: {
      isEnabled: true as boolean,
    },
    shorts: {
      isEnabled: true as boolean,
      togglePlaybackRate: {
        key: "X" as string,
        value: "1.5" as string,
      },
      seekBackward: {
        key: "A" as string,
        value: "5.00" as string,
      },
      seekForward: {
        key: "D" as string,
        value: "5.00" as string,
      },
      reelAutoScroll: {
        value: true as boolean,
      },
    },
  },
};
