import fs from "node:fs";
import path from "node:path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

export default (env) => {
  return {
    target: "web",
    mode: env.production ? "production" : "development",
    devtool: env.production ? false : "cheap-module-source-map",
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
      path: path.resolve("dist"),
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
          use: [
            "style-loader",
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    tailwindcss({
                      corePlugins: {
                        preflight: false,
                      },
                      content: ["./src/**/*.tsx"],
                      prefix: "tw-",
                    }),
                    autoprefixer,
                  ],
                },
              },
            },
          ],
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
          { from: "src/_locales", to: "_locales" },
          {
            from: "src/manifest.json",
            to: "manifest.json",
            transform(content) {
              const packageJson = JSON.parse(
                fs.readFileSync("package.json", "utf-8"),
              );
              const manifest = JSON.parse(content.toString());
              manifest.version = packageJson.version;

              const isFirefox = env.firefox ? "firefox" : false;
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

                manifest.browser_specific_settings = {
                  gecko: { id: "toppings@enry.ch" },
                };
              }
              return JSON.stringify(manifest, null, 2);
            },
          },
        ],
      }),
    ],
    resolve: {
      extensions: [".ts", ".tsx"],
    },
    optimization: {
      minimize: false,
    },
  };
};
