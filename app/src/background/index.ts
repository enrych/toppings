import {
	type WebAppContext,
	getWebAppContext,
	dispatchWebAppContext,
} from './webAppContext';
import onExtensionInstalled from './onExtensionInstalled';

const UNINSTALL_URL: string =
	'https://enrych.github.io/toppings-web/#/farewell';

let isExtensionEnabled: boolean;

chrome.runtime.onInstalled.addListener(onExtensionInstalled);

if (process.env.NODE_ENV === 'production') {
	void chrome.runtime.setUninstallURL(UNINSTALL_URL);
}

chrome.storage.onChanged.addListener((changes, namespace) => {
	if (namespace === 'sync') {
		if (changes?.isExtensionEnabled != null) {
			isExtensionEnabled = changes.isExtensionEnabled.newValue;
		}
	}
});

chrome.webNavigation.onCompleted.addListener((details) => {
	const tabId = details.tabId;
	const webAppContext: WebAppContext = getWebAppContext(details.url);

	chrome.storage.sync.get('isExtensionEnabled', (storage) => {
		isExtensionEnabled = storage.isExtensionEnabled;
		if (!webAppContext.isSupported || !isExtensionEnabled) return;
		dispatchWebAppContext(tabId, webAppContext);
	});
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
	const tabId = details.tabId;
	const webAppContext: WebAppContext = getWebAppContext(details.url);

	chrome.storage.sync.get('isExtensionEnabled', (storage) => {
		isExtensionEnabled = storage.isExtensionEnabled;
		if (!webAppContext.isSupported || !isExtensionEnabled) return;
		dispatchWebAppContext(tabId, webAppContext);
	});
});
