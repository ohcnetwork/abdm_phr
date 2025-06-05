/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Figtree", "sans-serif"],
      },
      colors: {
        green: "colors.emerald",
        yellow: "colors.amber",
        danger: "colors.red",
        warning: "colors.amber",
        alert: "colors.violet",
        gray: "colors.gray",
        primary: {
          100: "#def7ec",
          200: "#bcf0da",
          300: "#84e1bc",
          400: "#31c48d",
          500: "#0d9f6e",
          600: "#057a55",
          700: "#046c4e",
          800: "#03543F",
          900: "#014737",
          DEFAULT: "#0d9f6e",
        },
        secondary: {
          50: "#F9FAFB",
          100: "#FBFAFC",
          200: "#F7F5FA",
          300: "#F1EDF7",
          400: "#DFDAE8",
          500: "#BFB8CC",
          600: "#9187A1",
          700: "#7D728F",
          800: "#6A5F7A",
          900: "#453C52",
        },
      },
      scale: {
        25: "0.25",
        175: "1.75",
        200: "2",
      },
    },
  },
  content: ["./src/**/*.{html,md,js,jsx,ts,tsx}", "./index.html"],
  plugins: [],
};
