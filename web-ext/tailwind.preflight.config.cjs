/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("./tailwind.config.cjs")],
  corePlugins: {
    preflight: true,
  },
};
