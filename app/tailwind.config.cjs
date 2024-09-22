/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        primary: "#1B73E8",
      },
      keyframes: {
        "toppings-pop-in": {
          "0%": { opacity: "0", transform: "scale(.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "toppings-pop-in":
          "toppings-pop-in 100ms cubic-bezier(.2, 0, .38, .9) forwards",
      },
    },
  },
  plugins: [],
};
