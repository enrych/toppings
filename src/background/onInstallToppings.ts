const INSTALL_URL: string = 'https://www.grabtoppings.xyz/#/greetings'

const onInstallToppings = ({ reason }: { reason: chrome.runtime.OnInstalledReason }): void => {
  if (reason === 'install' || reason === 'update') {
    if (process.env.NODE_ENV === 'production') {
      void chrome.tabs.create({ url: INSTALL_URL }) // This URL will be redirected to when extension is installed.
    }
    // Define initial user preferences
    const initialPreferences = {
      // General
      toggleOn: true,
      // Shortcuts
      toggleSpeedShortcut: 'X',
      seekBackwardShortcut: 'A',
      seekForwardShortcut: 'D',
      increaseSpeedShortcut: 'W',
      decreaseSpeedShortcut: 'S',
      // Watch Toppings
      watchEnabled: true,
      customSpeedList: [
        '0.25',
        '0.5',
        '0.75',
        '1',
        '1.25',
        '1.5',
        '1.75',
        '2',
        '2.25',
        '2.5'
      ],
      toggleSpeed: '1.5',
      defaultSpeed: '1',
      seekForward: '15',
      seekBackward: '15',
      increaseSpeed: '0.25',
      decreaseSpeed: '0.25',
      // Playlist Toppings
      playlistEnabled: true
    }

    // Save the initial preferences to Chrome storage
    void chrome.storage.sync.set(initialPreferences)
  }
}

export default onInstallToppings
