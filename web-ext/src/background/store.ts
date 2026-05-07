export const DEFAULT_STORE = {
  isExtensionEnabled: true as boolean,
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
        rememberPerVideo: false as boolean,
      },
      // TODO: The Options page should save the values with toFixed(2) as part of saving
      // validation so that content script doesn't have to bother about it.
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

function deepMerge(defaults: any, stored: any): any {
  if (!stored || typeof stored !== "object" || typeof defaults !== "object") {
    return stored ?? defaults;
  }
  const result = { ...defaults };
  for (const key of Object.keys(stored)) {
    if (
      key in defaults &&
      typeof defaults[key] === "object" &&
      !Array.isArray(defaults[key])
    ) {
      result[key] = deepMerge(defaults[key], stored[key]);
    } else {
      result[key] = stored[key];
    }
  }
  return result;
}

export const getStorage = async (): Promise<Storage> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(undefined, (storage) => {
      resolve(deepMerge(DEFAULT_STORE, storage) as Storage);
    });
  });
};

export type Storage = typeof DEFAULT_STORE;
