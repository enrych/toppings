import { type Config } from '../';

const getConfig = async (): Promise<Config> => {
	return new Promise((resolve) => {
		chrome.storage.sync.get(undefined, (storage) => {
			resolve(storage as Config);
		});
	});
};

export default getConfig;
