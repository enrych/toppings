/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    background: "./src/background/index.ts",
    content: [
      "./src/content_scripts/index.ts",
      "./src/content_scripts/core/index.ts",
    ],
    ...getModules(),
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },

  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },

      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/assets", to: "assets" },
        { from: "src/options", to: "options" },
        { from: "src/popup", to: "popup" },
        "src/manifest.json",
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
  ],

  resolve: {
    extensions: [".ts", ".js", ".svelte"],
  },

  experiments: {
    outputModule: true,
  },
};

function getModules() {
  const modulesPath = path.resolve(__dirname, "src/content_scripts/modules");
  const modulesDirectories = getDirectories(modulesPath);
  const entryPoints = {};

  modulesDirectories.forEach((dir) => {
    entryPoints[dir] = {
      import: path.resolve(modulesPath, dir, "index.ts"),
      filename: "./modules/[name].js",
      library: {
        type: "module",
      },
    };
  });

  return entryPoints;
}

function getDirectories(source) {
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}
