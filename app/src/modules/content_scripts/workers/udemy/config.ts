import { type WorkerConfig } from '../../../../store/getWorkerConfig';

const udemyWorkerConfig = {
	generalSettings: {
		isEnabled: true,
	},
	routes: {
		learn: {
			isEnabled: true,
			keybindings: {
				toggleSpeedShortcut: 'X',
				seekBackwardShortcut: 'A',
				seekForwardShortcut: 'D',
				increaseSpeedShortcut: 'W',
				decreaseSpeedShortcut: 'S',
				toggleTheatreShortcut: 'T',
			},
			preferences: {
				customSpeedList: [
					'0.50',
					'0.75',
					'1.00',
					'1.25',
					'1.50',
					'1.75',
					'2.00',
				],
				toggleSpeed: '1.50',
				defaultSpeed: '1.00',
				seekForward: 15,
				seekBackward: 15,
				increaseSpeed: '0.25',
				decreaseSpeed: '0.25',
			},
		},
	},
} satisfies WorkerConfig;

export type UdemyWorkerConfig = typeof udemyWorkerConfig;
export default udemyWorkerConfig;
