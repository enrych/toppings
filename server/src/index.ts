import { AutoRouter } from 'itty-router';
import getPlaylist from './routes/playlist';

const router = AutoRouter();

router.get('/playlist/:playlistID', getPlaylist);

router.all(
	'*',
	() =>
		new Response(JSON.stringify({ error_message: 'Not found' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		}),
);

export default router;
