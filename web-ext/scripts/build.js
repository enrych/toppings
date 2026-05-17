import fs from "node:fs";
import path from "node:path";
import { EXTERNAL_URL } from "../../packages/constants/src/links.ts";
import { EXTENSION_VERSION } from "../../packages/constants/src/version.ts";
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
        import: "./src/popup/index.tsx",
      },
      options: {
        filename: "./options/index.js",
        import: "./src/options/index.tsx",
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
                      darkMode: ["class", '[data-theme="dark"]'],
                      theme: {
                        extend: {
                          // Semantic color tokens backed by CSS variables.
                          // Values come from src/options/index.css (theme.css
                          // section). Use these (e.g. tw-bg-surface) rather
                          // than hardcoded hex values so themes can swap.
                          colors: {
                            bg: "var(--color-bg)",
                            surface: "var(--color-surface)",
                            "surface-2": "var(--color-surface-2)",
                            "surface-hover": "var(--color-surface-hover)",
                            fg: "var(--color-fg)",
                            "fg-muted": "var(--color-fg-muted)",
                            "fg-subtle": "var(--color-fg-subtle)",
                            "border-subtle": "var(--color-border-subtle)",
                            "border-default": "var(--color-border-default)",
                            "border-strong": "var(--color-border-strong)",
                            accent: "var(--color-accent)",
                            "accent-hover": "var(--color-accent-hover)",
                            "accent-fg": "var(--color-accent-fg)",
                            "danger-bg": "var(--color-danger-bg)",
                            "danger-fg": "var(--color-danger-fg)",
                            "success-bg": "var(--color-success-bg)",
                            "success-fg": "var(--color-success-fg)",
                            "info-bg": "var(--color-info-bg)",
                            "info-fg": "var(--color-info-fg)",
                            "warning-bg": "var(--color-warning-bg)",
                            "warning-fg": "var(--color-warning-fg)",
                          },
                        },
                      },
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
          exclude: /node_modules\/(?!@toppings\/(constants|utils)\/)/,
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
              const manifest = JSON.parse(content.toString());
              manifest.version = EXTENSION_VERSION;
              manifest.homepage_url = EXTERNAL_URL.WEBSITE;

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
