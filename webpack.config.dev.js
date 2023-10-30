/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: {
    background: './src/background/index.ts',
    content: [
      './src/content_scripts/core/index.ts',
      './src/content_scripts/index.ts'
    ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets', to: 'assets' },
        { from: 'src/options', to: 'options' },
        { from: 'src/popup', to: 'popup' },
        'src/manifest.json'
      ]
    }),
    new MiniCssExtractPlugin({
      filename: 'css/styles.css'
    })
  ],
  devtool: 'cheap-module-source-map'
}
