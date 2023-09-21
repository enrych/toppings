/**
 * Config
 */
const version = chrome.runtime.getManifest().version;
document.getElementById('version').textContent = version;

// Default Preferences
const defaultPreferences = {
	// General
	toggleOn: true,
	// Shortcuts
	toggelSpeedShortcut: 'X',
	seekBackwardShortcut: 'A',
	seekForwardShortcut: 'D',
	increaseSpeedShortcut: 'W',
	decreaseSpeedShortcut: 'S',
	// Watch Toppings
	watchEnabled: true,
	customSpeedList: [
		'0.25',
		'0.5',
		'0.75',
		'1',
		'1.25',
		'1.5',
		'1.75',
		'2',
		'2.5',
		'3',
	],
	toggleSpeed: '2',
	defaultSpeed: '1',
	seekForward: '15',
	seekBackward: '15',
	increaseSpeed: '0.25',
	decreaseSpeed: '0.25',
	// Playlist Toppings
	playlistEnabled: true,
};

const keyCodeAliases = {
	0: 'null',
	null: 'null',
	undefined: 'null',
	32: 'Space',
	37: 'Left',
	38: 'Up',
	39: 'Right',
	40: 'Down',
	96: 'Num 0',
	97: 'Num 1',
	98: 'Num 2',
	99: 'Num 3',
	100: 'Num 4',
	101: 'Num 5',
	102: 'Num 6',
	103: 'Num 7',
	104: 'Num 8',
	105: 'Num 9',
	106: 'Num *',
	107: 'Num +',
	109: 'Num -',
	110: 'Num .',
	111: 'Num /',
	112: 'F1',
	113: 'F2',
	114: 'F3',
	115: 'F4',
	116: 'F5',
	117: 'F6',
	118: 'F7',
	119: 'F8',
	120: 'F9',
	121: 'F10',
	122: 'F11',
	123: 'F12',
	186: ';',
	188: '<',
	189: '-',
	187: '+',
	190: '>',
	191: '/',
	192: '~',
	219: '[',
	220: '\\',
	221: ']',
	222: "'",
};

/**
 * Functions
 */

const toggleEnabledUI = (enabled) => {
	const prefix = `${enabled ? '' : 'disabled_'}`;
	chrome.action.setIcon({
		path: {
			16: `/assets/icons/${prefix}icon16.png`,
			32: `/assets/icons/${prefix}icon32.png`,
			48: `/assets/icons/${prefix}icon48.png`,
			128: `/assets/icons/${prefix}icon128.png`,
		},
	});
};

const recordKeyDown = (e) => {
	if (
		(e.keyCode >= 48 && e.keyCode <= 57) || // Numbers 0-9
		(e.keyCode >= 65 && e.keyCode <= 90) || // Letters A-Z
		keyCodeAliases[e.keyCode] // Other character keys
	) {
		e.target.value =
			keyCodeAliases[e.keyCode] || String.fromCharCode(e.keyCode);
		e.target.keyCode = e.keyCode;

		e.preventDefault();
		e.stopPropagation();
	} else if (e.keyCode === 8) {
		// Clear input when backspace pressed
		e.target.value = '';
	} else if (e.keyCode === 27) {
		// When esc clicked, clear input
		e.target.value = 'null';
		e.target.keyCode = null;
	}
};

const inputNumbers = (e) => {
	const char = String.fromCharCode(e.keyCode);
	if (!/[\d\.]$/.test(char) || !/^\d+(\.\d*)?$/.test(e.target.value + char)) {
		e.preventDefault();
		e.stopPropagation();
	}
};

const clearKey = (e) => {
	e.target.value = '';
};

const resetOnBlur = (e) => {
	e.target.value =
		keyCodeAliases[e.target.keyCode] || String.fromCharCode(e.target.keyCode);
};

const isValidNumeric = (element, min, max) => {
	if (isNaN(element.value) || +element.value < min || +element.value > max) {
		alert(
			`Invalid ${element.parentNode.parentNode.children[0].textContent.toLowerCase()}. Please enter a number between ${min} and ${max}.`
		);
		element.value = '';
		element.focus();
		status.textContent = 'Invalid! Not Saved';
		setTimeout(function () {
			status.textContent = '';
		}, 1000);
		return false;
	}
	return true;
};

function hasDuplicates(list) {
	const uniqueValues = new Set(list);
	return uniqueValues.size !== list.length;
}

