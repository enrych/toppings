export interface Preferences {
  // General settings
  isExtensionActive: boolean;

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
