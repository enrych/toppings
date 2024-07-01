const path = require("path");
const fs = require("fs");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  target: "web",
  entry: {
    background: "./src/background/index.ts",
    content: ["./src/content_scripts/index.ts"],
    popup: {
      filename: "./popup/index.js",
      import: "./src/popup/src/main.tsx",
    },
    options: {
      filename: "./options/index.js",
      import: "./src/options/src/index.tsx",
    },
    ...getWorkers(),
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: {
      dry: true,
    },
    publicPath: "../",
    assetModuleFilename: "assets/images/[hash][ext][query]",
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
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
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
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
  ],

  resolve: {
    extensions: [".ts", ".js", ".tsx"],
  },

  experiments: {
    outputModule: true,
  },
};

function getWorkers() {
  const workersPath = path.resolve(__dirname, "src/content_scripts/workers");
  const workers = getDirectories(workersPath);
  const entryPoints = {};

  workers.forEach((dir) => {
    const indexPath = fs.existsSync(path.resolve(workersPath, dir, "index.tsx"))
      ? path.resolve(workersPath, dir, "index.tsx")
      : path.resolve(workersPath, dir, "index.ts");

    entryPoints[dir] = {
      import: indexPath,
      filename: "./workers/[name].js",
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
