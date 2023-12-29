/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const getDirectories = (source) =>
	fs
		.readdirSync(source, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

const generateEntryPoints = () => {
	const modulesPath = path.resolve(__dirname, 'src/content_scripts/modules');
	const modulesDirectories = getDirectories(modulesPath);

	const entryPoints = {};
	modulesDirectories.forEach((dir) => {
		entryPoints[dir] = path.resolve(modulesPath, dir, 'index.ts');
	});

	return entryPoints;
};

module.exports = {
	mode: 'production',
	entry: {
		background: './src/background/index.ts',
		content: [
			'./src/content_scripts/core/index.ts',
			'./src/content_scripts/index.ts',
		],
		...generateEntryPoints(),
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'build'),
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},
	plugins: [
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'src/assets', to: 'assets' },
				{ from: 'src/options', to: 'options' },
				{ from: 'src/popup', to: 'popup' },
				'src/manifest.json',
			],
		}),
		new MiniCssExtractPlugin({
			filename: 'css/styles.css',
		}),
	],
};
