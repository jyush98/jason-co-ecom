const { color } = require("framer-motion");

// filepath: /path/to/tailwind.config.js
module.exports = {
  darkMode: "class",
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Adjust the paths according to your project structure
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],

      },
      colors: {
        matte: '#0e0e0e',
        gold: '#D4AF37',
        lavish: '#252529',
      },
      spacing: {
        navbar: '165px',
      },
    },
  },
  plugins: [],
};