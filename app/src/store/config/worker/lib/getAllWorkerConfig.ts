import { type WorkerConfig } from '../interfaces';

const getAllWorkerConfig = async (): Promise<Record<string, WorkerConfig>> => {
	return new Promise((resolve) => {
		chrome.storage.sync.get('workers', (storage) => {
			resolve(storage.workers);
		});
	});
};

export default getAllWorkerConfig;