// Validates settings before saving
const validate = () => {
	const status = document.getElementById('status');

	const toggelSpeedShortcut = document.getElementById(
		'toggelSpeedShortcut'
	).value;
	const seekBackwardShortcut = document.getElementById(
		'seekBackwardShortcut'
	).value;
	const seekForwardShortcut = document.getElementById(
		'seekForwardShortcut'
	).value;
	const increaseSpeedShortcut = document.getElementById(
		'increaseSpeedShortcut'
	).value;
	const decreaseSpeedShortcut = document.getElementById(
		'decreaseSpeedShortcut'
	).value;

	const shortcuts = [
		toggelSpeedShortcut,
		seekBackwardShortcut,
		seekForwardShortcut,
		increaseSpeedShortcut,
		decreaseSpeedShortcut,
	];

	if (hasDuplicates(shortcuts)) {
		alert(
			'Oops! Two shortcuts are assigned to the same key. Please ensure each shortcut has a unique key. '
		);
		status.textContent = 'Invalid! Not Saved';
		setTimeout(function () {
			status.textContent = '';
		}, 1000);
		return false;
	}

	const customSpeedList = document.getElementById('customSpeedList');

	const numberRegex = /^(\d+(?:\.\d+)?(?:\s*,\s*\d+(?:\.\d+)?)*?)$/; // Regex pattern to match comma-separated numbers with optional spaces
	// const numberRegex = /^(\d+(?:\.\d+)?,)*(\d+(?:\.\d+)?)$/; // Regex pattern to match comma-separated numbers
	const numbers = customSpeedList.value.split(',');

	// Check if the input contains more than one comma-separated numbers
	if (!numberRegex.test(customSpeedList.value) || numbers.length <= 1) {
		alert('Custom Speeds must contain more than one comma-separated number.');
		customSpeedList.value = defaultPreferences.customSpeedList ?? '';
		status.textContent = 'Invalid! Not Saved';
		setTimeout(function () {
			status.textContent = '';
		}, 1000);
		return false;
	}

	// Check if all numbers are within the specified range (0.0625 to 16)
	for (let i = 0; i < numbers.length; i++) {
		const number = parseFloat(numbers[i]);
		if (isNaN(number) || number < 0.0625 || number > 16) {
			alert('Custom Speeds must be between 0.0625 and 16.');
			customSpeedList.value = defaultPreferences.customSpeedList ?? '';
			status.textContent = 'Invalid! Not Saved';
			setTimeout(function () {
				status.textContent = '';
			}, 1000);
			return false;
		}
	}

	// Check if the input contains 1 as a number
	if (!numbers.includes('1')) {
		alert('Custom Speeds must contain 1 as a number.');
		customSpeedList.value = defaultPreferences.customSpeedList ?? '';
		status.textContent = 'Invalid! Not Saved';
		setTimeout(function () {
			status.textContent = '';
		}, 1000);
		return false;
	}

	if (!isValidNumeric(document.querySelector('#toggleSpeed'), 0.0625, 16))
		return false;

	if (!isValidNumeric(document.querySelector('#defaultSpeed'), 0.0625, 16))
		return false;

	if (!isValidNumeric(document.querySelector('#seekForward'), 1, 60))
		return false;

	if (!isValidNumeric(document.querySelector('#seekBackward'), 1, 60))
		return false;

	if (!isValidNumeric(document.querySelector('#increaseSpeed'), 0, 1))
		return false;

	if (!isValidNumeric(document.querySelector('#decreaseSpeed'), 0, 1))
		return false;
	return true;
};

// Saves options to chrome.storage
const save_options = () => {
	if (validate() === false) {
		return;
	}
	const toggleOn = document.getElementById('toggleOn').checked;
	const toggelSpeedShortcut = document.getElementById(
		'toggelSpeedShortcut'
	).value;
	const seekBackwardShortcut = document.getElementById(
		'seekBackwardShortcut'
	).value;
	const seekForwardShortcut = document.getElementById(
		'seekForwardShortcut'
	).value;
	const increaseSpeedShortcut = document.getElementById(
		'increaseSpeedShortcut'
	).value;
	const decreaseSpeedShortcut = document.getElementById(
		'decreaseSpeedShortcut'
	).value;
	const watchEnabled = document.getElementById('watchEnabled').checked;
	const customSpeedList = document
		.getElementById('customSpeedList')
		.value.split(',')
		.map((substring) => substring.trim());
	const toggleSpeed = document.getElementById('toggleSpeed').value;
	const defaultSpeed = document.getElementById('defaultSpeed').value;
	const seekForward = document.getElementById('seekForward').value;
	const seekBackward = document.getElementById('seekBackward').value;
	const increaseSpeed = document.getElementById('increaseSpeed').value;
	const decreaseSpeed = document.getElementById('decreaseSpeed').value;
	const playlistEnabled = document.getElementById('playlistEnabled').checked;
	chrome.storage.sync.set(
		{
			toggleOn: toggleOn,
			toggelSpeedShortcut: toggelSpeedShortcut,
			seekBackwardShortcut: seekBackwardShortcut,
			seekForwardShortcut: seekForwardShortcut,
			increaseSpeedShortcut: increaseSpeedShortcut,
			decreaseSpeedShortcut: decreaseSpeedShortcut,
			watchEnabled: watchEnabled,
			customSpeedList: customSpeedList,
			toggleSpeed: toggleSpeed,
			defaultSpeed: defaultSpeed,
			seekForward: seekForward,
			seekBackward: seekBackward,
			increaseSpeed: increaseSpeed,
			decreaseSpeed: decreaseSpeed,
			playlistEnabled: playlistEnabled,
		},
		function () {
			toggleEnabledUI(toggleOn);
			// Update status to let user know options were saved.
			var status = document.getElementById('status');
			status.textContent = 'Options saved';
			setTimeout(function () {
				status.textContent = '';
				alert('Please reload YouTube to see changes. Thank you!');
			}, 1000);
		}
	);
};

