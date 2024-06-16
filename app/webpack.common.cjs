const path = require("path");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  target: "web",
  entry: {
    background: "./src/background/index.ts",
    content: [
      "./src/content_scripts/index.ts",
      "./src/content_scripts/core/index.ts",
    ],
    popup: {
      filename: "./popup/index.js",
      import: "./src/popup/src/main.tsx",
    },
    options: {
      filename: "./options/index.js",
      import: "./src/options/src/main.tsx",
    },
    ...getModules(),
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: {
      dry: true,
    },
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        include: [
          path.resolve(__dirname, "src/options"),
          path.resolve(__dirname, "src/popup"),
        ],
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.css$/i,
        exclude: [
          path.resolve(__dirname, "src/options"),
          path.resolve(__dirname, "src/popup"),
        ],
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              ["@babel/preset-react", { runtime: "automatic" }],
              "@babel/preset-typescript",
            ],
          },
        },
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/assets", to: "assets" },
        { from: "src/options/index.html", to: "options" },
        { from: "src/popup/index.html", to: "popup" },
        "src/manifest.json",
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
  ],

  resolve: {
    extensions: [".ts", ".js", ".tsx"],
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
