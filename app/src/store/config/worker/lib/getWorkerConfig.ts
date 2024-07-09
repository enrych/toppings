import { type WorkerConfig } from '../interfaces';

const getWorkerConfig = async (worker: string): Promise<WorkerConfig> => {
	return new Promise((resolve) => {
		chrome.storage.sync.get('workers', (storage) => {
			resolve(storage.workers[worker]);
		});
	});
};

export default getWorkerConfig;
