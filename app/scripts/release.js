const fs = require('fs-extra');
const archiver = require('archiver');
const path = require('path');
const chalk = require('chalk');

const buildDir = 'build';
const outputZip = 'bundled.zip';

const archive = archiver('zip', { zlib: { level: 9 } });

const output = fs.createWriteStream(outputZip);

output.on('close', () => {
	console.clear();
	const manifest = require('../src/manifest.json');
	const extensionVersion = manifest.version;

	const message = `
  ┏---------------------------------┓
  |                                 |
  |      Build Version: ${extensionVersion}       |
  |                                 |
  ┗---------------------------------┛

  Toppings has been successfully bundled and is ready for a new release.
  You can now upload the '${outputZip}' file to the Chrome Web Store.
  `;

	console.log(chalk.blue(message));
	process.exit(0);
});

archive.on('warning', (err) => {
	if (err.code === 'ENOENT') {
		console.warn(err);
	} else {
		throw err;
	}
});

archive.on('error', (err) => {
	throw err;
});

archive.pipe(output);

archive.directory(buildDir, false);

archive.finalize().then(() => {
	fs.remove(path.join(__dirname, '..', 'build'));
});
