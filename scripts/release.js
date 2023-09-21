const fs = require('fs-extra');
const archiver = require('archiver');
const path = require('path');

const buildDir = 'build';
const outputZip = 'bundled.zip';

const archive = archiver('zip', { zlib: { level: 9 } });

const output = fs.createWriteStream(outputZip);

output.on('close', () => {
	console.log(`${outputZip} created successfully.`);
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
