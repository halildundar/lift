/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{hbs,html,js}"],
  theme: {
    extend: {},
    screens: {
      'mobile-vert': '400px',
       'mobile-horz': '640px',
      'tablet-vert': '640px',
      'tablet-horz': '1024px',
      'desktop-sm': '1280px',
      'desktop': '1580px',
      'desktop-lg': '1900px',
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
  plugins: [
    require("@tailwindcss/line-clamp")
  ],
};
