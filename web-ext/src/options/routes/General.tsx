import React, { ChangeEvent } from "react";
import { useContext } from "react";
import { produce } from "immer";
import StoreContext from "../store";
import Card from "../components/Card";
import Switch from "../components/Switch";
import Keybinding from "../components/Keybinding";
import Input from "../components/Input";

export default function General() {
  const { store, setStore } = useContext(StoreContext)!;

  const setIsExtensionEnabled = (isEnabled: boolean) => {
    const newConfig = produce(store, (draft) => {
      draft.isExtensionEnabled = isEnabled;
    });
    setStore(newConfig);

    const prefix = `${isEnabled ? "" : "disabled_"}`;
    const browser = getBrowserEngine();

    if (browser === "firefox") {
      // @ts-ignore: Firefox uses `browserAction` instead of `action` in Manifest V2,
      // but the TypeScript definitions for `chrome` do not account for this discrepancy.
      chrome.browserAction.setIcon({
        path: {
          16: `/assets/icons/${prefix}icon16.png`,
          32: `/assets/icons/${prefix}icon32.png`,
          48: `/assets/icons/${prefix}icon48.png`,
          128: `/assets/icons/${prefix}icon128.png`,
        },
      });
      chrome.storage.sync.set(newConfig);
    } else {
      chrome.action.setIcon({
        path: {
          16: `/assets/icons/${prefix}icon16.png`,
          32: `/assets/icons/${prefix}icon32.png`,
          48: `/assets/icons/${prefix}icon48.png`,
          128: `/assets/icons/${prefix}icon128.png`,
        },
      });
      chrome.storage.sync.set(newConfig);
    }
  };

  const getBrowserEngine = (): "firefox" | "chromium" => {
    if (typeof navigator !== "undefined" && navigator.userAgent) {
      if (navigator.userAgent.includes("Firefox")) {
        return "firefox";
      } else if (
        navigator.userAgent.includes("Chrome") ||
        navigator.userAgent.includes("Edg") ||
        navigator.userAgent.includes("OPR") // Opera
      ) {
        return "chromium";
      }
    }
    return "chromium"; // Default to Chromium for unknown cases
  };

  const setIsPageEnabled = (
    pathname: keyof (typeof store)["preferences"],
    isEnabled: boolean,
  ) => {
    const newConfig = produce(store, (draft) => {
      draft.preferences[pathname].isEnabled = isEnabled;
    });
    setStore(newConfig);
    chrome.storage.sync.set(newConfig);
  };

  const customPlaybackRatesValidator = (inValue: string) => {
    const regex = /^(\d+(\.\d+)?)(\s*,\s*\d+(\.\d+)?)*$/;
    const playbackRates = inValue.split(",").map((rate) => rate.trim());

    if (!regex.test(inValue) || playbackRates.length <= 1) {
      return false;
    }

    const rates = playbackRates.map(parseFloat);
    if (
      rates.includes(NaN) ||
      !rates.includes(1) ||
      rates.some((rate) => rate < 0.0625 || rate > 16)
    ) {
      return false;
    }

    return true;
  };

  const isValidNumeric = (inValue: string, min: number, max: number) => {
    const value = +inValue;
    if (isNaN(value) || value < min || value > max) {
      return false;
    }
    return true;
  };

  return (
    <>
      <div className="tw-p-6">
        <h1 className="tw-text-gray-300 tw-text-4xl tw-font-bold tw-mb-4">
          General
        </h1>
        <h2 className="tw-text-gray-400 tw-text-[12px] tw-mb-8">
          Manage your general settings and preferences
        </h2>
        <hr className="tw-mb-8 tw-border-gray-600/30" />
        <Card>
          <Switch
            title="Enable Extension"
            description="To enable/disable the extension globally."
            isEnabled={store?.isExtensionEnabled}
            onToggle={setIsExtensionEnabled}
          />
        </Card>
      </div>
      <div className="tw-p-6">
        <h1 className="tw-text-gray-300 tw-text-4xl tw-font-bold tw-mb-4">
          Pages
        </h1>
        <h2 className="tw-text-gray-400 tw-text-[12px] tw-mb-8">
          Manage your page settings and preferences
        </h2>
        <hr className="tw-mb-8 tw-border-gray-600/30" />
        <div className="tw-w-full">
          <Card title="Playlist">
            <Switch
              title="Enable Playlist"
              isEnabled={store.preferences.playlist.isEnabled}
              onToggle={setIsPageEnabled.bind(null, "playlist")}
            />
          </Card>
          <Card title="Shorts">
            <Switch
              title="Enable Shorts"
              isEnabled={store.preferences.shorts.isEnabled}
              onToggle={setIsPageEnabled.bind(null, "shorts")}
            />
            <Switch
              title="Enable Auto Scroll"
              isEnabled={store.preferences.shorts.reelAutoScroll.value}
              onToggle={(isEnabled) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.shorts.reelAutoScroll.value = isEnabled;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Input
              title="Toggle Playback Rate"
              initialValue={store.preferences.shorts.togglePlaybackRate.value}
              validator={(value) => {
                return isValidNumeric(value, 0.0625, 16);
              }}
              onChange={(value) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.shorts.togglePlaybackRate.value = value;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Input
              title="Seek Backward"
              initialValue={store.preferences.shorts.seekBackward.value}
              validator={(value) => {
                return isValidNumeric(value, 0, Infinity);
              }}
              onChange={(value) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.shorts.seekBackward.value = value;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Input
              title="Seek Forward"
              initialValue={store.preferences.shorts.seekForward.value}
              validator={(value) => {
                return isValidNumeric(value, 0, Infinity);
              }}
              onChange={(value) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.shorts.seekForward.value = value;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Keybinding
              title="Toggle Playback Rate Shortcut"
              keybinding={store.preferences.shorts.togglePlaybackRate.key}
              onChange={(key) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.shorts.togglePlaybackRate.key = key;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Keybinding
              title="Seek Backward Shortcut"
              keybinding={store.preferences.shorts.seekBackward.key}
              onChange={(key) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.shorts.seekBackward.key = key;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Keybinding
              title="Seek Forward Shortcut"
              keybinding={store.preferences.shorts.seekForward.key}
              onChange={(key) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.shorts.seekForward.key = key;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
          </Card>
          <Card title="Watch">
            <Switch
              title="Enable Watch"
              isEnabled={store.preferences.watch.isEnabled}
              onToggle={setIsPageEnabled.bind(null, "watch")}
            />
            <Switch
              title="Enable Audio Mode"
              description="Listen to videos without visuals — toggle with a player button or keyboard shortcut"
              isEnabled={store.preferences.watch.audioMode.isEnabled}
              onToggle={(isEnabled) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.audioMode.isEnabled = isEnabled;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Keybinding
              title="Toggle Audio Mode Shortcut"
              keybinding={store.preferences.watch.audioMode.toggleAudioMode.key}
              onChange={(key) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.audioMode.toggleAudioMode.key = key;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <div className="tw-flex tw-items-center tw-justify-between tw-py-3">
              <div>
                <div className="tw-text-gray-300 tw-text-sm tw-font-medium">
                  Default Audio Mode Screen
                </div>
                <div className="tw-text-gray-500 tw-text-xs tw-mt-0.5">
                  Can also be changed from the player while in audio mode
                </div>
              </div>
              <select
                className="tw-bg-[#1a1a2e] tw-text-gray-300 tw-border tw-border-gray-600/30 tw-rounded-md tw-px-3 tw-py-1.5 tw-text-sm tw-cursor-pointer"
                value={store.preferences.watch.audioMode.screenMode}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  const mode = e.target.value as
                    | "black"
                    | "visualizer"
                    | "custom";
                  const newConfig = produce(store, (draft) => {
                    draft.preferences.watch.audioMode.screenMode = mode;
                  });
                  setStore(newConfig);
                  chrome.storage.sync.set(newConfig);
                }}
              >
                <option value="black">Black Screen</option>
                <option value="visualizer">Visualizer</option>
                <option value="custom">Custom Image</option>
              </select>
            </div>
            <Input
              title="Custom Background Image URL"
              initialValue={
                store.preferences.watch.audioMode.customBackground.globalImageUrl
              }
              validator={() => true}
              onChange={(value) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.audioMode.customBackground.globalImageUrl =
                    value.trim();
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <div className="tw-flex tw-items-center tw-justify-between tw-py-3">
              <div>
                <div className="tw-text-gray-300 tw-text-sm tw-font-medium">
                  Custom Background Image (Local File)
                </div>
                <div className="tw-text-gray-500 tw-text-xs tw-mt-0.5">
                  Upload an image from your computer (overrides URL above)
                </div>
              </div>
              <div className="tw-flex tw-items-center tw-gap-2">
                <input
                  type="file"
                  accept="image/*"
                  id="tppng-audio-mode-image-upload"
                  className="tw-hidden"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === "string") {
                        chrome.storage.local.set({
                          audioMode_globalCustomImage: reader.result,
                        });
                      }
                    };
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }}
                />
                <button
                  className="tw-bg-[#1a1a2e] tw-text-gray-400 tw-border tw-border-gray-600/30 tw-rounded-md tw-px-3 tw-py-1.5 tw-text-sm tw-cursor-pointer hover:tw-text-gray-200 hover:tw-border-gray-500/50 tw-transition-colors"
                  onClick={() => {
                    document
                      .getElementById("tppng-audio-mode-image-upload")
                      ?.click();
                  }}
                >
                  Choose File
                </button>
                <button
                  className="tw-bg-[#1a1a2e] tw-text-gray-400 tw-border tw-border-gray-600/30 tw-rounded-md tw-px-3 tw-py-1.5 tw-text-sm tw-cursor-pointer hover:tw-text-gray-200 hover:tw-border-gray-500/50 tw-transition-colors"
                  onClick={() => {
                    chrome.storage.local.remove("audioMode_globalCustomImage");
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="tw-flex tw-items-center tw-justify-between tw-py-3">
              <div>
                <div className="tw-text-gray-300 tw-text-sm tw-font-medium">
                  Reset Pinned Videos
                </div>
                <div className="tw-text-gray-500 tw-text-xs tw-mt-0.5">
                  Clear all video-specific audio mode overrides
                </div>
              </div>
              <button
                className="tw-bg-[#1a1a2e] tw-text-gray-400 tw-border tw-border-gray-600/30 tw-rounded-md tw-px-3 tw-py-1.5 tw-text-sm tw-cursor-pointer hover:tw-text-gray-200 hover:tw-border-gray-500/50 tw-transition-colors"
                onClick={() => {
                  chrome.storage.local.get(null, (items) => {
                    const pinKeys = Object.keys(items).filter((k) =>
                      k.startsWith("audioMode_pin_"),
                    );
                    if (pinKeys.length > 0) {
                      chrome.storage.local.remove(pinKeys);
                    }
                  });
                }}
              >
                Reset All
              </button>
            </div>
            <Input
              title="Custom Playback Rates"
              initialValue={store.preferences.watch.customPlaybackRates.toString()}
              validator={customPlaybackRatesValidator}
              onChange={(value) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.customPlaybackRates = value
                    .split(",")
                    .map((playbackRate) =>
                      Number(playbackRate.trim()).toFixed(2),
                    );
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Input
              title="Toggle Playback Rate"
              initialValue={store.preferences.watch.togglePlaybackRate.value}
              validator={(value) => {
                return isValidNumeric(value, 0.0625, 16);
              }}
              onChange={(value) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.togglePlaybackRate.value = value;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Input
              title="Default Playback Rate"
              initialValue={store.preferences.watch.defaultPlaybackRate.value}
              validator={(value) => {
                return isValidNumeric(value, 0.0625, 16);
              }}
              onChange={(value) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.defaultPlaybackRate.value = value;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Input
              title="Decrease Playback Rate"
              initialValue={store.preferences.watch.decreasePlaybackRate.value}
              validator={(value) => {
                return isValidNumeric(value, 0, 16);
              }}
              onChange={(value) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.decreasePlaybackRate.value = value;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Input
              title="Increase Playback Rate"
              initialValue={store.preferences.watch.increasePlaybackRate.value}
              validator={(value) => {
                return isValidNumeric(value, 0, 16);
              }}
              onChange={(value) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.increasePlaybackRate.value = value;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Input
              title="Seek Backward"
              initialValue={store.preferences.watch.seekBackward.value}
              validator={(value) => {
                return isValidNumeric(value, 0, Infinity);
              }}
              onChange={(value) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.seekBackward.value = value;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Input
              title="Seek Forward"
              initialValue={store.preferences.watch.seekForward.value}
              validator={(value) => {
                return isValidNumeric(value, 0, Infinity);
              }}
              onChange={(value) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.seekForward.value = value;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Keybinding
              title="Decrease Playback Rate Shortcut"
              keybinding={store.preferences.watch.decreasePlaybackRate.key}
              onChange={(key) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.decreasePlaybackRate.key = key;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Keybinding
              title="Increase Playback Rate Shortcut"
              keybinding={store.preferences.watch.increasePlaybackRate.key}
              onChange={(key) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.increasePlaybackRate.key = key;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Keybinding
              title="Seek Backward Shortcut"
              keybinding={store.preferences.watch.seekBackward.key}
              onChange={(key) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.seekBackward.key = key;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Keybinding
              title="Seek Forward Shortcut"
              keybinding={store.preferences.watch.seekForward.key}
              onChange={(key) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.seekForward.key = key;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Keybinding
              title="Toggle Loop Segment Shortcut"
              keybinding={store.preferences.watch.toggleLoopSegment.key}
              onChange={(key) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.toggleLoopSegment.key = key;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Keybinding
              title="Set Loop Segment Begin Shortcut"
              keybinding={store.preferences.watch.setLoopSegmentBegin.key}
              onChange={(key) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.setLoopSegmentBegin.key = key;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Keybinding
              title="Set Loop Segment End Shortcut"
              keybinding={store.preferences.watch.setLoopSegmentEnd.key}
              onChange={(key) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.setLoopSegmentEnd.key = key;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
            <Keybinding
              title="Toggle Playback Rate Shortcut"
              keybinding={store.preferences.watch.togglePlaybackRate.key}
              onChange={(key) => {
                const newConfig = produce(store, (draft) => {
                  draft.preferences.watch.togglePlaybackRate.key = key;
                });
                setStore(newConfig);
                chrome.storage.sync.set(newConfig);
              }}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