const restore_options = () => {
	// Retrieve preferences from Chrome storage
	chrome.storage.sync.get(defaultPreferences, function (storage) {
		document.getElementById('toggleOn').checked = storage.toggleOn;
		document.getElementById('toggelSpeedShortcut').value =
			storage.toggelSpeedShortcut;
		document.getElementById('seekBackwardShortcut').value =
			storage.seekBackwardShortcut;
		document.getElementById('seekForwardShortcut').value =
			storage.seekForwardShortcut;
		document.getElementById('increaseSpeedShortcut').value =
			storage.increaseSpeedShortcut;
		document.getElementById('decreaseSpeedShortcut').value =
			storage.decreaseSpeedShortcut;
		document.getElementById('watchEnabled').checked = storage.watchEnabled;
		document.getElementById('customSpeedList').value = storage.customSpeedList;
		document.getElementById('toggleSpeed').value = storage.toggleSpeed;
		document.getElementById('defaultSpeed').value = storage.defaultSpeed;
		document.getElementById('seekForward').value = storage.seekForward;
		document.getElementById('seekBackward').value = storage.seekBackward;
		document.getElementById('increaseSpeed').value = storage.increaseSpeed;
		document.getElementById('decreaseSpeed').value = storage.decreaseSpeed;
		document.getElementById('playlistEnabled').checked =
			storage.playlistEnabled;
	});
};

const restore_defaults = () => {
	chrome.storage.sync.set(defaultPreferences, function () {
		restore_options();
		toggleEnabledUI(true);
		const status = document.getElementById('status');
		status.textContent = 'Default options restored';
		setTimeout(function () {
			status.textContent = '';
			alert('Please reload YouTube to see changes. Thank you!');
		}, 1000);
	});
};

const classEventHandler = (event, className, callback) => {
	if (!event.target.classList.contains(className)) {
		return;
	}
	callback(event);
};

document.addEventListener('DOMContentLoaded', function () {
	restore_options();

	// Search Bar
	const searchInput = document.querySelector('.search-input');
	const categoryWrappers = document.querySelectorAll('.category-wrapper');
	const actions = document.querySelector('.actions');
	searchInput.addEventListener('input', () => {
		let count = 0;
		const searchTerm = searchInput.value.trim().toLowerCase();

		categoryWrappers.forEach((wrapper) => {
			const sectionTitle = wrapper
				.querySelector('h2')
				.textContent.toLowerCase();

			if (sectionTitle.includes(searchTerm)) {
				count += 1;
				wrapper.style.display = 'block';
			} else {
				wrapper.style.display = 'none';
			}
		});
		if (count === 0) {
			actions.style.display = 'none';
		} else {
			actions.style.display = 'block';
		}
	});

	// Arrow Button
	const numeric = document.querySelectorAll('.numeric');
	numeric.forEach((setting) => {
		const input = setting.querySelector('input');
		const decreaseButton = setting.querySelectorAll('.arrows')[0];
		const increaseButton = setting.querySelectorAll('.arrows')[1];

		decreaseButton.addEventListener('click', function () {
			input.value = `${parseFloat(input.value) - 1}`;
		});

		increaseButton.addEventListener('click', function () {
			input.value = `${parseFloat(input.value) + 1}`;
		});
	});

	// Toggle Connection
	const toppings = document.querySelectorAll('.toppings');
	const toggleOn = document.querySelector('#toggleOn');
	toppings.forEach((topping) => {
		topping.addEventListener('click', (e) => {
			if (e.target.checked) {
				toggleOn.checked = true;
			}
		});
	});
	document.querySelector('#toggleOn').addEventListener('click', (e) => {
		if (!e.target.checked) {
			toppings.forEach((topping) => {
				topping.checked = false;
			});
		}
	});

	// Event Listeners
	document.getElementById('save').addEventListener('click', save_options);
	document
		.getElementById('restore')
		.addEventListener('click', restore_defaults);

	document.addEventListener('keypress', (event) => {
		classEventHandler(event, 'with-arrows', inputNumbers);
	});
	document.addEventListener(
		'focus',
		(event) => {
			classEventHandler(event, 'key', clearKey);
		},
		true
	);
	document.addEventListener(
		'blur',
		(event) => {
			classEventHandler(event, 'key', resetOnBlur);
		},
		true
	);
	document.addEventListener('keydown', (event) => {
		classEventHandler(event, 'key', recordKeyDown);
	});
});
