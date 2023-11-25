const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const base = {
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.html$/,
				use: [
					{
						loader: 'html-loader',
					},
				],
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.(png|jpe?g|gif|webp)$/i,
				type: 'asset/resource',
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
};

const scriptsConfig = {
	...base,
	entry: {
		background: './src/background/index.ts',
		content: [
			'./src/content_scripts/core/index.ts',
			'./src/content_scripts/index.ts',
		],
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'build'),
	},

	plugins: [
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'src/assets', to: 'assets' },
				{ from: 'src/popup', to: 'popup' },
				'src/manifest.json',
			],
		}),
		new MiniCssExtractPlugin({
			filename: 'css/styles.css',
		}),
	],
};

const optionsConfig = {
	...base,
	entry: { options: './src/options/src/index.ts' },
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'build/options'),
		assetModuleFilename: 'assets/[hash][ext][query]',
	},
	plugins: [
		new HTMLWebpackPlugin({
			template: 'src/options/index.html',
			filename: 'options.html',
			minify: {
				removeComments: true,
				collapseWhitespace: true,
			},
		}),
		new MiniCssExtractPlugin({
			filename: 'styles.css',
		}),
	],
};

module.exports = [scriptsConfig, optionsConfig];
module.exports.parallelism = 1;
