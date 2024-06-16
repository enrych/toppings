export interface Preferences {
  // General settings
  isExtensionEnabled: boolean;

  // Shortcut settings
  toggleSpeedShortcut: string;
  seekBackwardShortcut: string;
  seekForwardShortcut: string;
  increaseSpeedShortcut: string;
  decreaseSpeedShortcut: string;

  // Watch Toppings settings
  watchEnabled: boolean;
  customSpeedList: string[];
  toggleSpeed: string;
  defaultSpeed: string;
  seekForward: string;
  seekBackward: string;
  increaseSpeed: string;
  decreaseSpeed: string;

  // Playlist Toppings settings (assuming boolean for playlistEnabled)
  playlistEnabled: boolean;
}

export const initialPreferences = {
  // General
  isExtensionEnabled: true,
  // Shortcuts
  toggleSpeedShortcut: "X",
  seekBackwardShortcut: "A",
  seekForwardShortcut: "D",
  increaseSpeedShortcut: "W",
  decreaseSpeedShortcut: "S",
  // Watch Toppings
  watchEnabled: true,
  customSpeedList: [
    "0.25",
    "0.5",
    "0.75",
    "1",
    "1.25",
    "1.5",
    "1.75",
    "2",
    "2.25",
    "2.5",
  ],
  toggleSpeed: "1.5",
  defaultSpeed: "1",
  seekForward: "15",
  seekBackward: "15",
  increaseSpeed: "0.25",
  decreaseSpeed: "0.25",
  // Playlist Toppings
  playlistEnabled: true,
};

const GLOBAL_CONTEXT = Object.freeze({
  MAX_PLAYBACK_RATE: 16.0,
  MIN_PLAYBACK_RATE: 0.0625,
});

export default GLOBAL_CONTEXT;
