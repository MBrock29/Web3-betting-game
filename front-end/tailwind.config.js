// tailwind.config.js
module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      xs: "650px",
      sm: "1000px",
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
