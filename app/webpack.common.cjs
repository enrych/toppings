const path = require("path");
const fs = require("fs");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env) => {
  const isFirefox = env && env.browser === "firefox";

  return {
    target: "web",
    entry: {
      background: "./src/background/index.ts",
      content: ["./src/content_scripts/index.ts"],
      popup: {
        filename: "./popup/index.js",
        import: "./src/popup/src/index.tsx",
      },
      options: {
        filename: "./options/index.js",
        import: "./src/options/src/index.tsx",
      },
      ...getWebAppsEntry(),
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
                "@babel/preset-react",
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
          {
            from: "src/manifest.json",
            to: "manifest.json",
            transform(content) {
              const manifest = JSON.parse(content.toString());
              if (isFirefox) {
                manifest.manifest_version = 2;

                manifest.background = {
                  scripts: ["/background.js"],
                  persistent: false,
                };

                manifest.permissions = [
                  ...manifest.host_permissions,
                  ...manifest.permissions,
                ];
                delete manifest.host_permissions;

                manifest.browser_action = manifest.action;
                delete manifest.action;

                manifest.web_accessible_resources =
                  manifest.web_accessible_resources.flatMap(
                    (resource) => resource.resources,
                  );
              }
              return JSON.stringify(manifest, null, 2);
            },
          },
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
};

function getWebAppsEntry() {
  const webAppsPath = path.resolve(__dirname, "src/content_scripts/webApps");
  const webApps = getDirectories(webAppsPath);
  const entryPoints = {};

  webApps.forEach((dir) => {
    const indexPath = fs.existsSync(path.resolve(webAppsPath, dir, "index.tsx"))
      ? path.resolve(webAppsPath, dir, "index.tsx")
      : path.resolve(webAppsPath, dir, "index.ts");

    entryPoints[dir] = {
      import: indexPath,
      filename: "./webApps/[name].js",
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
