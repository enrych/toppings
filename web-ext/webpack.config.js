const path = require("path");
const { merge } = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { RawSource } = require("webpack-sources");
const packageJson = require("./package.json");

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === "development";
  const browser = env.browser || "chrome";

  const commonConfig = {
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
      new CopyWebpackPlugin({
        patterns: [
          { from: "src/assets", to: "assets" },
          { from: "src/options/index.html", to: "options" },
          { from: "src/popup/index.html", to: "popup" },
          { from: "src/_locales", to: "_locales" },
        ],
      }),
      new GenerateManifestPlugin(browser),
    ],
    resolve: {
      extensions: [".ts", ".tsx"],
    },
    optimization: {
      minimize: false,
    },
  };

  const developmentConfig = {
    mode: "development",
    devtool: "cheap-module-source-map",
  };

  const productionConfig = {
    mode: "production",
  };

  const envConfig = isDevelopment ? developmentConfig : productionConfig;

  return merge(commonConfig, envConfig);
};

class GenerateManifestPlugin {
  constructor(browser = "chrome") {
    this.browser = browser;
  }

  apply(compiler) {
    const pluginName = GenerateManifestPlugin.name;

    const baseManifest = {
      action: {
        default_icon: {
          16: "assets/icons/icon16.png",
          32: "assets/icons/icon32.png",
          48: "assets/icons/icon48.png",
          128: "assets/icons/icon128.png",
        },
        default_title: "__MSG_popupTitle__",
        default_popup: "popup/index.html",
      },
      author: packageJson.author,
      background: {
        service_worker: "/background.js",
      },
      commands: {},
      content_scripts: [
        {
          all_frames: true,
          js: ["/content.js"],
          matches: ["*://*.youtube.com/*"],
          run_at: "document_end",
        },
      ],
      default_locale: "en",
      description: "__MSG_description__",
      homepage_url: "https://enrych.github.io/toppings",
      host_permissions: ["*://*.youtube.com/*"],
      icons: {
        16: "assets/icons/icon16.png",
        32: "assets/icons/icon32.png",
        48: "assets/icons/icon48.png",
        128: "assets/icons/icon128.png",
      },
      manifest_version: 3,
      name: packageJson.name,
      options_ui: {
        open_in_tab: true,
        page: "/options/index.html",
      },
      permissions: ["webNavigation", "storage"],
      short_name: "Toppings",
      version: packageJson.version,
      web_accessible_resources: [
        {
          matches: ["*://*.youtube.com/*"],
          resources: ["assets/*", "options/assets/*"],
        },
      ],
    };

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          const manifest = { ...baseManifest };

          if (this.browser === "firefox") {
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
            manifest.browser_specific_settings = {
              gecko: { id: "toppings@enry.ch" },
            };
          }

          const jsonManifest = JSON.stringify(manifest, null, 2);

          assets["manifest.json"] = new RawSource(jsonManifest);
        },
      );
    });
  }
}
