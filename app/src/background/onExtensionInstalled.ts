import { initialPreferences } from '../store';

const INSTALL_URL: string = 'https://enrych.github.io/toppings-web/#/greetings';

const onExtensionInstalled = ({
	reason,
}: {
	reason: chrome.runtime.OnInstalledReason;
}): void => {
	if (reason === 'install' || reason === 'update') {
		if (process.env.NODE_ENV === 'production') {
			void chrome.tabs.create({ url: INSTALL_URL }); // This URL will be redirected to when extension is installed.
		}

		void chrome.storage.sync.set(initialPreferences);
	}
};

export default onExtensionInstalled;
