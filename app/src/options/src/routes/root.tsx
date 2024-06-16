import Header from "../components/Header";
import Category from "../components/Category";
import Preference from "../components/Preference";
import Shortcut from "../components/Shortcut";
import Actions from "../components/Actions";
import { type Preferences } from "../../../background/store/";
import { useEffect, useState } from "react";
function App() {
  const version = chrome.runtime.getManifest().version;
  const [preferences, setPreferences] = useState({
    isExtensionActive: true,
    toggleSpeedShortcut: "X",
    seekBackwardShortcut: "A",
    seekForwardShortcut: "D",
    increaseSpeedShortcut: "W",
    decreaseSpeedShortcut: "S",
    watchEnabled: true,
    customSpeedList: ["0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3"],
    toggleSpeed: "1",
    defaultSpeed: "1",
    seekForward: "10",
    seekBackward: "10",
    increaseSpeed: "0.1",
    decreaseSpeed: "0.1",
    playlistEnabled: true,
  });

  useEffect(() => {
    chrome.storage.sync.get(preferences, (storage) => {
      setPreferences(storage as Preferences);
    });
  }, []);

  const handleSave = () => {};

  const handleRestoreDefaults = () => {
    setPreferences({
      isExtensionActive: true,
      toggleSpeedShortcut: "X",
      seekBackwardShortcut: "A",
      seekForwardShortcut: "D",
      increaseSpeedShortcut: "W",
      decreaseSpeedShortcut: "S",
      watchEnabled: true,
      customSpeedList: ["0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3"],
      toggleSpeed: "1",
      defaultSpeed: "1",
      seekForward: "10",
      seekBackward: "10",
      increaseSpeed: "0.1",
      decreaseSpeed: "0.1",
      playlistEnabled: true,
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header version={version} />
      <div className="container mx-auto pt-24">
        <Category title="General">
          <Preference
            label="Toggle On/Off"
            type="switch"
            id="isExtensionActive"
            value={preferences.isExtensionActive}
          />
        </Category>
        <Category title="Shortcuts">
          <Shortcut
            label="Toggle Speed"
            id="toggleSpeedShortcut"
            value={preferences.toggleSpeedShortcut}
          />
          <Shortcut
            label="Seek Backward"
            id="seekBackwardShortcut"
            value={preferences.seekBackwardShortcut}
          />
          <Shortcut
            label="Seek Forward"
            id="seekForwardShortcut"
            value={preferences.seekForwardShortcut}
          />
          <Shortcut
            label="Increase Speed"
            id="increaseSpeedShortcut"
            value={preferences.increaseSpeedShortcut}
          />
          <Shortcut
            label="Decrease Speed"
            id="decreaseSpeedShortcut"
            value={preferences.decreaseSpeedShortcut}
          />
        </Category>
        <Category title="Toppings: Watch">
          <Preference
            label="Disable / Enable"
            type="switch"
            id="watchEnabled"
            value={preferences.watchEnabled}
          />
          <Preference
            label="Custom Speeds (comma-separated)"
            type="text"
            id="customSpeedList"
            value={preferences.customSpeedList}
          />
          <Preference
            label="Toggle Speed"
            type="numeric"
            id="toggleSpeed"
            value={preferences.toggleSpeed}
          />
          <Preference
            label="Default Speed"
            type="numeric"
            id="defaultSpeed"
            value={preferences.defaultSpeed}
          />
          <Preference
            label="Seek Forward(s)"
            type="numeric"
            id="seekForward"
            value={preferences.seekForward}
          />
          <Preference
            label="Seek Backward(s)"
            type="numeric"
            id="seekBackward"
            value={preferences.seekBackward}
          />
          <Preference
            label="Increase Speed"
            type="numeric"
            id="increaseSpeed"
            value={preferences.increaseSpeed}
          />
          <Preference
            label="Decrease Speed"
            type="numeric"
            id="decreaseSpeed"
            value={preferences.decreaseSpeed}
          />
        </Category>
        <Category title="Toppings: Playlist">
          <Preference
            label="Disable / Enable"
            type="switch"
            id="playlistEnabled"
            value={preferences.playlistEnabled}
          />
        </Category>
        <Actions
          onSave={handleSave}
          onRestoreDefaults={handleRestoreDefaults}
        />
      </div>
    </div>
  );
}

export default App;
