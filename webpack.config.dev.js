/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: {
    background: './src/scripts/background.ts',
    content: ['./src/scripts/core.ts', './src/scripts/index.ts'],
    styles: ['./src/css/vendor.css', './src/css/youtube.css']
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
        { from: 'src/pages', to: 'pages' },
        'src/manifest.json'
      ]
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css'
    }),
    // Custom clean-webpack-plugin to remove the styles.js file
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('CleanUpStylesJs', () => {
          const stylesJsPath = path.resolve(__dirname, 'build', 'styles.js')
          const fs = require('fs')
          if (fs.existsSync(stylesJsPath)) {
            fs.unlinkSync(stylesJsPath)
          }
        })
      }
    }
  ],
  devtool: 'cheap-module-source-map'
}
