import youtubeWorkerConfig, {
	type YouTubeWorkerConfig,
} from '../../../modules/content_scripts/workers/youtube/config';
import udemyWorkerConfig, {
	UdemyWorkerConfig,
} from '../../../modules/content_scripts/workers/udemy/config';

export type { YouTubeWorkerConfig, UdemyWorkerConfig };

export default {
	youtube: youtubeWorkerConfig,
	udemy: udemyWorkerConfig,
};
