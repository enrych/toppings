import SERVER_BASE_URI from './server';
import DEFAULT_CONFIG, { type Config } from './config';
import getConfig from './config/lib/getConfig';
import getAllWorkerConfig from './config/worker/lib/getAllWorkerConfig';
import getWorkerConfig from './config/worker/lib/getWorkerConfig';
import type { YouTubeWorkerConfig, UdemyWorkerConfig } from './config/worker';
import type {
	WorkerConfig,
	WorkerConfigGeneralSettings,
	WorkerConfigRouteConfig,
} from './config/worker/interfaces';

export { getConfig, getAllWorkerConfig, getWorkerConfig };
export type {
	YouTubeWorkerConfig,
	UdemyWorkerConfig,
	WorkerConfig,
	WorkerConfigGeneralSettings,
	WorkerConfigRouteConfig,
	Config,
};

export { SERVER_BASE_URI, DEFAULT_CONFIG };
