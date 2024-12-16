const parseDuration = (duration: string): number => {
	const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(duration);
	if (!match) return 0;

	const hours = parseInt(match[1] || '0', 10);
	const minutes = parseInt(match[2] || '0', 10);
	const seconds = parseInt(match[3] || '0', 10);

	return hours * 3600 + minutes * 60 + seconds;
};

export default parseDuration;
