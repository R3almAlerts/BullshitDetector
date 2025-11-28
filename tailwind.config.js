// tailwind.config.js (append if needed)
module.exports = {
  // ... existing config
  theme: {
    extend: {
      colors: {
        primary: '#007BFF', // Brand accent
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  darkMode: 'class', // Assumes repo supports dark mode
  plugins: [],
};