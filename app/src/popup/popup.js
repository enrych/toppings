/**
 * Config
 */
const version = chrome.runtime.getManifest().version;
document.getElementById('version').textContent = version;
let content;

/**
 * Render
 */

const renderHome = () => {
	if (document.querySelector('li#home').className === 'active') {
		return;
	}
	if (document.querySelector('li#home').className != 'onload') {
		document.querySelector('li.active').className = '';
	}

	document.querySelector('li#home').className = 'active';

	const icon = document.createElement('img');
	icon.setAttribute('src', chrome.runtime.getURL('popup/assets/homepage.jpg'));
	icon.setAttribute('class', 'icon');
	icon.setAttribute('draggable', 'false');

	const heading = document.createElement('h1');
	heading.setAttribute('class', 'heading');
	heading.append(document.createTextNode('Welcome to Toppings!'));

	const message = document.createElement('p');
	message.setAttribute('class', 'message');
	message.append(
		document.createTextNode(
			'Add extra flavors to your YouTube experience with our extension. Customize and enhance your video watching.'
		)
	);

	content.replaceChildren(icon, heading, message);
	// content.style.background = `url("${background}")`;
	// content.style.backgroundRepeat = 'no-repeat';
	// content.style.backgroundPosition = 'center';
	// content.style.backgroundAttachment = 'fixed';
	// content.style.backgroundSize = 'cover';
};

const renderNotifications = () => {
	content.style.background = 'unset';
	if (document.querySelector('li#notify').className === 'active') {
		return;
	}
	document.querySelector('li.active').className = '';
	document.querySelector('li#notify').className = 'active';

	const icon = document.createElement('img');
	icon.setAttribute(
		'src',
		chrome.runtime.getURL('popup/assets/all-caught-up.webp')
	);
	icon.setAttribute('class', 'icon');
	icon.setAttribute('draggable', 'false');

	const heading = document.createElement('h1');
	heading.setAttribute('class', 'heading');
	heading.append(document.createTextNode("You're all caught up!"));

	const message = document.createElement('p');
	message.setAttribute('class', 'message');
	message.append(
		document.createTextNode(
			'Once you receive a new notification, it will appear here.'
		)
	);

	content.replaceChildren(icon, heading, message);
};

const renderSettings = () => {
	content.style.background = 'unset';
	window.open(chrome.runtime.getURL('options/options.html'));
};

const renderHelp = () => {
	content.style.background = 'unset';
	window.open('https://www.grabtoppings.xyz/#/how-to-use');
};

/**
 * Run
 */
document.addEventListener('DOMContentLoaded', function () {
	content = document.querySelector('div.popup-content');
	document.querySelector('#home').addEventListener('click', renderHome);
	document
		.querySelector('#notify')
		.addEventListener('click', renderNotifications);
	document.querySelector('#help').addEventListener('click', renderHelp);
	document.querySelector('#settings').addEventListener('click', renderSettings);
	renderHome();
});
