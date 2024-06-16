/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/options/**/*.tsx", "./src/popup/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        primary: "#1B73E8",
      },
    },
  },
  plugins: [],
};
